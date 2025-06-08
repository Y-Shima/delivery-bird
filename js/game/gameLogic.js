// ゲームロジック管理クラス
class GameLogic {
    constructor(gameState) {
        this.gameState = gameState;
        this.uiManager = null;
        this.lastUpdateTime = Date.now();
    }
    
    // UIManagerの参照を設定
    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 地球の半径 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    calculateSpeedKmPerSecond(speedLevel) {
        if (speedLevel === 0) return 0;
        
        // スピードレベル5で地球の反対側（20037.5km）まで60秒
        const maxSpeedKmPerSec = GAME_CONFIG.MAX_SPEED_DISTANCE / GAME_CONFIG.MAX_SPEED_TIME;
        return (speedLevel / 5) * maxSpeedKmPerSec;
    }

    // ランダムに世界各地から3つの都市を選択
    generateDestinations() {
        this.gameState.destinations = [];

        // 訪問済み、現在地、スロット内の都市を除外
        const availableCities = WORLD_CITIES.filter(city => {
            if (city.name === this.gameState.currentCity.name || 
                this.gameState.visitedCities.has(city.name)) {
                return false;
            }

            // スロットにある都市は除外
            const inSlot = this.gameState.destinationSlots.some(slot => 
                slot && slot.name === city.name
            );
            return !inSlot;
        });

        if (availableCities.length < 3) {
            console.warn('Not enough available cities for destinations');
            return;
        }

        // ランダムに3つ選択
        const shuffled = [...availableCities].sort(() => Math.random() - 0.5);
        const selectedCities = shuffled.slice(0, 3);

        // 距離を計算
        const citiesWithDistance = selectedCities.map(city => ({
            ...city,
            distance: this.calculateDistance(
                this.gameState.currentCity.lat, this.gameState.currentCity.lng,
                city.lat, city.lng
            )
        }));

        // 距離順にソート（近い順）
        citiesWithDistance.sort((a, b) => a.distance - b.distance);

        // 固定報酬を距離順に割り当て（近い順に$100, $300, $800）
        const rewards = [100, 300, 800];
        this.gameState.destinations = citiesWithDistance.map((city, index) => ({
            ...city,
            reward: rewards[index]
        }));
    }

    updatePlayer() {
        const player = this.gameState.player;
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 秒単位
        this.lastUpdateTime = currentTime;
        
        // スタン状態チェック
        if (player.isStunned && currentTime > player.stunEndTime) {
            player.isStunned = false;
            // スタン終了時に無敵状態を開始
            player.isInvincible = true;
            player.invincibleEndTime = currentTime + GAME_CONFIG.INVINCIBLE_DURATION * 1000;
            console.log('Player became invincible for', GAME_CONFIG.INVINCIBLE_DURATION, 'seconds');
        }

        // 無敵状態チェック
        if (player.isInvincible && currentTime > player.invincibleEndTime) {
            player.isInvincible = false;
            console.log('Player invincibility ended');
        }

        // パワーアップ状態チェック
        if (player.isPoweredUp && currentTime > player.powerUpEndTime) {
            player.isPoweredUp = false;
        }

        // スピード計算
        let currentSpeedKmPerSec = this.calculateSpeedKmPerSecond(player.speedLevel);
        if (player.isPoweredUp) currentSpeedKmPerSec *= 2;
        if (player.isStunned) currentSpeedKmPerSec = 0;

        player.speed = currentSpeedKmPerSec;

        // 移動（フレームレート独立）
        if (player.speed > 0 && deltaTime > 0) {
            const angleRad = (player.angle - 90) * Math.PI / 180;
            const deltaKm = player.speed * deltaTime; // 実際の経過時間に基づく移動距離
            
            // 緯度経度の変化を計算
            const deltaLat = (deltaKm / 111.32) * Math.cos(angleRad); // 1度 ≈ 111.32km
            // 緯度による経度の補正を適用
            const latRad = player.lat * Math.PI / 180;
            const deltaLng = (deltaKm / (111.32 * Math.cos(latRad))) * Math.sin(angleRad);
            
            player.lat += deltaLat;
            player.lng += deltaLng;
            
            // 地球の境界をチェック
            player.lat = Math.max(-85, Math.min(85, player.lat));
            if (player.lng > 180) player.lng -= 360;
            if (player.lng < -180) player.lng += 360;
        }
    }

    updateEnemies() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 秒単位
        
