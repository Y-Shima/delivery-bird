// ゲームコントロール関連のメソッド（DeliveryBirdGameクラスの拡張）
DeliveryBirdGame.prototype.openDestinationModal = function() {
    this.gameState.isDestinationModalOpen = true;
    this.gameState.selectedDestinationIndex = 0;
    this.uiManager.updateDestinationModalUI();
    document.getElementById('destination-modal').classList.remove('hidden');
};

DeliveryBirdGame.prototype.closeDestinationModal = function() {
    this.gameState.isDestinationModalOpen = false;
    document.getElementById('destination-modal').classList.add('hidden');
};

DeliveryBirdGame.prototype.confirmDestination = function() {
    const destination = this.gameState.destinations[this.gameState.selectedDestinationIndex];
    
    // スロットに追加
    if (this.gameState.addToSlot(destination)) {
        this.gameState.canSelectDestination = false; // 目的地選択を無効化
        this.closeDestinationModal();
        this.updateDestinationMarkers(); // マーカーの色を更新
        this.uiManager.updateUI();
    }
};

DeliveryBirdGame.prototype.clearDestinationMarkers = function() {
    this.destinationMarkers.forEach(marker => this.map.removeLayer(marker));
    this.destinationMarkers = [];
};

DeliveryBirdGame.prototype.addDestinationMarkers = function() {
    // 全ての都市にマーカーを表示
    WORLD_CITIES.forEach((city) => {
        let markerColor = '#4169E1'; // デフォルト青（寄り道可能）
        let markerIcon = '🏢';
        let markerSize = [24, 24];
        
        // スロットにある目的地は📦マーカー
        const inSlot = this.gameState.destinationSlots.some(slot => 
            slot && slot.name === city.name
        );
        if (inSlot) {
            markerColor = '#00BFFF'; // 明るい青
            markerIcon = '📦';
            markerSize = [30, 30];
        }
        
        // 訪問済みは灰色
        if (this.gameState.visitedCities.has(city.name)) {
            markerColor = '#888888';
        }
        
        // 現在地は表示しない
        if (city.name === this.gameState.currentCity.name) {
            return;
        }
        
        const marker = L.marker([city.lat, city.lng], {
            icon: L.divIcon({
                className: inSlot ? 'destination-marker' : 'detour-marker',
                html: `<div style="background: ${markerColor}; color: white; padding: 4px; border-radius: 50%; text-align: center; font-weight: bold; font-size: 10px; min-width: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${markerIcon}</div>`,
                iconSize: markerSize,
                iconAnchor: [markerSize[0]/2, markerSize[1]/2]
            })
        }).addTo(this.map);
        
        this.destinationMarkers.push(marker);
    });
};

DeliveryBirdGame.prototype.updateDestinationMarkers = function() {
    // 既存のマーカーを削除
    this.clearDestinationMarkers();
    // 新しいマーカーを追加
    this.addDestinationMarkers();
};

DeliveryBirdGame.prototype.render = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 敵はスプライトで描画（spriteManager.jsで処理）

    // パワーアップを描画
    this.gameState.powerUps.forEach(powerUp => {
        const point = this.map.latLngToContainerPoint([powerUp.lat, powerUp.lng]);
        if (point.x >= -50 && point.x <= this.canvas.width + 50 && 
            point.y >= -50 && point.y <= this.canvas.height + 50) {
            this.ctx.font = '28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚡', point.x, point.y + 8);
        }
    });
};
