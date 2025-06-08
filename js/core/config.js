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
    ENEMY_SPAWN_DISTANCE: 1500, // 敵の出現距離（km）- Leafletマーカーで正確に表示
    ENEMY_COUNT: 2 // 画面内の敵の数
};

// ゲームモード設定
const GAME_MODES = {
    BEGINNER: {
        id: 'beginner',
        enemyMultiplier: 1,
        showCountryNames: true,
        saveScore: false
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

let currentLanguage = localStorage.getItem('delivery-bird-language') || detectBrowserLanguage();
let currentLang = null;

// 言語設定を読み込む
function loadLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('delivery-bird-language', lang);
    
    switch(lang) {
        case 'en':
            currentLang = LANG_EN;
            break;
        case 'zh':
            currentLang = LANG_ZH;
            break;
        default:
            currentLang = LANG_JA;
    }
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

// 初期化
loadLanguage(currentLanguage);
