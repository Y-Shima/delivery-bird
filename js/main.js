// メインエントリーポイント
let game;

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    // 言語設定を初期化
    loadLanguage(currentLanguage);
    
    // ゲームインスタンスを作成
    game = new DeliveryBirdGame();
    
    console.log('Delivery Bird Game initialized');
});
