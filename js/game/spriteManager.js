// スプライトアニメーション管理クラス
class SpriteManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.meimeiElement = null;
        this.enemyElements = [];
        this.powerupElements = [];
        this.lastDirection = 'up'; // 最後の移動方向を上向きに変更
        this.isMoving = false;
        this.currentAngle = 0; // 現在の角度
        
        this.init();
    }
    
    init() {
        this.meimeiElement = document.getElementById('meimei-center');
        if (!this.meimeiElement) {
            console.error('メイメイ要素が見つかりません');
            return;
        }
        
        // 初期状態を設定
        this.updateMeimeiSprite();
    }
    
    // メイメイのスプライト状態を更新
    updateMeimeiSprite() {
        if (!this.meimeiElement) return;
        
        // 全てのクラスをリセット
        this.meimeiElement.className = '';
        
        const player = this.gameState.player;
        
        // 状態に応じてスプライト画像を設定（停止時も表示）
        if (player.isStunned) {
            this.meimeiElement.style.backgroundImage = "url('images/sprites/meimei-stunned.png')";
            this.meimeiElement.classList.add('stunned');
        } else if (player.isPoweredUp) {
            this.meimeiElement.style.backgroundImage = "url('images/sprites/meimei-powerup.png')";
            this.meimeiElement.classList.add('powered-up');
            if (this.isMoving) {
                this.meimeiElement.classList.add('flying');
            }
        } else {
            this.meimeiElement.style.backgroundImage = "url('images/sprites/meimei.png')";
            if (this.isMoving) {
                this.meimeiElement.classList.add('flying');
            }
        }
        
        // 無敵状態
        if (player.isInvincible) {
            this.meimeiElement.classList.add('invincible');
        }
        
        // 角度に応じて回転（上向き基準、0度が上向き）
        const rotation = this.currentAngle || 0;
        
        // 全てのクラスをリセットしてから角度を適用
        this.meimeiElement.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        
        // 方向判定は角度から計算（デバッグ用）
        if (rotation >= -45 && rotation < 45) {
            this.lastDirection = 'up';
        } else if (rotation >= 45 && rotation < 135) {
            this.lastDirection = 'right';
        } else if (rotation >= 135 || rotation < -135) {
            this.lastDirection = 'down';
        } else {
            this.lastDirection = 'left';
        }
    }
    
    // 移動状態を設定
    setMoving(isMoving, direction = null) {
        this.isMoving = isMoving;
        if (direction) {
            this.lastDirection = direction;
        }
        this.updateMeimeiSprite();
    }
    
    // 角度を設定
    setAngle(angle) {
        this.currentAngle = angle;
        this.updateMeimeiSprite();
    }
    
    // 方向を設定
    setDirection(direction) {
        if (direction !== this.lastDirection) {
            this.lastDirection = direction;
            this.updateMeimeiSprite();
        }
    }
    
    // 敵スプライトを作成
    // 敵スプライトを作成（Leafletマーカーとして）
    createEnemySprite(enemy) {
        console.log('Creating enemy marker (display disabled):', enemy.id, 'at', enemy.lat.toFixed(4), enemy.lng.toFixed(4));
        
        // 一時的にコメントアウト - 表示のみ無効化
        /*
        // Leafletが利用可能かチェック
        if (typeof L === 'undefined') {
            console.error('Leaflet is not available');
            return null;
        }
        
        // 既存の同じIDのマーカーがあれば削除
        const existingMarker = this.enemyElements.find(elem => elem.enemy.id === enemy.id);
        if (existingMarker && existingMarker.marker) {
            console.warn(`Removing duplicate enemy marker: ${enemy.id}`);
            if (window.deliveryBirdGame && window.deliveryBirdGame.map) {
                window.deliveryBirdGame.map.removeLayer(existingMarker.marker);
            }
            this.enemyElements = this.enemyElements.filter(elem => elem.enemy.id !== enemy.id);
        }
        
        // 敵の種類に応じてスプライト画像を設定
        const spriteImages = [
            'images/sprites/enemy-red.png',
            'images/sprites/enemy-yellow.png', 
            'images/sprites/enemy-blue.png'
        ];
        
        // カスタムアイコンを作成（ユニークIDを追加）
        const enemyIcon = L.divIcon({
            className: `enemy-sprite enemy-type-${enemy.type} flying enemy-${enemy.id}`,
            html: `<div id="enemy-sprite-${enemy.id}" style="
                width: 64px; 
                height: 64px; 
                background-image: url('${spriteImages[enemy.type]}'); 
                background-size: contain; 
                background-repeat: no-repeat; 
                background-position: center;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
                position: relative;
                z-index: 9999;
                pointer-events: none;
            "></div>`,
            iconSize: [64, 64],
            iconAnchor: [32, 32],
            popupAnchor: [0, -32]
        });
        
        // Leafletマーカーを作成
        const enemyMarker = L.marker([enemy.lat, enemy.lng], {
            icon: enemyIcon,
            zIndexOffset: 2000 + Math.floor(enemy.id * 1000) % 1000 // より高いzIndexで確実に表示
        });
        
        // マーカーにカスタムプロパティを追加
        enemyMarker.enemyId = enemy.id;
        enemyMarker.enemyType = enemy.type;
        enemyMarker.isEnemyMarker = true; // 敵マーカーの識別用
        
        // 地図に追加
        if (window.deliveryBirdGame && window.deliveryBirdGame.map) {
            enemyMarker.addTo(window.deliveryBirdGame.map);
            console.log('Enemy marker added to map with ID:', enemy.id);
        } else {
            console.error('Map not available for enemy marker');
            return null;
        }
        
        this.enemyElements.push({
            marker: enemyMarker,
            enemy: enemy
        });
        
        return enemyMarker;
        */
        
        // 表示なしでenemyElementsに追加（ロジックは維持）
        this.enemyElements.push({
            marker: null, // マーカーなし
            enemy: enemy
        });
        
        return null;
    }
    
    // 敵スプライトの位置を更新（Leafletマーカー）
    updateEnemySprites() {
        console.log('Updating enemy markers (display disabled), count:', this.enemyElements.length);
        
        // 一時的にコメントアウト - 表示のみ無効化
        /*
        // 地図の現在の表示範囲を確認（最初の敵のみ）
        if (window.deliveryBirdGame && window.deliveryBirdGame.map && this.enemyElements.length > 0) {
            const bounds = window.deliveryBirdGame.map.getBounds();
            const center = window.deliveryBirdGame.map.getCenter();
            const zoom = window.deliveryBirdGame.map.getZoom();
            console.log(`Map center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}, zoom: ${zoom}`);
            
            // 地図上のすべてのレイヤーを確認
            let markerCount = 0;
            window.deliveryBirdGame.map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    markerCount++;
                }
            });
            console.log(`Total markers on map: ${markerCount}, Expected: ${this.enemyElements.length}`);
        }
        
        this.enemyElements.forEach(({ marker, enemy }, index) => {
            if (!enemy.active) {
                // 非アクティブな敵のマーカーを地図から削除
                if (window.deliveryBirdGame && window.deliveryBirdGame.map && marker) {
                    window.deliveryBirdGame.map.removeLayer(marker);
                    console.log(`Removed inactive enemy marker: ${enemy.id}`);
                }
                return;
            }
            
            // マーカーの位置を更新
            if (marker) {
                try {
                    const oldLatLng = marker.getLatLng();
                    const newLatLng = [enemy.lat, enemy.lng];
                    
                    // 位置が実際に変わったかチェック
                    const moved = Math.abs(oldLatLng.lat - enemy.lat) > 0.0001 || Math.abs(oldLatLng.lng - enemy.lng) > 0.0001;
                    
                    marker.setLatLng(newLatLng);
                    
                    // Leafletマーカーの強制再描画
                    if (moved) {
                        marker.update();
                    }
                    
                    // マーカーが地図に追加されているか確認
                    if (!window.deliveryBirdGame.map.hasLayer(marker)) {
                        console.warn(`Enemy ${enemy.id} marker not on map, re-adding`);
                        marker.addTo(window.deliveryBirdGame.map);
                    }
                    
                    if (moved || index === 0) { // 移動した場合または最初の敵の場合のみログ
                        console.log(`Enemy ${enemy.id} (index ${index}) marker updated: lat=${enemy.lat.toFixed(4)}, lng=${enemy.lng.toFixed(4)}, moved=${moved}`);
                    }
                    
                    // マーカーの可視性を強制的に確保
                    const markerElement = marker.getElement();
                    if (markerElement) {
                        markerElement.style.display = 'block';
                        markerElement.style.visibility = 'visible';
                        markerElement.style.opacity = '1';
                        
                        // マーカー要素にデバッグ情報を追加
                        markerElement.setAttribute('data-enemy-id', enemy.id);
                        markerElement.setAttribute('data-enemy-type', enemy.type);
                        
                        const spriteDiv = markerElement.querySelector('div');
                        if (spriteDiv) {
                            // 全ての方向クラスをリセット
                            spriteDiv.classList.remove('facing-left', 'facing-right');
                            
                            // 敵の角度から向きを決定（-90度補正済み）
                            const normalizedAngle = ((enemy.angle % 360) + 360) % 360;
                            
                            if (normalizedAngle >= 90 && normalizedAngle < 270) {
                                // 左向き（90度〜270度）
                                spriteDiv.classList.add('facing-left');
                            } else {
                                // 右向き（270度〜90度）
                                spriteDiv.classList.add('facing-right');
                            }
                        }
                    } else {
                        console.warn(`Enemy ${enemy.id} marker element not found`);
                    }
                } catch (error) {
                    console.error(`Error updating enemy ${enemy.id} marker:`, error);
                }
            } else {
                console.warn(`Enemy ${enemy.id} marker is null`);
            }
        });
        
        // 非アクティブな敵を削除
        this.enemyElements = this.enemyElements.filter(({ marker, enemy }) => {
            if (!enemy.active) {
                if (window.deliveryBirdGame && window.deliveryBirdGame.map && marker) {
                    window.deliveryBirdGame.map.removeLayer(marker);
                }
                return false;
            }
            return true;
        });
        */
        
        // 非アクティブな敵のみ削除（ロジックは維持）
        this.enemyElements = this.enemyElements.filter(({ enemy }) => {
            return enemy.active;
        });
    }
    
    // パワーアップアイテムのスプライトを作成
    createPowerupSprite(powerup) {
        const powerupElement = document.createElement('div');
        powerupElement.className = 'powerup-sprite';
        powerupElement.id = `powerup-${powerup.id}`;
        
        // 地図コンテナに追加
        const mapContainer = document.getElementById('map-container');
        mapContainer.appendChild(powerupElement);
        
        this.powerupElements.push({
            element: powerupElement,
            powerup: powerup
        });
        
        return powerupElement;
    }
    
    // パワーアップアイテムの位置を更新
    updatePowerupSprites() {
        this.powerupElements.forEach(({ element, powerup }) => {
            if (!powerup.active) {
                element.remove();
                return;
            }
            
            // 画面座標に変換
            const screenPos = this.worldToScreen(powerup.lat, powerup.lng);
            element.style.left = `${screenPos.x - 16}px`; // 32px / 2
            element.style.top = `${screenPos.y - 16}px`;
        });
        
        // 非アクティブなパワーアップを削除
        this.powerupElements = this.powerupElements.filter(({ element, powerup }) => {
            if (!powerup.active) {
                element.remove();
                return false;
            }
            return true;
        });
    }
    
    // 世界座標を画面座標に変換
    worldToScreen(lat, lng) {
        // 地図の中心からの相対位置を計算
        const player = this.gameState.player;
        const latDiff = lat - player.lat;
        const lngDiff = lng - player.lng;
        
        // 画面サイズを取得
        const mapContainer = document.getElementById('map-container');
        const centerX = mapContainer.clientWidth / 2;
        const centerY = mapContainer.clientHeight / 2;
        
        // 緯度経度の差を画面座標に変換
        // 地図のズームレベルに応じて調整
        const zoomLevel = GAME_CONFIG.MAP_ZOOM || 6;
        const scale = Math.pow(2, zoomLevel) * 0.5; // ズームレベルに応じたスケール
        
        const x = centerX + (lngDiff * scale * 100);
        const y = centerY - (latDiff * scale * 100); // 緯度は上下反転
        
        return { x, y };
    }
    
    // 全スプライトを更新
    updateAllSprites() {
        this.updateMeimeiSprite();
        this.updateEnemySprites();
        this.updatePowerupSprites();
    }
    
    // クリーンアップ
    cleanup() {
        // 敵マーカーを削除（表示が無効化されているため、マーカーはnull）
        this.enemyElements.forEach(({ marker, element }) => {
            // 表示が無効化されているため、実際のマーカー削除は不要
            /*
            if (marker && window.deliveryBirdGame && window.deliveryBirdGame.map) {
                // Leafletマーカーを削除
                window.deliveryBirdGame.map.removeLayer(marker);
            } else if (element) {
                // DOM要素を削除（フォールバック）
                element.remove();
            }
            */
        });
        this.enemyElements = [];
        
        // パワーアップスプライトを削除
        this.powerupElements.forEach(({ element }) => {
            element.remove();
        });
        this.powerupElements = [];
    }
}
