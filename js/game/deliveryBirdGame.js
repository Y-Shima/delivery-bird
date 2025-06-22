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
        this.powerupMarkers = []; // パワーアップマーカー配列を追加
        this.gameLoop = null;
        this.timerInterval = null;
        this.lastUpdateTime = 0; // 最後の更新時刻
        this.keys = {};
        this.meimeiElement = null;
        this.detourSelection = 0; // 寄り道モーダルの選択状態（0-3）
        this.frameCount = 0; // フレームカウンター
        this.ignoreKeyInput = false; // キー入力を一時的に無視するフラグ
        this.gameOverSelection = 0; // ゲームオーバー画面の選択状態（0: もう一度プレイ, 1: タイトルに戻る）
        
        this.init();
    }

    createManualAttribution() {
        const mapContainer = document.getElementById('map-container');
        
        if (mapContainer) {
            // 既存の手動クレジットがあれば削除
            const existingCredit = document.getElementById('manual-attribution');
            if (existingCredit) {
                existingCredit.remove();
            }
            
            // 手動でクレジット表記を作成
            const attribution = document.createElement('div');
            attribution.id = 'manual-attribution';
            attribution.innerHTML = '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';
            
            // 強制的にスタイルを設定
            attribution.style.cssText = `
                position: absolute !important;
                bottom: 10px !important;
                left: 10px !important;
                background: rgba(255, 255, 255, 0.9) !important;
                padding: 3px 6px !important;
                font-size: 11px !important;
                border-radius: 4px !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
                z-index: 1000 !important;
                max-width: calc(100% - 20px) !important;
                word-wrap: break-word !important;
                font-family: Arial, sans-serif !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                color: black !important;
            `;
            
            // リンクのスタイル
            const link = attribution.querySelector('a');
            if (link) {
                link.style.cssText = `
                    color: #0078A8 !important;
                    text-decoration: none !important;
                `;
                link.addEventListener('mouseover', () => {
                    link.style.textDecoration = 'underline';
                });
                link.addEventListener('mouseout', () => {
                    link.style.textDecoration = 'none';
                });
            }
            
            mapContainer.appendChild(attribution);
        }
    }

    // 安全な要素取得のヘルパー関数
    safeGetElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    // 安全にクラスを追加するヘルパー関数
    safeAddClass(id, className) {
        const element = this.safeGetElement(id);
        if (element) {
            element.classList.add(className);
        }
    }

    // 安全にクラスを削除するヘルパー関数
    safeRemoveClass(id, className) {
        const element = this.safeGetElement(id);
        if (element) {
            element.classList.remove(className);
        }
    }

    init() {
        this.initMap();
        this.initCanvas();
        this.initEventListeners();
        this.meimeiElement = document.getElementById('meimei-center');
        this.gameLogic.generateDestinations();
        this.uiManager.updateUI();
    }

    initMap() {
        // 地図の操作を完全に無効化
        this.map = L.map('map', {
            center: [this.gameState.player.lat, this.gameState.player.lng],
            zoom: GAME_CONFIG.MAP_ZOOM,
            zoomControl: false,
            attributionControl: true, // クレジット表記を有効化
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false
        });

        // クレジット表記を左下に配置
        this.map.attributionControl.setPosition('bottomleft');

        // より詳細な地図タイル
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // クレジット表記を確実に表示するための処理
        setTimeout(() => {
            const attribution = document.querySelector('.leaflet-control-attribution');
            if (attribution) {
                // 強制的にスタイルを設定
                attribution.style.cssText = `
                    position: absolute !important;
                    left: 10px !important;
                    bottom: 10px !important;
                    right: auto !important;
                    z-index: 1000 !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    background: rgba(255, 255, 255, 0.9) !important;
                    padding: 3px 6px !important;
                    font-size: 11px !important;
                    border-radius: 4px !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
                    max-width: calc(75vw - 20px) !important;
                    word-wrap: break-word !important;
                    font-family: Arial, sans-serif !important;
                    color: black !important;
                `;
            } else {
                // 手動でクレジット表記を作成
                this.createManualAttribution();
            }
        }, 500);

        // 地図の中心を常にプレイヤー位置に固定
        this.updateMapCenter();
        
        // 地図の初期化完了後にクレジット表記を確認
        this.map.whenReady(() => {
            setTimeout(() => {
                const attribution = document.querySelector('.leaflet-control-attribution');
                if (!attribution || attribution.offsetWidth === 0 || attribution.offsetHeight === 0) {
                    this.createManualAttribution();
                }
            }, 100);
        });
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

        // UI イベント（要素が存在する場合のみ）
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        const startBtnOld = document.getElementById('start-btn-old');
        if (startBtnOld) {
            startBtnOld.addEventListener('click', () => this.startGame());
        }
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        const titleBtn = document.getElementById('title-btn');
        if (titleBtn) {
            titleBtn.addEventListener('click', () => this.returnToTitle());
        }
    }

    handleKeyPress(e) {
        // タイトル画面が表示されている場合は処理しない
        if (document.getElementById('title-screen').style.display !== 'none') {
            return;
        }
        
        // キー入力を一時的に無視する場合は処理しない
        if (this.ignoreKeyInput) {
            return;
        }
        
        // ゲームオーバー画面が表示されている場合（最優先で処理）
        if (this.gameState.isGameOver && !document.getElementById('game-over-screen').classList.contains('hidden')) {
            e.preventDefault();
            switch (e.code) {
                case 'ArrowLeft':
                    this.gameOverSelection = 0; // もう一度プレイ
                    this.updateGameOverSelection();
                    break;
                case 'ArrowRight':
                    this.gameOverSelection = 1; // タイトルに戻る
                    this.updateGameOverSelection();
                    break;
                case 'Space':
                    if (this.gameOverSelection === 0) {
                        this.restartGame();
                    } else {
                        this.returnToTitle();
                    }
                    break;
            }
            return;
        }
        
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

        // 寄り道モーダルが開いている場合
        if (this.gameState.isDetourModalOpen) {
            e.preventDefault(); // デフォルト動作を防ぐ
            e.stopPropagation(); // イベントの伝播を停止
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
            e.stopPropagation(); // イベントの伝播を停止
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
        // 旧スタート画面とタイトル画面の両方を非表示
        document.getElementById('start-screen').style.display = 'none';
        if (document.getElementById('title-screen')) {
            document.getElementById('title-screen').style.display = 'none';
        }
        
        // ゲーム画面を表示
        document.getElementById('game-container').style.display = 'flex';
        
        // UIパネルを確実に表示
        const uiPanel = document.getElementById('ui-panel');
        if (uiPanel) {
            uiPanel.style.display = 'flex';
            uiPanel.style.visibility = 'visible';
        }
        
        // キー入力を一時的に無視
        this.ignoreKeyInput = true;
        
        this.gameState.reset();
        this.gameState.isPlaying = true;
        this.gameState.visitedCities.clear();
        this.gameState.canSelectDestination = true;
        
        // 時間管理の初期化
        this.lastUpdateTime = Date.now();
        this.gameLogic.lastUpdateTime = Date.now();
        
        this.gameLogic.generateDestinations();
        this.gameLogic.spawnEnemies();
        
        // パワーアップアイテムを生成
        this.gameState.powerups = this.gameLogic.generatePowerups();
        
        this.updateMapCenter();
        this.updateMeimeiState();
        this.addDestinationMarkers();
        
        // UIを更新
        this.uiManager.updateUI();
        
        // クレジット表記を確認・作成
        setTimeout(() => {
            const attribution = document.querySelector('.leaflet-control-attribution');
            if (!attribution || attribution.offsetWidth === 0 || attribution.offsetHeight === 0) {
                this.createManualAttribution();
            }
        }, 1000);
        
        // 最初の配達先選択画面を少し遅延して表示（キーイベントの重複を防ぐ）
        setTimeout(() => {
            this.openDestinationModal();
            // キー入力の無視を解除
            this.ignoreKeyInput = false;
        }, 300);
        
        this.gameLoop = setInterval(() => this.update(), 1000 / 60); // 60 FPS
        this.lastUpdateTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 100); // より頻繁に時間をチェック
    }

    restartGame() {
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
        this.gameState.isGameOver = false; // ゲームオーバー状態を明示的にリセット
        this.gameOverSelection = 0; // 選択状態もリセット
        
        // ゲームオーバー画面を隠す
        this.safeAddClass('game-over-screen', 'hidden');
        
        // マーカーをクリア
        this.clearDestinationMarkers();
        
        // 新しい配達先を生成
        this.gameLogic.generateDestinations();
        
        // UIを更新
        this.uiManager.updateUI();
        
        // スタート画面を確実に隠す
        const startScreen = this.safeGetElement('start-screen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // ゲーム画面を表示
        const gameContainer = this.safeGetElement('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        }
        
        // UIパネルを確実に表示
        const uiPanel = this.safeGetElement('ui-panel');
        if (uiPanel) {
            uiPanel.style.display = 'flex';
            uiPanel.style.visibility = 'visible';
        }
        
        // ゲーム状態を開始状態に設定
        this.gameState.isPlaying = true;
        this.gameState.canSelectDestination = true;
        
        // 時間管理の初期化
        this.lastUpdateTime = Date.now();
        this.gameLogic.lastUpdateTime = Date.now();
        
        // 敵とパワーアップを生成
        this.gameLogic.spawnEnemies();
        
        // パワーアップアイテムを生成
        this.gameState.powerups = this.gameLogic.generatePowerups();
        
        // マップとプレイヤー状態を更新
        this.updateMapCenter();
        this.updateMeimeiState();
        this.addDestinationMarkers();
        
        // 配達先選択画面を表示
        try {
            this.openDestinationModal();
        } catch (error) {
            console.error('Error opening destination modal:', error);
        }
        
        // ゲームループを開始
        this.gameLoop = setInterval(() => this.update(), 1000 / 60); // 60 FPS
        this.lastUpdateTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 100); // より頻繁に時間をチェック
    }

    returnToTitle() {
        // ゲーム状態をリセット
        this.gameState.reset();
        this.gameState.isGameOver = false; // ゲームオーバー状態を明示的にリセット
        this.gameOverSelection = 0; // 選択状態もリセット
        
        // 全てのモーダルを閉じる
        this.safeAddClass('game-over-screen', 'hidden');
        this.safeAddClass('destination-modal', 'hidden');
        this.safeAddClass('detour-modal', 'hidden');
        
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
        
        // UIを更新
        this.gameLogic.generateDestinations();
        this.uiManager.updateUI();
        
        // ゲーム画面を非表示にしてタイトル画面を表示
        const gameContainer = this.safeGetElement('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        // タイトル画面を表示
        const titleScreenElement = this.safeGetElement('title-screen');
        if (titleScreenElement) {
            titleScreenElement.style.display = 'flex';
        } else {
            // フォールバック：旧スタート画面を表示
            const startScreen = this.safeGetElement('start-screen');
            if (startScreen) {
                startScreen.style.display = 'flex';
            }
        }
    }

    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused || 
            this.gameState.isDestinationModalOpen || this.gameState.isDetourModalOpen) return;

        this.frameCount++;

        this.gameLogic.updatePlayer();
        this.gameLogic.updateEnemies();
        this.gameLogic.maintainEnemyCount(); // 敵の数を維持
        this.gameLogic.checkCollisions();
        
        // パワーアップマーカーを更新（収集されたアイテムを削除）
        this.updatePowerupMarkers();
        
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
        
        // renderメソッドが存在する場合のみ呼び出し
        if (typeof this.render === 'function') {
            this.render();
        }
    }

    updateTimer() {
        if (!this.gameState.isPlaying) return;

        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        
        // 100ms以上経過した場合のみ時間を減らす（より正確な時間管理）
        if (deltaTime >= 1000) {
            const secondsToDeduct = Math.floor(deltaTime / 1000);
            this.gameState.timeLeft -= secondsToDeduct;
            this.lastUpdateTime = currentTime;
            
            if (this.gameState.timeLeft <= 0) {
                this.gameState.timeLeft = 0;
                this.endGame();
            }
            this.uiManager.updateUI();
        }
    }

    updateGameOverSelection() {
        const restartBtn = document.getElementById('restart-btn');
        const titleBtn = document.getElementById('title-btn');
        
        if (restartBtn && titleBtn) {
            // 選択状態をリセット
            restartBtn.classList.remove('selected');
            titleBtn.classList.remove('selected');
            
            // 現在の選択を強調表示
            if (this.gameOverSelection === 0) {
                restartBtn.classList.add('selected');
            } else {
                titleBtn.classList.add('selected');
            }
        }
    }

    endGame() {
        console.log('End Game triggered'); // デバッグ用
        this.gameState.isPlaying = false;
        this.gameState.isGameOver = true; // ゲームオーバー状態を設定
        clearInterval(this.gameLoop);
        clearInterval(this.timerInterval);

        // ゲームオーバー画面を表示
        this.uiManager.showGameOverScreen();
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

    // マーカー管理メソッド
    addDestinationMarkers() {
        this.clearDestinationMarkers();
        this.addPowerupMarkers();
        this.updateDestinationMarkers();
    }

    clearDestinationMarkers() {
        // 既存のマーカーをクリア
        if (this.destinationMarkers && Array.isArray(this.destinationMarkers)) {
            this.destinationMarkers.forEach(marker => {
                if (marker && this.map) {
                    this.map.removeLayer(marker);
                }
            });
        }
        if (this.powerupMarkers && Array.isArray(this.powerupMarkers)) {
            this.powerupMarkers.forEach(marker => {
                if (marker && this.map) {
                    this.map.removeLayer(marker);
                }
            });
        }
        this.destinationMarkers = [];
        this.powerupMarkers = [];
    }

    updateDestinationMarkers() {
        // 目的地マーカーを更新
        if (this.gameState.destinationSlots && this.map) {
            this.gameState.destinationSlots.forEach((destination, index) => {
                if (destination) {
                    try {
                        const marker = L.marker([destination.lat, destination.lng], {
                            icon: L.divIcon({
                                className: 'destination-marker',
                                html: `<div class="destination-icon">${index + 1}</div>`,
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                            })
                        }).addTo(this.map);
                        
                        if (!this.destinationMarkers) {
                            this.destinationMarkers = [];
                        }
                        this.destinationMarkers.push(marker);
                    } catch (error) {
                        console.error('Error adding destination marker:', error);
                    }
                }
            });
        }
    }

    addPowerupMarkers() {
        // パワーアップアイテムのマーカーを追加
        if (this.gameState.powerups && Array.isArray(this.gameState.powerups) && this.map) {
            let addedMarkers = 0;
            this.gameState.powerups.forEach((powerup, index) => {
                if (!powerup.collected) {
                    try {
                        // より目立つマーカーを作成
                        const marker = L.marker([powerup.lat, powerup.lng], {
                            icon: L.divIcon({
                                className: 'powerup-marker',
                                html: `
                                    <div class="powerup-icon" style="
                                        width: 30px !important;
                                        height: 30px !important;
                                        background: radial-gradient(circle, #ffeb3b, #ffc107) !important;
                                        border: 3px solid #ff9800 !important;
                                        border-radius: 50% !important;
                                        display: flex !important;
                                        align-items: center !important;
                                        justify-content: center !important;
                                        font-size: 16px !important;
                                        font-weight: bold !important;
                                        color: #333 !important;
                                        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.8) !important;
                                        z-index: 1000 !important;
                                        position: relative !important;
                                    ">⚡</div>
                                `,
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                            }),
                            zIndexOffset: 1000
                        }).addTo(this.map);
                        
                        if (!this.powerupMarkers) {
                            this.powerupMarkers = [];
                        }
                        this.powerupMarkers.push(marker);
                        addedMarkers++;
                    } catch (error) {
                        console.error('Error adding powerup marker:', error);
                    }
                }
            });
        }
    }

    updatePowerupMarkers() {
        // 収集されたパワーアップアイテムのマーカーを削除
        if (!this.powerupMarkers || !Array.isArray(this.powerupMarkers) || 
            !this.gameState.powerups || !Array.isArray(this.gameState.powerups) || 
            !this.map) {
            return;
        }
        
        try {
            // 収集されたパワーアップアイテムのマーカーを削除
            const markersToRemove = [];
            
            this.powerupMarkers.forEach((marker, markerIndex) => {
                if (!marker || !marker.getLatLng) {
                    markersToRemove.push(markerIndex);
                    return;
                }
                
                // マーカーに対応するパワーアップアイテムを探す
                const markerLatLng = marker.getLatLng();
                const correspondingPowerup = this.gameState.powerups.find(powerup => 
                    powerup && 
                    Math.abs(powerup.lat - markerLatLng.lat) < 0.001 && 
                    Math.abs(powerup.lng - markerLatLng.lng) < 0.001
                );
                
                if (correspondingPowerup && correspondingPowerup.collected) {
                    this.map.removeLayer(marker);
                    markersToRemove.push(markerIndex);
                }
            });
            
            // 削除するマーカーを配列から除去（逆順で削除）
            markersToRemove.reverse().forEach(index => {
                this.powerupMarkers.splice(index, 1);
            });
        } catch (error) {
            console.error('Error updating powerup markers:', error);
            // エラーが発生した場合は配列をリセット
            this.powerupMarkers = [];
        }
    }
}
