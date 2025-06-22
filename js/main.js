// メインエントリーポイント
let game;

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    // 言語設定を初期化
    loadLanguage(currentLanguage);
    
    // ゲームインスタンスを作成（まだ開始しない）
    game = new DeliveryBirdGame();
    window.deliveryBirdGame = game;
    window.game = game; // UIManagerからアクセスできるように
    
    // ゲーム画面を非表示にしてタイトル画面を表示
    document.getElementById('game-container').style.display = 'none';
    
    // UI要素の多言語対応を再実行（DOM読み込み後）
    setTimeout(() => {
        updateUILanguage();
    }, 100);
    
    console.log('Delivery Bird Game initialized');
});
