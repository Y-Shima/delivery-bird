// UI管理クラス
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.initializeUI();
    }

    initializeUI() {
        this.updateLanguageElements();
    }

    updateLanguageElements() {
        // 静的テキストの更新
        const elements = {
            'hi-score-label': t('ui.hiScore'),
            'score-label': t('ui.score'),
            'time-label': t('ui.time'),
            'speed-label': t('ui.speed'),
            'destinations-title': t('ui.destinations'),
            'game-title': t('game.title'),
            'game-subtitle': t('game.subtitle'),
            'start-btn': t('game.gameStart'),
            'restart-btn': t('game.playAgain')
        };

        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        });
    }

    // 都市到着モーダルを表示
    showCityArrivalModal(city, score) {
        const modal = document.getElementById('city-arrival-modal');
        const cityName = document.getElementById('arrival-city-name');
        const cityDescription = document.getElementById('arrival-city-description');
        const scoreValue = document.getElementById('arrival-score-value');
        
        // 都市名を表示（翻訳があれば翻訳版を使用）
        const translatedName = t(`cities.${city.name}`) || city.name;
        cityName.textContent = translatedName;
        
        // 都市説明を表示
        const description = t(`cityDescriptions.${city.name}`) || `${city.name}の美しい都市です。`;
        cityDescription.textContent = description;
        
        // 獲得スコアを表示
        scoreValue.textContent = score;
        
        // モーダルを表示
        modal.classList.remove('hidden');
        
        // 3秒後に自動で閉じる
        setTimeout(() => {
            this.hideCityArrivalModal();
        }, 3000);
    }
    
    // 都市到着モーダルを非表示
    hideCityArrivalModal() {
        const modal = document.getElementById('city-arrival-modal');
        modal.classList.add('hidden');
    }

    updateUI() {
        document.getElementById('current-score').textContent = this.gameState.score;
        document.getElementById('hi-score').textContent = this.gameState.ranking[0].score;
        
        this.updateTimeMeter();
        this.updateSpeedMeter();
        this.updateDestinationSlots();
    }

    updateTimeMeter() {
        const timeLeft = this.gameState.timeLeft;
        const totalTime = GAME_CONFIG.GAME_TIME;
        const percentage = (timeLeft / totalTime) * 100;
        
        // 時間表示を更新
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('time-display').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // メーターバーを更新
        let timeMeterFill = document.querySelector('.time-meter-fill');
        if (!timeMeterFill) {
            timeMeterFill = document.createElement('div');
            timeMeterFill.className = 'time-meter-fill';
            document.getElementById('time-meter').appendChild(timeMeterFill);
        }
        
        timeMeterFill.style.width = `${percentage}%`;
    }

    updateSpeedMeter() {
        const speedDots = document.querySelectorAll('.speed-dot');
        const player = this.gameState.player;
        
        speedDots.forEach((dot, index) => {
            // スピード0の時は全て消灯、1-5の時は該当する数だけ点灯
            if (player.speedLevel > 0 && index < player.speedLevel) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // 状態表示を更新
        const statusElement = document.getElementById('player-status');
        if (statusElement) {
            let statusText = '';
            if (player.isStunned) {
                statusText = '😵 足止め中';
            } else if (player.isInvincible) {
                const remainingTime = Math.ceil((player.invincibleEndTime - Date.now()) / 1000);
                statusText = `✨ 無敵 (${remainingTime}s)`;
            } else if (player.isPoweredUp) {
                const remainingTime = Math.ceil((player.powerUpEndTime - Date.now()) / 1000);
                statusText = `⚡ パワーアップ (${remainingTime}s)`;
            }
            statusElement.textContent = statusText;
        }
    }

    // 目的地スロットの表示を更新
    updateDestinationSlots() {
        const container = document.getElementById('destinations-list');
        container.innerHTML = '';

        this.gameState.destinationSlots.forEach((destination, index) => {
            const div = document.createElement('div');
            div.className = 'destination-slot';
            
            if (destination) {
                div.classList.add('occupied');
                div.innerHTML = `
                    <div class="slot-number">${index + 1}</div>
                    <div class="destination-info">
                        <div class="destination-name">${translateCity(destination.name)}</div>
                        <div class="destination-reward">$${destination.reward}</div>
                    </div>
                `;
            } else {
                div.classList.add('empty');
                div.innerHTML = `
                    <div class="slot-number">${index + 1}</div>
                    <div class="empty-slot">空き</div>
                `;
            }
            
            container.appendChild(div);
        });
    }

    updateDestinationModalUI() {
        const container = document.getElementById('destinations');
        container.innerHTML = '';

        // モーダルタイトルを更新
        const modalTitle = document.querySelector('#destination-modal h3');
        if (modalTitle) {
            modalTitle.textContent = t('destinations.selectTitle');
        }

        this.gameState.destinations.forEach((dest, index) => {
            const div = document.createElement('div');
            div.className = 'destination-option';
            if (index === this.gameState.selectedDestinationIndex) {
                div.classList.add('selected');
            }
            div.innerHTML = `
                <div class="destination-name">${translateCity(dest.name)}, ${translateCountry(dest.country)}</div>
                <div class="destination-reward">${t('destinations.reward')}: $${dest.reward}</div>
                <div class="destination-distance">${t('destinations.distance')}: ${Math.round(dest.distance)}km</div>
            `;
            container.appendChild(div);
        });
    }

    updateDestinationSelection() {
        const options = document.querySelectorAll('.destination-option');
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === this.gameState.selectedDestinationIndex);
        });
    }

    // 寄り道モーダルを表示（都市配達の4択）
    showDetourModal(detourOptions, detourCity) {
        const modal = document.getElementById('detour-modal');
        const optionsContainer = document.getElementById('detour-options');
        
        // タイトルと説明を多言語対応
        document.querySelector('#detour-modal h3').textContent = `${translateCity(detourCity.name)}で配達依頼`;
        document.querySelector('#detour-modal p').textContent = t('detour.question');
        document.querySelector('#detour-modal .detour-controls p').textContent = t('detour.controls');
        
        optionsContainer.innerHTML = '';
        
        // 3つの都市配達選択肢
        detourOptions.forEach((city, index) => {
            const div = document.createElement('div');
            div.className = 'detour-option';
            if (index === this.gameState.selectedDetourIndex) {
                div.classList.add('selected');
            }
            div.innerHTML = `
                <div class="detour-city-name">${translateCity(city.name)}, ${translateCountry(city.country)}</div>
                <div class="detour-reward">${t('destinations.reward')}: $${city.reward}</div>
                <div class="detour-distance">${t('destinations.distance')}: ${Math.round(city.distance)}km</div>
            `;
            optionsContainer.appendChild(div);
        });
        
        // 「依頼を断る」選択肢
        const declineDiv = document.createElement('div');
        declineDiv.className = 'detour-option decline';
        if (this.gameState.selectedDetourIndex === 3) {
            declineDiv.classList.add('selected');
        }
        declineDiv.textContent = t('detour.decline');
        optionsContainer.appendChild(declineDiv);
        
        modal.classList.remove('hidden');
    }

    updateDetourSelection() {
        const options = document.querySelectorAll('.detour-option');
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === this.gameState.selectedDetourIndex);
        });
    }

    hideDetourModal() {
        document.getElementById('detour-modal').classList.add('hidden');
    }

    showGameOverScreen(rankPosition) {
        console.log('Showing unified game over screen, rank position:', rankPosition); // デバッグ用
        
        const gameOverScreen = document.getElementById('game-over-screen');
        const nameEntrySection = document.getElementById('name-entry-section');
        
        // ゲームオーバー画面のテキストを更新
        document.querySelector('#game-over-screen h2').textContent = t('game.gameOver');
        document.getElementById('final-score').innerHTML = `${t('game.finalScore')}: <span id="final-score-value">${this.gameState.score}</span>`;
        document.querySelector('#ranking-section h3').textContent = t('game.ranking');
        
        this.updateRankingDisplay();
        
        // 名前入力セクションの表示/非表示を制御
        if (rankPosition !== -1) {
            // ランクイン - 名前入力セクションを表示
            nameEntrySection.classList.remove('hidden');
        } else {
            // ランク外 - 名前入力セクションを非表示
            nameEntrySection.classList.add('hidden');
        }
        
        // ゲームオーバー画面を表示
        gameOverScreen.classList.remove('hidden');
        
        // フォーカスを確実にゲームオーバー画面に設定
        setTimeout(() => {
            gameOverScreen.focus();
            console.log('Unified game over screen focused and ready for input'); // デバッグ用
        }, 100);
    }

    updateRankingDisplay() {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';
        
        this.gameState.ranking.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'ranking-item';
            div.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.score}</span>
            `;
            rankingList.appendChild(div);
        });
    }

    createLanguageSelector() {
        const selector = document.createElement('div');
        selector.className = 'language-selector';
        selector.innerHTML = `
            <select id="language-select">
                ${LANGUAGE_CONFIG.SUPPORTED_LANGUAGES.map(lang => 
                    `<option value="${lang}" ${lang === currentLanguage ? 'selected' : ''}>${LANGUAGE_CONFIG.LANGUAGE_NAMES[lang]}</option>`
                ).join('')}
            </select>
        `;
        
        document.body.appendChild(selector);
        
        document.getElementById('language-select').addEventListener('change', (e) => {
            loadLanguage(e.target.value);
            this.updateLanguageElements();
        });
    }
}