        this.gameState.enemies.forEach(enemy => {
            const player = this.gameState.player;
            
            // 敵の速度をプレイヤーのスピードレベル2相当に設定（常に移動）
            enemy.speed = this.calculateSpeedKmPerSecond(2); // スピードレベル2固定
            
            switch (enemy.type) {
                case 0: // 赤: プレイヤーに向かう
                    const angleToPlayer = Math.atan2(player.lng - enemy.lng, player.lat - enemy.lat) * 180 / Math.PI;
                    enemy.angle = angleToPlayer;
                    break;
                case 1: // 黄: ランダム
                    if (Math.random() < 0.1) {
                        enemy.angle += (Math.random() - 0.5) * 60;
                    }
                    break;
                case 2: // 青: 先回り
                    const predictedLat = player.lat + Math.cos((player.angle - 90) * Math.PI / 180) * player.speed * 0.01;
                    const predictedLng = player.lng + Math.sin((player.angle - 90) * Math.PI / 180) * player.speed * 0.01;
                    const angleToPredict = Math.atan2(predictedLng - enemy.lng, predictedLat - enemy.lat) * 180 / Math.PI;
                    enemy.angle = angleToPredict;
                    break;
            }

            // 敵の移動（フレームレート独立）
            if (deltaTime > 0) {
                const angleRad = (enemy.angle - 90) * Math.PI / 180;
                const deltaKm = enemy.speed * deltaTime; // 実際の経過時間に基づく移動距離
                const deltaLat = (deltaKm / 111.32) * Math.cos(angleRad);
                // 緯度による経度の補正を適用
                const latRad = enemy.lat * Math.PI / 180;
                const deltaLng = (deltaKm / (111.32 * Math.cos(latRad))) * Math.sin(angleRad);
                
                enemy.lat += deltaLat;
                enemy.lng += deltaLng;
                
                // 境界チェック
                enemy.lat = Math.max(-85, Math.min(85, enemy.lat));
                if (enemy.lng > 180) enemy.lng -= 360;
                if (enemy.lng < -180) enemy.lng += 360;
            }
        });
    }

    checkCollisions() {
        const player = this.gameState.player;

        // 敵との衝突チェック
        this.gameState.enemies.forEach(enemy => {
            const distance = this.calculateDistance(player.lat, player.lng, enemy.lat, enemy.lng);
            // 無敵状態でない場合のみ衝突判定
            if (distance < 50 && !player.isStunned && !player.isInvincible) { // 50km以内で衝突
                player.isStunned = true;
                player.stunEndTime = Date.now() + GAME_CONFIG.STUN_DURATION * 1000;
                console.log('Player stunned by enemy collision');
            }
        });

        // パワーアップとの衝突チェック
        this.gameState.powerUps = this.gameState.powerUps.filter(powerUp => {
            const distance = this.calculateDistance(player.lat, player.lng, powerUp.lat, powerUp.lng);
            if (distance < 50) {
                player.isPoweredUp = true;
                player.powerUpEndTime = Date.now() + GAME_CONFIG.POWERUP_DURATION * 1000;
                return false; // パワーアップを削除
            }
            return true;
        });
    }

    // 目的地への到着チェック
    checkDestinationArrival() {
        const player = this.gameState.player;
        const arrivedDestinations = [];

        this.gameState.destinationSlots.forEach((destination, index) => {
            if (destination) {
                const distance = this.calculateDistance(
                    player.lat, player.lng,
                    destination.lat, destination.lng
                );

                if (distance <= GAME_CONFIG.ARRIVAL_DISTANCE) {
                    arrivedDestinations.push({ destination, slotIndex: index });
                }
            }
        });

        return arrivedDestinations;
    }

    // 寄り道都市への到着チェック
    checkDetourArrival() {
        if (this.gameState.isSlotsFull() || this.gameState.isDetourModalOpen) {
            return null;
        }

        const player = this.gameState.player;
        
        // 寄り道可能な都市（スロットにない、訪問済みでない、現在地でない都市）
        const availableCities = WORLD_CITIES.filter(city => {
            if (city.name === this.gameState.currentCity.name || 
                this.gameState.visitedCities.has(city.name)) {
                return false;
            }

            const inSlot = this.gameState.destinationSlots.some(slot => 
                slot && slot.name === city.name
            );
            if (inSlot) return false;

            const distance = this.calculateDistance(
                player.lat, player.lng,
                city.lat, city.lng
            );

            return distance <= GAME_CONFIG.ARRIVAL_DISTANCE; // 到着判定距離内
        });

        if (availableCities.length > 0) {
            // 最も近い都市を選択
            const closest = availableCities.reduce((closest, city) => {
                const distanceToCity = this.calculateDistance(
                    player.lat, player.lng,
                    city.lat, city.lng
                );
                const distanceToClosest = this.calculateDistance(
                    player.lat, player.lng,
                    closest.lat, closest.lng
                );
                return distanceToCity < distanceToClosest ? city : closest;
            });

            return closest;
        }

        return null;
    }

    // 寄り道可能な都市の3つの選択肢を生成（都市への配達）
    generateDetourOptions(detourCity) {
        // 配達可能な都市を選択（訪問済み、スロット内、現在地を除外）
        const availableCities = WORLD_CITIES.filter(city => {
            if (city.name === detourCity.name || 
                city.name === this.gameState.currentCity.name ||
                this.gameState.visitedCities.has(city.name)) {
                return false;
            }

            const inSlot = this.gameState.destinationSlots.some(slot => 
                slot && slot.name === city.name
            );
            return !inSlot;
        });

        if (availableCities.length < 3) {
            return null; // 選択肢が足りない場合
        }

        // ランダムに3つ選択
        const shuffled = [...availableCities].sort(() => Math.random() - 0.5);
        const selectedCities = shuffled.slice(0, 3);

        // 距離を計算
        const citiesWithDistance = selectedCities.map(city => ({
            ...city,
            distance: this.calculateDistance(
                detourCity.lat, detourCity.lng,
                city.lat, city.lng
            )
        }));

        // 距離順にソート（近い順）
        citiesWithDistance.sort((a, b) => a.distance - b.distance);

        // 固定報酬を距離順に割り当て（近い順に$100, $300, $800）
        const rewards = [100, 300, 800];
        return citiesWithDistance.map((city, index) => ({
            ...city,
            reward: rewards[index]
        }));
    }

    // 目的地に到着
    arriveAtDestination(destination, slotIndex) {
        // 訪問済みに追加
        this.gameState.visitedCities.add(destination.name);
        
        // 現在地を更新
        this.gameState.currentCity = destination;
        this.gameState.player.lat = destination.lat;
        this.gameState.player.lng = destination.lng;
        
        // スピードを0にする
        this.gameState.player.speedLevel = 0;
        
        // スコア加算
        this.gameState.score += destination.reward;
        
        // 都市到着モーダルを表示
        if (this.uiManager) {
            this.uiManager.showCityArrivalModal(destination, destination.reward);
        }
        
        // スロットから削除
        this.gameState.destinationSlots[slotIndex] = null;
        
        return true;
    }

    // 寄り道で配達を受ける
    acceptDetour(detourCity) {
        console.log('Accepting detour to:', detourCity.name); // デバッグ用
        
        // スロットに追加
        if (this.gameState.addToSlot(detourCity)) {
            console.log('Added to slot successfully'); // デバッグ用
            return true;
        }
        
        console.log('Failed to add to slot'); // デバッグ用
        return false;
    }

    spawnEnemies() {
        this.gameState.enemies = [];
        // ゲームモードに応じた敵の数を計算
        const enemyCount = GAME_CONFIG.ENEMY_COUNT * currentGameMode.enemyMultiplier;
        
        // 敵鳥を画面外から生成
        for (let i = 0; i < enemyCount; i++) {
            // 画面外のランダムな位置に生成
            const angle = Math.random() * 360;
            const distance = GAME_CONFIG.ENEMY_SPAWN_DISTANCE;
            const angleRad = angle * Math.PI / 180;
            
            const enemyLat = this.gameState.player.lat + (distance / 111.32) * Math.cos(angleRad);
            const enemyLng = this.gameState.player.lng + (distance / 111.32) * Math.sin(angleRad);
            
            this.gameState.enemies.push({
                lat: enemyLat,
                lng: enemyLng,
                angle: Math.random() * 360,
                speed: this.calculateSpeedKmPerSecond(2), // スピードレベル2固定
                type: Math.floor(Math.random() * 3), // 0: 赤, 1: 黄, 2: 青
                targetLat: this.gameState.player.lat,
                targetLng: this.gameState.player.lng
            });
        }
    }

    // 敵の数を維持する
    maintainEnemyCount() {
        const player = this.gameState.player;
        
        // 画面外に出た敵を削除
        this.gameState.enemies = this.gameState.enemies.filter(enemy => {
            const distance = this.calculateDistance(player.lat, player.lng, enemy.lat, enemy.lng);
            return distance <= GAME_CONFIG.ENEMY_SPAWN_DISTANCE * 1.2; // 少し余裕を持たせる
        });

        // 敵の数が足りない場合は補充
        while (this.gameState.enemies.length < GAME_CONFIG.ENEMY_COUNT) {
            // 画面外のランダムな位置に生成
            const angle = Math.random() * 360;
            const distance = GAME_CONFIG.ENEMY_SPAWN_DISTANCE * (0.8 + Math.random() * 0.4); // 距離にばらつきを持たせる
            const angleRad = angle * Math.PI / 180;
            
            const enemyLat = player.lat + (distance / 111.32) * Math.cos(angleRad);
            const enemyLng = player.lng + (distance / 111.32) * Math.sin(angleRad);
            
            this.gameState.enemies.push({
                lat: enemyLat,
                lng: enemyLng,
                angle: Math.random() * 360,
                speed: this.calculateSpeedKmPerSecond(2), // スピードレベル2固定
                type: Math.floor(Math.random() * 3),
                targetLat: player.lat,
                targetLng: player.lng
            });
        }
    }

    spawnPowerUps() {
        this.gameState.powerUps = [];
        // パワーアップアイテムを生成
        if (Math.random() < 0.3) { // 30%の確率
            this.gameState.powerUps.push({
                lat: this.gameState.player.lat + (Math.random() - 0.5) * 10,
                lng: this.gameState.player.lng + (Math.random() - 0.5) * 10
            });
        }
    }
}
