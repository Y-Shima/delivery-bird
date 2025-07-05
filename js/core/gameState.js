// ゲーム状態管理クラス
class GameState {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false; // ゲームオーバー状態を明確に管理
        this.score = 0;
        this.timeLeft = GAME_CONFIG.GAME_TIME;
        this.currentCity = WORLD_CITIES[0]; // 東京からスタート
        this.destinations = []; // 選択可能な配達先候補
        this.selectedDestinationIndex = 0;
        this.isDestinationModalOpen = false;
        this.destinationSlots = [null, null, null]; // 3つの目的地スロット
        this.visitedCities = new Set(); // 訪問済み都市（配達済み）
        this.canSelectDestination = true; // 目的地選択可能フラグ
        this.isDetourModalOpen = false; // 寄り道モーダル表示フラグ
        this.isJustArrived = false; // 到着直後フラグ（寄り道を無効にする）
        this.detourCities = null; // 寄り道都市の選択肢（3つ）
        this.detourCity = null; // 到着した寄り道都市
        this.selectedDetourIndex = 0; // 寄り道選択インデックス
        this.player = {
            lat: 35.6762,
            lng: 139.6503,
            angle: 0,
            speed: 0,
            speedLevel: 0, // 0-5
            isStunned: false,
            stunEndTime: 0,
            isInvincible: false, // 無敵状態
            invincibleEndTime: 0, // 無敵終了時間
            isPoweredUp: false,
            powerupEndTime: 0 // powerUpEndTime から powerupEndTime に統一
        };
        this.enemies = [];
        this.powerups = []; // パワーアップアイテム配列を初期化
        
        // 既存スコアの移行処理
        this.migrateExistingScore();
        
        this.hiScore = this.loadHiScore();
    }

    loadHiScore() {
        // 現在のゲームモードに応じてスコアを読み込み
        const key = this.getHiScoreKey();
        const saved = localStorage.getItem(key);
        return saved ? parseInt(saved, 10) : 0;
    }

    saveHiScore() {
        if (this.score > this.hiScore) {
            this.hiScore = this.score;
            const key = this.getHiScoreKey();
            localStorage.setItem(key, this.hiScore.toString());
        }
    }

    getHiScoreKey() {
        // ゲームモードに応じてキーを決定
        if (currentGameMode.id === 'beginner') {
            return 'delivery-bird-hiscore-beginner';
        } else {
            return 'delivery-bird-hiscore-normal';
        }
    }

    // 既存のノーマルモードスコアをノーマルモード用に移行
    migrateExistingScore() {
        const oldScore = localStorage.getItem('delivery-bird-hiscore');
        if (oldScore && !localStorage.getItem('delivery-bird-hiscore-normal')) {
            // 既存のスコアをノーマルモード用として保存
            localStorage.setItem('delivery-bird-hiscore-normal', oldScore);
            console.log('Migrated existing score to normal mode:', oldScore);
        }
    }

    reset() {
        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false; // ゲームオーバー状態をリセット
        this.score = 0;
        this.timeLeft = GAME_CONFIG.GAME_TIME;
        this.currentCity = WORLD_CITIES[0];
        this.destinations = [];
        this.selectedDestinationIndex = 0;
        this.isDestinationModalOpen = false;
        this.destinationSlots = [null, null, null];
        this.visitedCities.clear();
        this.canSelectDestination = true;
        this.isDetourModalOpen = false;
        this.isJustArrived = false; // 到着直後フラグをリセット
        this.detourCities = null;
        this.detourCity = null;
        this.selectedDetourIndex = 0;
        this.player = {
            lat: 35.6762,
            lng: 139.6503,
            angle: 0,
            speed: 0,
            speedLevel: 0,
            isStunned: false,
            stunEndTime: 0,
            isInvincible: false, // 無敵状態
            invincibleEndTime: 0, // 無敵終了時間
            isPoweredUp: false,
            powerupEndTime: 0 // powerUpEndTime から powerupEndTime に統一
        };
        this.enemies = [];
        this.powerups = []; // パワーアップアイテム配列をリセット
        
        // ゲームモードに応じてハイスコアを再読み込み
        this.hiScore = this.loadHiScore();
    }

    // 空いているスロットのインデックスを取得
    getEmptySlotIndex() {
        return this.destinationSlots.findIndex(slot => slot === null);
    }

    // スロットに目的地を追加
    addToSlot(destination) {
        const emptyIndex = this.getEmptySlotIndex();
        if (emptyIndex !== -1) {
            this.destinationSlots[emptyIndex] = destination;
            return true;
        }
        return false;
    }

    // スロットから目的地を削除
    removeFromSlot(destination) {
        const index = this.destinationSlots.findIndex(slot => 
            slot && slot.name === destination.name
        );
        if (index !== -1) {
            this.destinationSlots[index] = null;
            return true;
        }
        return false;
    }

    // スロットが満杯かチェック
    isSlotsFull() {
        return this.destinationSlots.every(slot => slot !== null);
    }
}
