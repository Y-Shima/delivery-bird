// 世界の主要都市データ（100箇所）
const WORLD_CITIES = [
    // 日本
    { name: "東京", lat: 35.6762, lng: 139.6503, country: "日本" },
    { name: "大阪", lat: 34.6937, lng: 135.5023, country: "日本" },
    
    // アメリカ（4箇所）
    { name: "ニューヨーク", lat: 40.7128, lng: -74.0060, country: "アメリカ" },
    { name: "ロサンゼルス", lat: 34.0522, lng: -118.2437, country: "アメリカ" },
    { name: "シカゴ", lat: 41.8781, lng: -87.6298, country: "アメリカ" },
    { name: "サンフランシスコ", lat: 37.7749, lng: -122.4194, country: "アメリカ" },
    
    // 中国（4箇所）
    { name: "北京", lat: 39.9042, lng: 116.4074, country: "中国" },
    { name: "上海", lat: 31.2304, lng: 121.4737, country: "中国" },
    { name: "西安", lat: 34.2658, lng: 108.9541, country: "中国" },
    { name: "ハルビン", lat: 45.8038, lng: 126.5349, country: "中国" },
    
    // イギリス
    { name: "ロンドン", lat: 51.5074, lng: -0.1278, country: "イギリス" },
    { name: "エディンバラ", lat: 55.9533, lng: -3.1883, country: "イギリス" },
    
    // フランス
    { name: "パリ", lat: 48.8566, lng: 2.3522, country: "フランス" },
    { name: "マルセイユ", lat: 43.2965, lng: 5.3698, country: "フランス" },
    
    // ドイツ
    { name: "ベルリン", lat: 52.5200, lng: 13.4050, country: "ドイツ" },
    { name: "ミュンヘン", lat: 48.1351, lng: 11.5820, country: "ドイツ" },
    
    // イタリア
    { name: "ローマ", lat: 41.9028, lng: 12.4964, country: "イタリア" },
    { name: "ミラノ", lat: 45.4642, lng: 9.1900, country: "イタリア" },
    
    // スペイン
    { name: "マドリード", lat: 40.4168, lng: -3.7038, country: "スペイン" },
    { name: "バルセロナ", lat: 41.3851, lng: 2.1734, country: "スペイン" },
    
    // ロシア
    { name: "モスクワ", lat: 55.7558, lng: 37.6176, country: "ロシア" },
    { name: "サンクトペテルブルク", lat: 59.9311, lng: 30.3609, country: "ロシア" },
    
    // インド
    { name: "ムンバイ", lat: 19.0760, lng: 72.8777, country: "インド" },
    { name: "デリー", lat: 28.7041, lng: 77.1025, country: "インド" },
    
    // ブラジル
    { name: "サンパウロ", lat: -23.5505, lng: -46.6333, country: "ブラジル" },
    { name: "リオデジャネイロ", lat: -22.9068, lng: -43.1729, country: "ブラジル" },
    
    // カナダ
    { name: "トロント", lat: 43.6532, lng: -79.3832, country: "カナダ" },
    { name: "バンクーバー", lat: 49.2827, lng: -123.1207, country: "カナダ" },
    
    // オーストラリア
    { name: "シドニー", lat: -33.8688, lng: 151.2093, country: "オーストラリア" },
    { name: "メルボルン", lat: -37.8136, lng: 144.9631, country: "オーストラリア" },
    
    // 韓国
    { name: "ソウル", lat: 37.5665, lng: 126.9780, country: "韓国" },
    { name: "釜山", lat: 35.1796, lng: 129.0756, country: "韓国" },
    
    // その他の国（1箇所ずつ）
    { name: "アムステルダム", lat: 52.3676, lng: 4.9041, country: "オランダ" },
    { name: "レイキャビク", lat: 64.1466, lng: -21.9426, country: "アイスランド" },
    { name: "ストックホルム", lat: 59.3293, lng: 18.0686, country: "スウェーデン" },
    { name: "コペンハーゲン", lat: 55.6761, lng: 12.5683, country: "デンマーク" },
    { name: "オスロ", lat: 59.9139, lng: 10.7522, country: "ノルウェー" },
    { name: "ヘルシンキ", lat: 60.1699, lng: 24.9384, country: "フィンランド" },
    { name: "ウィーン", lat: 48.2082, lng: 16.3738, country: "オーストリア" },
    { name: "チューリッヒ", lat: 47.3769, lng: 8.5417, country: "スイス" },
    { name: "ブリュッセル", lat: 50.8503, lng: 4.3517, country: "ベルギー" },
    { name: "プラハ", lat: 50.0755, lng: 14.4378, country: "チェコ" },
    { name: "ワルシャワ", lat: 52.2297, lng: 21.0122, country: "ポーランド" },
    { name: "キーウ", lat: 50.4501, lng: 30.5234, country: "ウクライナ" },
    { name: "ブダペスト", lat: 47.4979, lng: 19.0402, country: "ハンガリー" },
    { name: "アテネ", lat: 37.9838, lng: 23.7275, country: "ギリシャ" },
    { name: "リスボン", lat: 38.7223, lng: -9.1393, country: "ポルトガル" },
    { name: "ダブリン", lat: 53.3498, lng: -6.2603, country: "アイルランド" },
    
    // アジア
    { name: "バンコク", lat: 13.7563, lng: 100.5018, country: "タイ" },
    { name: "シンガポール", lat: 1.3521, lng: 103.8198, country: "シンガポール" },
    { name: "香港", lat: 22.3193, lng: 114.1694, country: "香港" },
    { name: "台北", lat: 25.0330, lng: 121.5654, country: "台湾" },
    { name: "ジャカルタ", lat: -6.2088, lng: 106.8456, country: "インドネシア" },
    { name: "マニラ", lat: 14.5995, lng: 120.9842, country: "フィリピン" },
    { name: "ハノイ", lat: 21.0285, lng: 105.8542, country: "ベトナム" },
    { name: "クアラルンプール", lat: 3.1390, lng: 101.6869, country: "マレーシア" },
    { name: "ヤンゴン", lat: 16.8661, lng: 96.1951, country: "ミャンマー" },
    { name: "プノンペン", lat: 11.5564, lng: 104.9282, country: "カンボジア" },
    { name: "ビエンチャン", lat: 17.9757, lng: 102.6331, country: "ラオス" },
    { name: "コロンボ", lat: 6.9271, lng: 79.8612, country: "スリランカ" },
    { name: "ダッカ", lat: 23.8103, lng: 90.4125, country: "バングラデシュ" },
    { name: "カトマンズ", lat: 27.7172, lng: 85.3240, country: "ネパール" },
    { name: "カブール", lat: 34.5553, lng: 69.2075, country: "アフガニスタン" },
    { name: "イスラマバード", lat: 33.6844, lng: 73.0479, country: "パキスタン" },
    { name: "テヘラン", lat: 35.6892, lng: 51.3890, country: "イラン" },
    { name: "バグダッド", lat: 33.3152, lng: 44.3661, country: "イラク" },
    { name: "ダマスカス", lat: 33.5138, lng: 36.2765, country: "シリア" },
    { name: "アンマン", lat: 31.9454, lng: 35.9284, country: "ヨルダン" },
    { name: "アンカラ", lat: 39.9334, lng: 32.8597, country: "トルコ" },
    
    // 中東・アフリカ
    { name: "ドバイ", lat: 25.2048, lng: 55.2708, country: "UAE" },
    { name: "リヤド", lat: 24.7136, lng: 46.6753, country: "サウジアラビア" },
    { name: "マスカット", lat: 23.5859, lng: 58.4059, country: "オマーン" },
    { name: "タシケント", lat: 41.2995, lng: 69.2401, country: "ウズベキスタン" },
    { name: "ウランバートル", lat: 47.8864, lng: 106.9057, country: "モンゴル" },
    { name: "カイロ", lat: 30.0444, lng: 31.2357, country: "エジプト" },
    { name: "カサブランカ", lat: 33.5731, lng: -7.5898, country: "モロッコ" },
    { name: "チュニス", lat: 36.8065, lng: 10.1815, country: "チュニジア" },
    { name: "アルジェ", lat: 36.7538, lng: 3.0588, country: "アルジェリア" },
    { name: "トリポリ", lat: 32.8872, lng: 13.1913, country: "リビア" },
    { name: "ハルツーム", lat: 15.5007, lng: 32.5599, country: "スーダン" },
    { name: "アディスアベバ", lat: 9.1450, lng: 40.4897, country: "エチオピア" },
    { name: "ナイロビ", lat: -1.2921, lng: 36.8219, country: "ケニア" },
    { name: "ダルエスサラーム", lat: -6.7924, lng: 39.2083, country: "タンザニア" },
    { name: "カンパラ", lat: 0.3476, lng: 32.5825, country: "ウガンダ" },
    { name: "キガリ", lat: -1.9441, lng: 30.0619, country: "ルワンダ" },
    { name: "ラゴス", lat: 6.5244, lng: 3.3792, country: "ナイジェリア" },
    { name: "アクラ", lat: 5.6037, lng: -0.1870, country: "ガーナ" },
    { name: "アビジャン", lat: 5.3600, lng: -4.0083, country: "コートジボワール" },
    { name: "ダカール", lat: 14.7167, lng: -17.4677, country: "セネガル" },
    { name: "ケープタウン", lat: -33.9249, lng: 18.4241, country: "南アフリカ" },
    { name: "ヨハネスブルク", lat: -26.2041, lng: 28.0473, country: "南アフリカ" },
    
    // 南米
    { name: "ブエノスアイレス", lat: -34.6118, lng: -58.3960, country: "アルゼンチン" },
    { name: "サンティアゴ", lat: -33.4489, lng: -70.6693, country: "チリ" },
    { name: "リマ", lat: -12.0464, lng: -77.0428, country: "ペルー" },
    { name: "ボゴタ", lat: 4.7110, lng: -74.0721, country: "コロンビア" },
    { name: "カラカス", lat: 10.4806, lng: -66.9036, country: "ベネズエラ" },
    { name: "キト", lat: -0.1807, lng: -78.4678, country: "エクアドル" },
    { name: "ラパス", lat: -16.5000, lng: -68.1193, country: "ボリビア" },
    { name: "アスンシオン", lat: -25.2637, lng: -57.5759, country: "パラグアイ" },
    { name: "モンテビデオ", lat: -34.9011, lng: -56.1645, country: "ウルグアイ" },
    
    // 北米・中米
    { name: "メキシコシティ", lat: 19.4326, lng: -99.1332, country: "メキシコ" },
    { name: "グアテマラシティ", lat: 14.6349, lng: -90.5069, country: "グアテマラ" },
    { name: "サンホセ", lat: 9.9281, lng: -84.0907, country: "コスタリカ" },
    { name: "パナマシティ", lat: 8.9824, lng: -79.5199, country: "パナマ" },
    { name: "ハバナ", lat: 23.1136, lng: -82.3666, country: "キューバ" },
    
    // オセアニア・太平洋
    { name: "ウェリントン", lat: -41.2865, lng: 174.7762, country: "ニュージーランド" },
    { name: "スバ", lat: -18.1248, lng: 178.4501, country: "フィジー" },
    { name: "ホノルル", lat: 21.3099, lng: -157.8581, country: "アメリカ" },
    { name: "キャンベラ", lat: -35.2809, lng: 149.1300, country: "オーストラリア" },
    { name: "ポートモレスビー", lat: -9.4438, lng: 147.1803, country: "パプアニューギニア" },
    
    // 追加のヨーロッパ
    { name: "ブカレスト", lat: 44.4268, lng: 26.1025, country: "ルーマニア" },
    { name: "ソフィア", lat: 42.6977, lng: 23.3219, country: "ブルガリア" },
    { name: "ベオグラード", lat: 44.7866, lng: 20.4489, country: "セルビア" },
    { name: "ザグレブ", lat: 45.8150, lng: 15.9819, country: "クロアチア" },
    { name: "リガ", lat: 56.9496, lng: 24.1052, country: "ラトビア" },
    { name: "タリン", lat: 59.4370, lng: 24.7536, country: "エストニア" },
    { name: "ミンスク", lat: 53.9006, lng: 27.5590, country: "ベラルーシ" },
    { name: "バレッタ", lat: 35.8989, lng: 14.5146, country: "マルタ" },
    { name: "ティラナ", lat: 41.3275, lng: 19.8187, country: "アルバニア" },
    
    // 追加のアフリカ
    { name: "アブジャ", lat: 9.0765, lng: 7.3986, country: "ナイジェリア" },
    { name: "キンシャサ", lat: -4.4419, lng: 15.2663, country: "コンゴ民主共和国" },
    { name: "ルアンダ", lat: -8.8390, lng: 13.2894, country: "アンゴラ" },
    { name: "ハラレ", lat: -17.8292, lng: 31.0522, country: "ジンバブエ" },
    { name: "ルサカ", lat: -15.3875, lng: 28.3228, country: "ザンビア" },
    { name: "バマコ", lat: 12.6392, lng: -8.0029, country: "マリ" },
    { name: "ヌアクショット", lat: 18.0735, lng: -15.9582, country: "モーリタニア" },
    { name: "アンタナナリボ", lat: -18.8792, lng: 47.5079, country: "マダガスカル" },
    { name: "マプト", lat: -25.9692, lng: 32.5732, country: "モザンビーク" },
    { name: "ヤウンデ", lat: 3.8480, lng: 11.5021, country: "カメルーン" },
    { name: "コナクリ", lat: 9.6412, lng: -13.5784, country: "ギニア" },
    { name: "リロングウェ", lat: -13.9626, lng: 33.7741, country: "マラウイ" },
    { name: "モンロビア", lat: 6.2907, lng: -10.7605, country: "リベリア" },
    
    // 追加の中央アジア・コーカサス
    { name: "アスタナ", lat: 51.1694, lng: 71.4491, country: "カザフスタン" },
    { name: "バクー", lat: 40.4093, lng: 49.8671, country: "アゼルバイジャン" },
    { name: "トビリシ", lat: 41.7151, lng: 44.8271, country: "ジョージア" },
    { name: "エレバン", lat: 40.0691, lng: 44.5140, country: "アルメニア" },
    
    // 追加の中米・カリブ
    { name: "テグシガルパ", lat: 14.0723, lng: -87.1921, country: "ホンジュラス" },
    { name: "キングストン", lat: 17.9712, lng: -76.7936, country: "ジャマイカ" },
    { name: "サンサルバドル", lat: 13.6929, lng: -89.2182, country: "エルサルバドル" }
];
