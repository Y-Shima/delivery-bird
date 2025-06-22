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

    // パワーアップアイテムをランダムに配置
    generatePowerups() {
        console.log('Starting powerup generation...');
        const powerups = [];
        const maxAttempts = 1000; // 無限ループを防ぐ
        
        while (powerups.length < GAME_CONFIG.POWERUP_COUNT) {
            let attempts = 0;
            let validLocation = false;
            
            while (!validLocation && attempts < maxAttempts) {
                // ランダムな緯度経度を生成
                const lat = (Math.random() - 0.5) * 160; // -80 to 80 (極地を避ける)
                const lng = (Math.random() - 0.5) * 360; // -180 to 180
                
                // 全ての都市から500km以上離れているかチェック
                let farEnoughFromCities = true;
                for (const city of WORLD_CITIES) {
                    const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
                    if (distance < GAME_CONFIG.POWERUP_MIN_DISTANCE_FROM_CITY) {
                        farEnoughFromCities = false;
                        break;
                    }
                }
                
                // 他のパワーアップアイテムから200km以上離れているかチェック
                let farEnoughFromOtherPowerups = true;
                for (const powerup of powerups) {
                    const distance = this.calculateDistance(lat, lng, powerup.lat, powerup.lng);
                    if (distance < 200) {
                        farEnoughFromOtherPowerups = false;
                        break;
                    }
                }
                
                if (farEnoughFromCities && farEnoughFromOtherPowerups) {
                    powerups.push({
                        id: powerups.length,
                        lat: lat,
                        lng: lng,
                        collected: false
                    });
                    validLocation = true;
                }
                
                attempts++;
            }
            
            // 最大試行回数に達した場合は諦める
            if (attempts >= maxAttempts) {
                console.warn(`パワーアップアイテム生成: ${powerups.length}個で停止（最大試行回数に達しました）`);
                break;
            }
        }
        
        console.log(`パワーアップアイテム ${powerups.length}個を生成しました`);
        return powerups;
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
        if (player.isPoweredUp && currentTime > player.powerupEndTime) {
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
        if (!this.gameState.enemies || !Array.isArray(this.gameState.enemies)) {
            this.gameState.enemies = [];
            return;
        }
        
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 秒単位
        
        // 最初の呼び出しまたは異常に大きなdeltaTimeの場合は、適切な値に設定
        const actualDeltaTime = (deltaTime <= 0 || deltaTime > 0.1) ? 1/60 : deltaTime; // 60FPS相当
        
        this.gameState.enemies.forEach((enemy, index) => {
            if (!enemy || !this.gameState.player) {
                return;
            }
            
            const player = this.gameState.player;
            
            // 敵の現在の角度を保存（急回転防止のため）
            let currentAngle = enemy.angle || 0;
            let targetAngle = currentAngle;
            
            // 敵の速度を敵のタイプに応じて設定（常に移動）
            switch (enemy.type) {
                case 0: // 赤: プレイヤーに向かう（スピードレベル3）
                    enemy.speed = this.calculateSpeedKmPerSecond(3);
                    targetAngle = Math.atan2(player.lng - enemy.lng, player.lat - enemy.lat) * 180 / Math.PI;
                    break;
                case 1: // 黄: ランダム（スピードレベル2）
                    enemy.speed = this.calculateSpeedKmPerSecond(2);
                    // より頻繁に方向転換（5%の確率で方向変更、小さな角度変更）
                    if (Math.random() < 0.05) {
                        targetAngle = currentAngle + (Math.random() - 0.5) * 30; // 最大15度の変更
                    } else {
                        targetAngle = currentAngle; // 現在の方向を維持
                    }
                    break;
                case 2: // 青: 先回り（スピードレベル2）
                    enemy.speed = this.calculateSpeedKmPerSecond(2);
                    // プレイヤーの進行方向を予測して先回り
                    if (player.speed > 0) {
                        const predictDistance = player.speed * 3; // 3秒先を予測
                        const predictedLat = player.lat + Math.cos((player.angle - 90) * Math.PI / 180) * (predictDistance / 111.32);
                        const predictedLng = player.lng + Math.sin((player.angle - 90) * Math.PI / 180) * (predictDistance / 111.32);
                        targetAngle = Math.atan2(predictedLng - enemy.lng, predictedLat - enemy.lat) * 180 / Math.PI;
                    } else {
                        // プレイヤーが停止している場合は直接向かう
                        targetAngle = Math.atan2(player.lng - enemy.lng, player.lat - enemy.lat) * 180 / Math.PI;
                    }
                    break;
            }
            
            // 角度の正規化（-180 to 180）
            while (targetAngle > 180) targetAngle -= 360;
            while (targetAngle < -180) targetAngle += 360;
            while (currentAngle > 180) currentAngle -= 360;
            while (currentAngle < -180) currentAngle += 360;
            
            // 急回転を防ぐ（最大回転速度を制限）
            let angleDiff = targetAngle - currentAngle;
            if (angleDiff > 180) angleDiff -= 360;
            if (angleDiff < -180) angleDiff += 360;
            
            const maxTurnRate = 90; // 1秒間に最大90度回転
            const maxTurnThisFrame = maxTurnRate * actualDeltaTime;
            
            if (Math.abs(angleDiff) > maxTurnThisFrame) {
                angleDiff = angleDiff > 0 ? maxTurnThisFrame : -maxTurnThisFrame;
            }
            
            enemy.angle = currentAngle + angleDiff;
            
            // 敵の移動（フレームレート独立）
            if (actualDeltaTime > 0 && enemy.speed > 0) {
                // 敵の進行方向を270度右回りに調整（180度回転）
                const angleRad = (enemy.angle + 180) * Math.PI / 180;
                const deltaKm = enemy.speed * actualDeltaTime; // 実際の経過時間に基づく移動距離
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
        
        // lastUpdateTime を更新
        this.lastUpdateTime = currentTime;
    }

    checkCollisions() {
        const player = this.gameState.player;

        // パワーアップアイテムとの収集判定
        if (this.gameState.powerups && Array.isArray(this.gameState.powerups)) {
            this.gameState.powerups.forEach(powerup => {
                if (!powerup.collected) {
                    const distance = this.calculateDistance(player.lat, player.lng, powerup.lat, powerup.lng);
                    if (distance < 100) { // 100km以内で収集
                        powerup.collected = true;
                        // パワーアップ効果を適用
                        player.isPoweredUp = true;
                        player.powerupEndTime = Date.now() + GAME_CONFIG.POWERUP_DURATION * 1000;
                        console.log('Powerup collected! Player powered up for', GAME_CONFIG.POWERUP_DURATION, 'seconds');
                        
                        // UIに通知
                        if (this.uiManager) {
                            this.uiManager.showPowerupMessage();
                        }
                    }
                }
            });
        }

        // 敵との衝突チェック
        if (this.gameState.enemies && Array.isArray(this.gameState.enemies)) {
            this.gameState.enemies.forEach(enemy => {
                if (enemy && typeof enemy.lat === 'number' && typeof enemy.lng === 'number') {
                    const distance = this.calculateDistance(player.lat, player.lng, enemy.lat, enemy.lng);
                    // 無敵状態でない場合のみ衝突判定
                    if (distance < 50 && !player.isStunned && !player.isInvincible) { // 50km以内で衝突
                        player.isStunned = true;
                        player.stunEndTime = Date.now() + GAME_CONFIG.STUN_DURATION * 1000;
                        console.log('Player stunned by enemy collision');
                    }
                }
            });
        }

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
        const enemyCount = GAME_CONFIG.ENEMY_COUNT * (typeof currentGameMode !== 'undefined' ? currentGameMode.enemyMultiplier : 1);
        
        // 敵鳥を画面外から生成
        for (let i = 0; i < enemyCount; i++) {
            // 画面外のランダムな位置に生成
            const angle = Math.random() * 360;
            const distance = GAME_CONFIG.ENEMY_SPAWN_DISTANCE;
            const angleRad = angle * Math.PI / 180;
            
            const enemyLat = this.gameState.player.lat + (distance / 111.32) * Math.cos(angleRad);
            const enemyLng = this.gameState.player.lng + (distance / 111.32) * Math.sin(angleRad);
            
            const enemyType = Math.floor(Math.random() * 3); // 0: 赤, 1: 黄, 2: 青
            const enemySpeed = enemyType === 0 ? this.calculateSpeedKmPerSecond(3) : this.calculateSpeedKmPerSecond(2);
            
            this.gameState.enemies.push({
                lat: enemyLat,
                lng: enemyLng,
                angle: Math.random() * 360, // 初期角度
                speed: enemySpeed, // タイプに応じた速度
                type: enemyType,
                targetLat: this.gameState.player.lat,
                targetLng: this.gameState.player.lng
            });
        }
    }

    // 敵の数を維持する
    maintainEnemyCount() {
        const player = this.gameState.player;
        
        // ゲームモードに応じた敵の数を計算
        const targetEnemyCount = GAME_CONFIG.ENEMY_COUNT * (typeof currentGameMode !== 'undefined' ? currentGameMode.enemyMultiplier : 1);
        
        // 画面外に出た敵を削除
        this.gameState.enemies = this.gameState.enemies.filter(enemy => {
            const distance = this.calculateDistance(player.lat, player.lng, enemy.lat, enemy.lng);
            return distance <= GAME_CONFIG.ENEMY_SPAWN_DISTANCE * 1.5; // 少し余裕を持たせる
        });

        // 敵の数が足りない場合は補充
        while (this.gameState.enemies.length < targetEnemyCount) {
            // 画面外のランダムな位置に生成
            const angle = Math.random() * 360;
            const distance = GAME_CONFIG.ENEMY_SPAWN_DISTANCE * (0.8 + Math.random() * 0.4); // 距離にばらつきを持たせる
            const angleRad = angle * Math.PI / 180;
            
            const enemyLat = player.lat + (distance / 111.32) * Math.cos(angleRad);
            const enemyLng = player.lng + (distance / 111.32) * Math.sin(angleRad);
            
            const enemyType = Math.floor(Math.random() * 3); // 0: 赤, 1: 黄, 2: 青
            const enemySpeed = enemyType === 0 ? this.calculateSpeedKmPerSecond(3) : this.calculateSpeedKmPerSecond(2);
            
            this.gameState.enemies.push({
                lat: enemyLat,
                lng: enemyLng,
                angle: Math.random() * 360, // 初期角度
                speed: enemySpeed, // タイプに応じた速度
                type: enemyType,
                targetLat: player.lat,
                targetLng: player.lng
            });
        }
    }
}
