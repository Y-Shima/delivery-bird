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
            'restart-btn': t('game.playAgain'),
            'arrival-continue-control': t('arrival.continueControl')
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
        const translatedName = translateCity(city.name);
        
        // ノーマルモードでは到着時に国名を表示、ビギナーモードでは都市名のみ
        let displayName = translatedName;
        if (currentGameMode.id === 'normal') {
            const countryName = translateCountry(city.country);
            displayName = `${translatedName}, ${countryName}`;
        }
        
        cityName.textContent = displayName;
        
        // 都市説明を表示
        const description = t(`cityDescriptions.${city.name}`) || `${city.name}の美しい都市です。`;
        cityDescription.textContent = description;
        
        // 獲得スコアを表示
        scoreValue.textContent = score;
        
        // 操作説明を多言語化
        document.getElementById('arrival-continue-control').textContent = t('arrival.continueControl');
        
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
        document.getElementById('hi-score').textContent = this.gameState.hiScore;
        
        this.updateTimeMeter();
        this.updateSpeedMeter();
        this.updateDestinationSlots();
    }

    // ゲームモード変更時にハイスコアを更新
    updateHiScoreForMode() {
        this.gameState.hiScore = this.gameState.loadHiScore();
        document.getElementById('hi-score').textContent = this.gameState.hiScore;
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
                statusText = t('status.stunned');
            } else if (player.isInvincible) {
                const remainingTime = Math.ceil((player.invincibleEndTime - Date.now()) / 1000);
                statusText = `${t('status.invincible')} (${remainingTime}s)`;
            } else if (player.isPoweredUp) {
                const remainingTime = Math.ceil((player.powerupEndTime - Date.now()) / 1000);
                statusText = `${t('status.powered')} (${remainingTime}s)`;
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
                
                // ゲームモードに応じて国名表示を制御
                const cityName = translateCity(destination.name);
                const countryName = currentGameMode.showCountryNames ? `, ${translateCountry(destination.country)}` : '';
                
                div.innerHTML = `
                    <div class="slot-number">${index + 1}</div>
                    <div class="destination-info">
                        <div class="destination-name">${cityName}${countryName}</div>
                        <div class="destination-reward">$${destination.reward}</div>
                    </div>
                `;
            } else {
                div.classList.add('empty');
                div.innerHTML = `
                    <div class="slot-number">${index + 1}</div>
                    <div class="empty-slot">${t('ui.emptySlot')}</div>
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
            
            // ゲームモードに応じて国名表示を制御
            const cityName = translateCity(dest.name);
            const countryName = currentGameMode.showCountryNames ? `, ${translateCountry(dest.country)}` : '';
            
            div.innerHTML = `
                <div class="destination-name">${cityName}${countryName}</div>
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
        document.querySelector('#detour-modal h3').textContent = `${translateCity(detourCity.name)}${t('detour.titleSuffix')}`;
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
            
            // ゲームモードに応じて国名表示を制御
            const cityName = translateCity(city.name);
            const countryName = currentGameMode.showCountryNames ? `, ${translateCountry(city.country)}` : '';
            
            div.innerHTML = `
                <div class="detour-city-name">${cityName}${countryName}</div>
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

    showGameOverScreen() {
        console.log('Showing game over screen'); // デバッグ用
        
        const gameOverScreen = document.getElementById('game-over-screen');
        
        // ゲームオーバー画面のテキストを更新
        document.querySelector('#game-over-screen h2').textContent = t('game.gameOver');
        document.getElementById('final-score').innerHTML = `${t('game.finalScore')}: <span id="final-score-value">${this.gameState.score}</span>`;
        
        // HIGH-SCOREを更新
        this.gameState.saveHiScore();
        
        // ゲームオーバー画面を表示
        gameOverScreen.classList.remove('hidden');
        
        // 初期選択状態を設定（もう一度プレイを選択）
        if (window.game) {
            window.game.gameOverSelection = 0;
            window.game.updateGameOverSelection();
        }
        
        // フォーカスを確実にゲームオーバー画面に設定
        setTimeout(() => {
            gameOverScreen.focus();
            console.log('Game over screen focused and ready for input'); // デバッグ用
        }, 100);
    }

    showPowerupMessage() {
        // パワーアップ収集時のメッセージを表示（多言語対応）
        let message = '⚡ パワーアップ！スピード2倍！';
        if (typeof t === 'function') {
            try {
                message = '⚡ ' + (t('powerup.collected') || 'パワーアップ！スピード2倍！');
            } catch (e) {
                // 翻訳関数でエラーが発生した場合はデフォルトメッセージを使用
                console.warn('Translation error for powerup message:', e);
            }
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'powerup-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ffeb3b, #ffc107);
            color: #333;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(255, 193, 7, 0.6);
            z-index: 10000;
            animation: powerup-message 3s ease-out forwards;
        `;
        
        // アニメーションのCSSを追加
        if (!document.getElementById('powerup-message-style')) {
            const style = document.createElement('style');
            style.id = 'powerup-message-style';
            style.textContent = `
                @keyframes powerup-message {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                    30% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    70% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageDiv);
        
        // 3秒後にメッセージを削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

}
