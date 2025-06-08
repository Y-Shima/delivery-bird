// タイトル画面管理
class TitleScreen {
    constructor() {
        this.selectedMode = 'normal';
        this.selectedLanguage = this.detectBrowserLanguage();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateLanguage();
        this.updateModeSelection();
        this.updateLanguageSelection();
    }
    
    // ブラウザの言語設定を検出
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (browserLang.startsWith('ja')) {
            return 'ja';
        } else if (browserLang.startsWith('en')) {
            return 'en';
        } else if (browserLang.startsWith('zh')) {
            return 'zh';
        } else {
            return 'en'; // デフォルトは英語
        }
    }
    
    setupEventListeners() {
        // ゲームモード選択（クリック）
        document.querySelectorAll('.mode-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectMode(e.currentTarget.dataset.mode);
            });
        });
        
        // 言語選択（プルダウン）
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.selectLanguage(e.target.value);
            });
        }
        
        // キーボード操作
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('title-screen').style.display !== 'none') {
                this.handleKeyPress(e);
            }
        });
    }
    
    handleKeyPress(e) {
        switch(e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                this.selectMode('beginner');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.selectMode('normal');
                break;
            case 'Space':
                e.preventDefault();
                this.startGame();
                break;
        }
    }
    
    selectMode(mode) {
        this.selectedMode = mode;
        this.updateModeSelection();
        
        // ゲームモードを設定
        if (mode === 'beginner') {
            currentGameMode = GAME_MODES.BEGINNER;
        } else {
            currentGameMode = GAME_MODES.NORMAL;
        }
    }
    
    selectLanguage(lang) {
        this.selectedLanguage = lang;
        loadLanguage(lang);
        this.updateLanguage();
        this.updateLanguageSelection();
    }
    
    updateModeSelection() {
        document.querySelectorAll('.mode-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.mode === this.selectedMode) {
                option.classList.add('selected');
            }
        });
    }
    
    updateLanguageSelection() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.selectedLanguage;
        }
    }
    
    updateLanguage() {
        // 初期化時に言語を設定
        loadLanguage(this.selectedLanguage);
        
        // タイトルと説明
        document.getElementById('game-title').textContent = t('game.title');
        document.getElementById('game-subtitle').textContent = t('game.subtitle');
        
        // ゲームモード
        document.getElementById('mode-title').textContent = t('title.modeTitle');
        document.getElementById('mode-beginner').textContent = t('title.modeBeginner');
        document.getElementById('mode-beginner-desc').textContent = t('title.modeBeginnerDesc');
        document.getElementById('mode-normal').textContent = t('title.modeNormal');
        document.getElementById('mode-normal-desc').textContent = t('title.modeNormalDesc');
        document.getElementById('mode-controls-text').textContent = t('title.modeControls');
        
        // 操作説明
        document.getElementById('controls-title').textContent = t('controls.title');
        document.getElementById('controls-rotate').textContent = t('controls.rotate');
        document.getElementById('controls-speed').textContent = t('controls.speed');
        document.getElementById('controls-select').textContent = t('controls.select');
        
        // PUSH SPACEボタン
        document.getElementById('push-space-text').textContent = t('title.pushSpace');
    }
    
    startGame() {
        // タイトル画面を非表示
        document.getElementById('title-screen').style.display = 'none';
        
        // ゲーム開始
        if (window.deliveryBirdGame) {
            window.deliveryBirdGame.startGame();
        }
    }
    
    show() {
        document.getElementById('title-screen').style.display = 'flex';
        this.updateLanguage();
    }
    
    hide() {
        document.getElementById('title-screen').style.display = 'none';
    }
}

// タイトル画面インスタンス
let titleScreen = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    titleScreen = new TitleScreen();
});
