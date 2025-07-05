// タイトル画面管理
class TitleScreen {
    constructor() {
        this.selectedMode = 'normal';
        this.selectedLanguage = this.getInitialLanguage();
        this.init();
    }
    
    // 初期言語を決定（保存された設定 > ブラウザ設定の順）
    getInitialLanguage() {
        // まず保存された言語設定を確認
        const savedLanguage = localStorage.getItem('delivery-bird-language');
        if (savedLanguage && ['ja', 'en', 'zh'].includes(savedLanguage)) {
            console.log('Using saved language:', savedLanguage);
            return savedLanguage;
        }
        
        // 保存された設定がない場合はブラウザ設定を検出
        return this.detectBrowserLanguage();
    }
    
    init() {
        this.setupEventListeners();
        this.updateLanguage();
        this.updateModeSelection();
        this.updateLanguageSelection();
    }
    
    // ブラウザの言語設定を検出
    detectBrowserLanguage() {
        // 複数の言語設定を確認
        const languages = [
            navigator.language,
            navigator.userLanguage,
            ...(navigator.languages || [])
        ].filter(Boolean);
        
        console.log('Detected browser languages:', languages);
        
        // 各言語を順番にチェック
        for (const lang of languages) {
            const langCode = lang.toLowerCase();
            
            if (langCode.startsWith('ja')) {
                console.log('Selected language: Japanese (ja)');
                return 'ja';
            } else if (langCode.startsWith('zh')) {
                console.log('Selected language: Chinese (zh)');
                return 'zh';
            } else if (langCode.startsWith('en')) {
                console.log('Selected language: English (en)');
                return 'en';
            }
        }
        
        // システムの地域設定も確認（Macの場合）
        const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
        console.log('System locale:', systemLocale);
        
        if (systemLocale.startsWith('ja')) {
            console.log('Selected language from system locale: Japanese (ja)');
            return 'ja';
        } else if (systemLocale.startsWith('zh')) {
            console.log('Selected language from system locale: Chinese (zh)');
            return 'zh';
        }
        
        // デフォルトは英語
        console.log('Selected language: English (en) - default');
        return 'en';
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
                e.stopPropagation();
                this.selectMode('beginner');
                break;
            case 'ArrowRight':
                e.preventDefault();
                e.stopPropagation();
                this.selectMode('normal');
                break;
            case 'Space':
                e.preventDefault();
                e.stopPropagation();
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
        
        // ゲームインスタンスが存在する場合、ハイスコアを更新
        if (window.deliveryBirdGame && window.deliveryBirdGame.uiManager) {
            window.deliveryBirdGame.uiManager.updateHiScoreForMode();
        }
    }
    
    selectLanguage(lang) {
        this.selectedLanguage = lang;
        
        // 言語設定をローカルストレージに保存
        localStorage.setItem('delivery-bird-language', lang);
        console.log('Language saved to localStorage:', lang);
        
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
        
        // 少し遅延してからゲーム開始（キーイベントの重複を防ぐ）
        setTimeout(() => {
            if (window.deliveryBirdGame) {
                window.deliveryBirdGame.startGame();
            }
        }, 100);
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
