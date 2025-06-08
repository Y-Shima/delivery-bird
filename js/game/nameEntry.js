// 名前入力システム（統合されたゲームオーバー画面内）
DeliveryBirdGame.prototype.initNameEntry = function(rankPosition) {
    console.log('Initializing name entry section for rank position:', rankPosition); // デバッグ用
    
    this.nameEntryState = {
        position: rankPosition,
        currentCharIndex: 0,
        chars: ['A', 'A', 'A'],
        charSet: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8','9','0','-','_','.','END'],
        currentSelectorIndex: 0
    };
    
    // 名前入力セクションのテキストを更新
    document.querySelector('#name-entry-section h3').textContent = t('nameEntry.title');
    document.querySelector('#name-entry-section .name-entry-controls p').textContent = t('nameEntry.controls');
    
    // 名前入力セクションを表示（既にshowGameOverScreenで表示済み）
    document.getElementById('name-entry-section').classList.remove('hidden');
    
    this.updateNameDisplay();
};

DeliveryBirdGame.prototype.handleNameEntryKeyPress = function(e) {
    if (!this.nameEntryState) return;
    
    console.log('Name entry key pressed:', e.code); // デバッグ用
    
    switch (e.code) {
        case 'ArrowLeft':
            e.preventDefault();
            this.nameEntryState.currentSelectorIndex = Math.max(0, this.nameEntryState.currentSelectorIndex - 1);
            this.updateNameDisplay();
            break;
        case 'ArrowRight':
            e.preventDefault();
            this.nameEntryState.currentSelectorIndex = Math.min(
                this.nameEntryState.charSet.length - 1, 
                this.nameEntryState.currentSelectorIndex + 1
            );
            this.updateNameDisplay();
            break;
        case 'Space':
            e.preventDefault();
            this.selectCurrentChar();
            break;
        case 'Enter':
            e.preventDefault();
            this.submitName();
            break;
        case 'ArrowUp':
            e.preventDefault();
            // 文字位置を前に移動
            if (this.nameEntryState.currentCharIndex > 0) {
                this.nameEntryState.currentCharIndex--;
                this.updateNameDisplay();
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            // 文字位置を次に移動
            if (this.nameEntryState.currentCharIndex < 2) {
                this.nameEntryState.currentCharIndex++;
                this.updateNameDisplay();
            }
            break;
    }
};

DeliveryBirdGame.prototype.selectCurrentChar = function() {
    if (!this.nameEntryState) return;
    
    console.log('Selecting char at index:', this.nameEntryState.currentSelectorIndex); // デバッグ用
    
    const selectedChar = this.nameEntryState.charSet[this.nameEntryState.currentSelectorIndex];
    
    if (selectedChar === 'END') {
        // 名前入力完了
        this.submitName();
        return;
    }
    
    // 現在の文字位置に選択した文字を設定
    this.nameEntryState.chars[this.nameEntryState.currentCharIndex] = selectedChar;
    
    // 次の文字位置に移動（最大3文字）
    if (this.nameEntryState.currentCharIndex < 2) {
        this.nameEntryState.currentCharIndex++;
    }
    
    this.updateNameDisplay();
};

DeliveryBirdGame.prototype.updateNameDisplay = function() {
    if (!this.nameEntryState) return;
    
    console.log('Updating name display:', this.nameEntryState); // デバッグ用
    
    // 入力中の名前を表示
    ['char1', 'char2', 'char3'].forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = this.nameEntryState.chars[index];
            element.classList.toggle('active', index === this.nameEntryState.currentCharIndex);
        }
    });

    // 現在選択中の文字を表示
    const currentChar = this.nameEntryState.charSet[this.nameEntryState.currentSelectorIndex];
    const currentCharElement = document.getElementById('current-char');
    if (currentCharElement) {
        currentCharElement.textContent = currentChar;
    }
};

DeliveryBirdGame.prototype.submitName = function() {
    if (!this.nameEntryState) return;
    
    console.log('Submitting name in unified screen'); // デバッグ用
    
    const name = this.nameEntryState.chars.join('').trim();
    const finalName = name || 'AAA'; // 空の場合はデフォルト
    const newEntry = { name: finalName, score: this.gameState.score };
    
    this.gameState.ranking.splice(this.nameEntryState.position, 0, newEntry);
    this.gameState.ranking = this.gameState.ranking.slice(0, 10);
    this.gameState.saveRanking();
    
    // 名前入力セクションを隠す
    document.getElementById('name-entry-section').classList.add('hidden');
    
    // ランキング表示を更新
    this.uiManager.updateRankingDisplay();
    
    // 名前入力状態をクリア
    this.nameEntryState = null;
    
    console.log('Name submitted, ranking updated'); // デバッグ用
};
