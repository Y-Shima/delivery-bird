// メインゲームクラス
class DeliveryBirdGame {
    constructor() {
        this.gameState = new GameState();
        this.gameLogic = new GameLogic(this.gameState);
        this.uiManager = new UIManager(this.gameState);
        
        // GameLogicにUIManagerの参照を設定
        this.gameLogic.setUIManager(this.uiManager);
        
        this.map = null;
        this.canvas = null;
        this.ctx = null;
        this.destinationMarkers = [];
        this.gameLoop = null;
        this.timerInterval = null;
        this.keys = {};
        this.meimeiElement = null;
        this.nameEntryState = null;
        this.detourSelection = 0; // 寄り道モーダルの選択状態（0-3）
        this.frameCount = 0; // フレームカウンター
        
        this.init();
    }

    init() {
        this.initMap();
        this.initCanvas();
        this.initEventListeners();
        this.meimeiElement = document.getElementById('meimei-center');
        this.gameLogic.generateDestinations();
        this.uiManager.updateUI();
        this.uiManager.createLanguageSelector();
    }

    initMap() {
        // 地図の操作を完全に無効化
        this.map = L.map('map', {
            center: [this.gameState.player.lat, this.gameState.player.lng],
            zoom: GAME_CONFIG.MAP_ZOOM,
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false
        });

        // より詳細な地図タイル
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: ''
        }).addTo(this.map);

        // 地図の中心を常にプレイヤー位置に固定
        this.updateMapCenter();
    }

    updateMapCenter() {
        this.map.setView([this.gameState.player.lat, this.gameState.player.lng], GAME_CONFIG.MAP_ZOOM, {
            animate: false
        });
    }

    initCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    initEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // UI イベント
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('title-btn').addEventListener('click', () => this.returnToTitle());
    }

    handleKeyPress(e) {
        if (!this.gameState.isPlaying) {
            if (e.code === 'Space' || e.code === 'Enter') {
                if (document.getElementById('start-screen').style.display !== 'none') {
                    this.startGame();
                }
            }
            return;
        }

        // 都市到着モーダルが表示されている場合
        if (!document.getElementById('city-arrival-modal').classList.contains('hidden')) {
            e.preventDefault();
            if (e.code === 'Space' || e.code === 'Enter') {
                this.uiManager.hideCityArrivalModal();
            }
            return;
        }

        // 名前入力中の場合（統合画面内）
        if (this.nameEntryState && !document.getElementById('name-entry-section').classList.contains('hidden')) {
            console.log('Name entry key pressed:', e.code); // デバッグ用
            this.handleNameEntryKeyPress(e);
            return;
        }

        // ゲームオーバー画面が表示されている場合
        if (this.gameState.isGameOver && !document.getElementById('game-over-screen').classList.contains('hidden')) {
            e.preventDefault();
            console.log('Game over screen key pressed:', e.code); // デバッグ用
            switch (e.code) {
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'Space':
                case 'Enter':
                case 'KeyR':
                    this.restartGame();
                    break;
                case 'KeyT':
                case 'Escape':
                    this.returnToTitle();
                    break;
            }
            return;
        }

        // 寄り道モーダルが開いている場合
        if (this.gameState.isDetourModalOpen) {
            e.preventDefault(); // デフォルト動作を防ぐ
            switch (e.code) {
                case 'ArrowUp':
                    this.gameState.selectedDetourIndex = Math.max(0, this.gameState.selectedDetourIndex - 1);
                    this.uiManager.updateDetourSelection();
                    break;
                case 'ArrowDown':
                    this.gameState.selectedDetourIndex = Math.min(3, this.gameState.selectedDetourIndex + 1);
                    this.uiManager.updateDetourSelection();
                    break;
                case 'Space':
                case 'Enter':
                    this.confirmDetour();
                    break;
                case 'Escape':
                    this.declineDetour();
                    break;
            }
            return;
        }

        // 配達先選択モーダルが開いている場合
        if (this.gameState.isDestinationModalOpen) {
            e.preventDefault(); // デフォルト動作を防ぐ
            switch (e.code) {
                case 'ArrowUp':
                    this.gameState.selectedDestinationIndex = Math.max(0, this.gameState.selectedDestinationIndex - 1);
                    this.uiManager.updateDestinationSelection();
                    break;
                case 'ArrowDown':
                    this.gameState.selectedDestinationIndex = Math.min(2, this.gameState.selectedDestinationIndex + 1);
                    this.uiManager.updateDestinationSelection();
                    break;
                case 'Space':
                case 'Enter':
                    this.confirmDestination();
                    break;
                case 'Escape':
                    this.closeDestinationModal();
                    break;
            }
            return;
        }

        // ゲーム中のキー操作
        switch (e.code) {
            case 'ArrowLeft':
                this.gameState.player.angle -= 15;
                this.updateMeimeiRotation();
                break;
            case 'ArrowRight':
                this.gameState.player.angle += 15;
                this.updateMeimeiRotation();
                break;
            case 'ArrowUp':
                this.gameState.player.speedLevel = Math.min(5, this.gameState.player.speedLevel + 1);
                this.uiManager.updateUI();
                break;
            case 'ArrowDown':
                this.gameState.player.speedLevel = Math.max(0, this.gameState.player.speedLevel - 1);
                this.uiManager.updateUI();
                break;
            case 'Space':
                // 目的地選択は最初と到着時のみ可能
                if (this.gameState.canSelectDestination) {
                    this.openDestinationModal();
                }
                break;
            case 'KeyG': // Gキーでタイムを残り1秒にする（テスト用）
                if (this.gameState.isPlaying) {
                    console.log('Test: Setting time to 1 second (rank out)');
                    this.gameState.timeLeft = 1;
                    this.gameState.score = -100; // 確実にランク外になる負のスコア
                    this.uiManager.updateUI();
                }
                break;
            case 'KeyH': // Hキーでハイスコアテスト
                if (this.gameState.isPlaying) {
                    console.log('Test: Setting high score and 1 second (rank in)');
                    this.gameState.timeLeft = 1;
                    this.gameState.score = 5000; // テスト用に高いスコアを設定してランクインをテスト
                    this.uiManager.updateUI();
                }
                break;
            case 'KeyR': // Rキーでランキングリセット（テスト用）
                if (this.gameState.isPlaying) {
                    console.log('Test: Resetting ranking');
                    localStorage.removeItem('delivery-bird-ranking');
                    this.gameState.ranking = this.gameState.loadRanking();
                    console.log('New ranking:', this.gameState.ranking);
                }
                break;
            case 'KeyE': // Eキーで敵との衝突テスト
                if (this.gameState.isPlaying) {
                    console.log('Test: Forcing enemy collision');
                    const player = this.gameState.player;
                    if (!player.isStunned && !player.isInvincible) {
                        player.isStunned = true;
                        player.stunEndTime = Date.now() + GAME_CONFIG.STUN_DURATION * 1000;
                        console.log('Player stunned for testing');
                    }
                }
                break;
        }
    }

    updateMeimeiRotation() {
        if (this.meimeiElement) {
            this.meimeiElement.style.transform = `translate(-50%, -50%) rotate(${this.gameState.player.angle}deg)`;
        }
    }

    updateMeimeiState() {
        if (!this.meimeiElement) return;

        const player = this.gameState.player;
        let emoji = '🐦';
        let className = '';

        if (player.isStunned) {
            emoji = '😵';
            className = 'stunned';
        } else if (player.isInvincible) {
            emoji = '🐦';
            className = 'invincible';
        } else if (player.isPoweredUp) {
            emoji = '⚡🐦';
            className = 'powered-up';
        }

        this.meimeiElement.textContent = emoji;
        this.meimeiElement.className = className;
        this.updateMeimeiRotation();
    }

    startGame() {
        document.getElementById('start-screen').style.display = 'none';
        this.gameState.reset();
        this.gameState.isPlaying = true;
        this.gameState.visitedCities.clear();
        this.gameState.canSelectDestination = true;
        
        this.gameLogic.generateDestinations();
        this.gameLogic.spawnEnemies();
        this.gameLogic.spawnPowerUps();
        this.updateMapCenter();
        this.updateMeimeiState();
        this.addDestinationMarkers();
        
        // 最初の配達先選択画面をすぐに表示
        this.openDestinationModal();
        
        this.gameLoop = setInterval(() => this.update(), 1000 / 60); // 60 FPS
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    restartGame() {
        console.log('Restarting game - step 1: cleanup'); // デバッグ用
        
        // 既存のゲームループを停止
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // ゲーム状態をリセット
        this.gameState.reset();
        
        // ゲームオーバー画面を隠す
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('name-entry-section').classList.add('hidden');
        
        // マーカーをクリア
        this.clearDestinationMarkers();
        
        // 名前入力状態をクリア
        this.nameEntryState = null;
        
        console.log('Restarting game - step 2: generating destinations'); // デバッグ用
        
        // 新しい配達先を生成
        this.gameLogic.generateDestinations();
        
        console.log('Restarting game - step 3: updating UI'); // デバッグ用
        
        // UIを更新
        this.uiManager.updateUI();
        
        console.log('Restarting game - step 4: starting game directly'); // デバッグ用
        
        // スタート画面を確実に隠す
        document.getElementById('start-screen').style.display = 'none';
        
        // ゲーム状態を開始状態に設定
        this.gameState.isPlaying = true;
        this.gameState.canSelectDestination = true;
        
        // 敵とパワーアップを生成
        this.gameLogic.spawnEnemies();
        this.gameLogic.spawnPowerUps();
        
        // マップとプレイヤー状態を更新
        this.updateMapCenter();
        this.updateMeimeiState();
        this.addDestinationMarkers();
        
        // 配達先選択画面を表示
        this.openDestinationModal();
        
        // ゲームループを開始
        this.gameLoop = setInterval(() => this.update(), 1000 / 60); // 60 FPS
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        console.log('Restarting game - completed'); // デバッグ用
    }

    returnToTitle() {
        console.log('Returning to title'); // デバッグ用
        // ゲーム状態をリセット
        this.gameState.reset();
        
        // 全てのモーダルを閉じる
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('name-entry-section').classList.add('hidden');
        document.getElementById('destination-modal').classList.add('hidden');
        document.getElementById('detour-modal').classList.add('hidden');
        
        // ゲームループを停止
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // マーカーをクリア
        this.clearDestinationMarkers();
        
        // 名前入力状態をクリア
        this.nameEntryState = null;
        
        // UIを更新
        this.gameLogic.generateDestinations();
        this.uiManager.updateUI();
        
        // タイトル画面を表示
        document.getElementById('start-screen').style.display = 'flex';
    }

    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused || 
            this.gameState.isDestinationModalOpen || this.gameState.isDetourModalOpen) return;

        this.frameCount++;

        this.gameLogic.updatePlayer();
        this.gameLogic.updateEnemies();
        this.gameLogic.maintainEnemyCount(); // 敵の数を維持
        this.gameLogic.checkCollisions();
        
        // 目的地到着チェック
        const arrivedDestinations = this.gameLogic.checkDestinationArrival();
        if (arrivedDestinations.length > 0) {
            // 最初に到着した目的地を処理
            const { destination, slotIndex } = arrivedDestinations[0];
            this.gameLogic.arriveAtDestination(destination, slotIndex);
            this.updateMapCenter();
            this.updateDestinationMarkers();
            this.uiManager.updateUI();
            
            // 新しい配達先を生成して選択画面を表示
            this.gameLogic.generateDestinations();
            setTimeout(() => {
                this.openDestinationModal();
            }, 500);
        }

        // 寄り道都市への到着チェック
        const detourCity = this.gameLogic.checkDetourArrival();
        if (detourCity) {
            console.log('Arrived at detour city:', detourCity.name);
            this.gameState.player.speedLevel = 0; // スピードを0にする
            const detourOptions = this.gameLogic.generateDetourOptions(detourCity);
            if (detourOptions && detourOptions.length === 3) {
                this.showDetourModal(detourOptions, detourCity);
            } else {
                // 選択肢が足りない場合はそのまま通過
                this.gameState.currentCity = detourCity;
                this.gameState.player.lat = detourCity.lat;
                this.gameState.player.lng = detourCity.lng;
                this.updateMapCenter();
            }
        }
        
        this.updateMapCenter();
        this.updateMeimeiState();
        
        // マーカーを定期的に更新（60フレームに1回）
        if (this.frameCount % 60 === 0) {
            this.updateDestinationMarkers();
        }
        
        this.render();
    }

    updateTimer() {
        if (!this.gameState.isPlaying) return;

        this.gameState.timeLeft--;
        if (this.gameState.timeLeft <= 0) {
            this.endGame();
        }
        this.uiManager.updateUI();
    }

    endGame() {
        console.log('End Game triggered'); // デバッグ用
        this.gameState.isPlaying = false;
        this.gameState.isGameOver = true; // ゲームオーバー状態を設定
        clearInterval(this.gameLoop);
        clearInterval(this.timerInterval);

        // ランキングチェック（同じスコアの場合はランク外とする）
        const finalScore = this.gameState.score;
        const rankPosition = this.gameState.ranking.findIndex(entry => finalScore > entry.score);
        
        console.log('Final score:', finalScore); // デバッグ用
        console.log('Rank position:', rankPosition); // デバッグ用
        console.log('Current ranking:', this.gameState.ranking.map(r => r.score)); // デバッグ用
        
        // 統合されたゲームオーバー画面を表示
        this.uiManager.showGameOverScreen(rankPosition);
        
        if (rankPosition !== -1) {
            // ランクイン - 名前入力セクションを表示
            console.log('Rank in detected, showing name entry section');
            this.initNameEntry(rankPosition);
        } else {
            // ランク外 - 名前入力セクションは非表示のまま
            console.log('Rank out detected, name entry section hidden');
        }
    }

    // 寄り道関連のメソッド
    showDetourModal(detourOptions, detourCity) {
        this.gameState.isDetourModalOpen = true;
        this.gameState.detourCities = detourOptions;
        this.gameState.detourCity = detourCity; // 到着した都市
        this.gameState.selectedDetourIndex = 0; // デフォルトで最初の選択肢を選択
        this.uiManager.showDetourModal(detourOptions, detourCity);
    }

    confirmDetour() {
        if (this.gameState.selectedDetourIndex === 3) {
            // 「依頼を断る」を選択
            this.declineDetour();
        } else {
            // 配達を受ける
            const selectedOption = this.gameState.detourCities[this.gameState.selectedDetourIndex];
            this.acceptDetour(selectedOption);
        }
    }

    acceptDetour(selectedCity) {
        console.log('Accepting detour to city:', selectedCity.name);
        
        // 到着した都市を現在地に設定
        this.gameState.currentCity = this.gameState.detourCity;
        this.gameState.player.lat = this.gameState.detourCity.lat;
        this.gameState.player.lng = this.gameState.detourCity.lng;
        
        // 選択した都市への配達をスロットに追加
        if (this.gameLogic.acceptDetour(selectedCity)) {
            this.updateMapCenter();
            this.updateDestinationMarkers();
            this.uiManager.updateUI();
        }
        this.hideDetourModal();
    }

    declineDetour() {
        // 到着した都市を現在地に設定（配達は受けない）
        this.gameState.currentCity = this.gameState.detourCity;
        this.gameState.player.lat = this.gameState.detourCity.lat;
        this.gameState.player.lng = this.gameState.detourCity.lng;
        this.updateMapCenter();
        
        this.hideDetourModal();
    }

    hideDetourModal() {
        this.gameState.isDetourModalOpen = false;
        this.gameState.detourCities = null;
        this.gameState.detourCity = null;
        this.gameState.selectedDetourIndex = 0;
        this.uiManager.hideDetourModal();
    }

    // 他のメソッドは次のファイルで続く...
}
