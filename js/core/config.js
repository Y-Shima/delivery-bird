// ゲーム設定
const GAME_CONFIG = {
    GAME_TIME: 180, // 3分
    SPEED_LEVELS: [0, 1, 2, 3, 4, 5], // 0は停止、5で地球の反対側まで1分
    MAX_SPEED_DISTANCE: 20037.5, // 地球の半周（km）
    MAX_SPEED_TIME: 60, // 60秒で地球の反対側
    POWERUP_DURATION: 10,
    STUN_DURATION: 5,
    INVINCIBLE_DURATION: 5, // 5秒間の無敵時間
    MAP_ZOOM: 6, // より詳細な地図
    ARRIVAL_DISTANCE: 100, // 到着判定距離（km）
    MAX_DESTINATION_SLOTS: 3, // 最大目的地スロット数
    DETOUR_DISTANCE: 300, // 寄り道判定距離（km）を大きくする
    ENEMY_SPAWN_DISTANCE: 1500, // 敵の出現距離（km）
    ENEMY_COUNT: 4, // 画面内の敵の数（基本数を増加）
    POWERUP_COUNT: 30, // パワーアップアイテムの数（20個から30個に増加）
    POWERUP_MIN_DISTANCE_FROM_CITY: 500 // 都市からの最小距離（km）
};

// ゲームモード設定
const GAME_MODES = {
    BEGINNER: {
        id: 'beginner',
        enemyMultiplier: 1,
        showCountryNames: true,
        saveScore: true
    },
    NORMAL: {
        id: 'normal',
        enemyMultiplier: 2,
        showCountryNames: false,
        saveScore: true
    }
};

// 現在のゲームモード
let currentGameMode = GAME_MODES.NORMAL;

// 多言語設定
const LANGUAGE_CONFIG = {
    DEFAULT_LANGUAGE: 'ja',
    SUPPORTED_LANGUAGES: ['ja', 'en', 'zh'],
    LANGUAGE_NAMES: {
        'ja': '日本語',
        'en': 'English',
        'zh': '中文'
    }
};

// 現在の言語設定（ブラウザの設定を優先）
function detectBrowserLanguage() {
    // 複数の言語設定を確認
    const languages = [
        navigator.language,
        navigator.userLanguage,
        ...(navigator.languages || [])
    ].filter(Boolean);
    
    console.log('Config: Detected browser languages:', languages);
    
    // 各言語を順番にチェック
    for (const lang of languages) {
        const langCode = lang.toLowerCase();
        
        if (langCode.startsWith('ja')) {
            console.log('Config: Selected language: Japanese (ja)');
            return 'ja';
        } else if (langCode.startsWith('zh')) {
            console.log('Config: Selected language: Chinese (zh)');
            return 'zh';
        } else if (langCode.startsWith('en')) {
            console.log('Config: Selected language: English (en)');
            return 'en';
        }
    }
    
    // システムの地域設定も確認（Macの場合）
    const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    console.log('Config: System locale:', systemLocale);
    
    if (systemLocale.startsWith('ja')) {
        console.log('Config: Selected language from system locale: Japanese (ja)');
        return 'ja';
    } else if (systemLocale.startsWith('zh')) {
        console.log('Config: Selected language from system locale: Chinese (zh)');
        return 'zh';
    }
    
    // デフォルトは英語
    console.log('Config: Selected language: English (en) - default');
    return 'en';
}

// 初期言語を決定（保存された設定 > ブラウザ設定の順）
function getInitialLanguage() {
    // まず保存された言語設定を確認
    const savedLanguage = localStorage.getItem('delivery-bird-language');
    if (savedLanguage && LANGUAGE_CONFIG.SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        console.log('Config: Using saved language:', savedLanguage);
        return savedLanguage;
    }
    
    // 保存された設定がない場合はブラウザ設定を検出
    return detectBrowserLanguage();
}

let currentLanguage = getInitialLanguage();
let currentLang = null;

// 言語設定を読み込む
function loadLanguage(lang) {
    console.log('Config: Loading language:', lang);
    currentLanguage = lang;
    localStorage.setItem('delivery-bird-language', lang);
    
    switch(lang) {
        case 'en':
            currentLang = LANG_EN;
            console.log('Config: Loaded English language pack');
            break;
        case 'zh':
            currentLang = LANG_ZH;
            console.log('Config: Loaded Chinese language pack');
            break;
        default:
            currentLang = LANG_JA;
            console.log('Config: Loaded Japanese language pack (default)');
    }
    
    // UI要素を更新
    updateUILanguage();
}

// UI要素の多言語対応を更新
function updateUILanguage() {
    // 基本的なUI要素
    const elements = {
        'destinations-title': 'ui.destinations',
        'destination-modal-title': 'destinations.selectTitle',
        'destination-controls': 'destinations.controls',
        'detour-title': 'detour.title',
        'detour-question': 'detour.question',
        'detour-controls': 'detour.controls',
        'arrival-score-label': 'arrival.scoreEarned',
        'restart-btn': 'gameOver.restart',
        'title-btn': 'gameOver.returnToTitle',
        'game-over-controls': 'gameOver.controls',
        'controls-rotate': 'controls.rotate',
        'controls-speed': 'controls.speed',
        'controls-select': 'controls.select',
        'controls-rotate-old': 'controls.rotate',
        'controls-speed-old': 'controls.speed',
        'controls-select-old': 'controls.select'
    };
    
    // 各要素のテキストを更新
    Object.entries(elements).forEach(([elementId, translationKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = t(translationKey);
        }
    });
}

// 翻訳関数
function t(key) {
    const keys = key.split('.');
    let value = currentLang;
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key; // キーが見つからない場合はキー自体を返す
        }
    }
    
    return value;
}

// 都市名翻訳
function translateCity(cityName) {
    return currentLang.cities[cityName] || cityName;
}

// 国名翻訳
function translateCountry(countryName) {
    return currentLang.countries[countryName] || countryName;
}

// デバッグ用：ブラウザの言語情報を表示
function debugLanguageInfo() {
    console.log('=== Language Detection Debug Info ===');
    console.log('navigator.language:', navigator.language);
    console.log('navigator.userLanguage:', navigator.userLanguage);
    console.log('navigator.languages:', navigator.languages);
    console.log('Intl.DateTimeFormat().resolvedOptions().locale:', Intl.DateTimeFormat().resolvedOptions().locale);
    console.log('localStorage saved language:', localStorage.getItem('delivery-bird-language'));
    console.log('Current detected language:', currentLanguage);
    console.log('=====================================');
}

// 初期化
console.log('Config: Initializing with language:', currentLanguage);
debugLanguageInfo();
loadLanguage(currentLanguage);
