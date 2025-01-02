(function () {
    'use strict';

    let settings = {
        showNotification: true,
        buttonAnimation: true,
        pinPrecision: 1,
        safeMode: false
    };

    // Carica le impostazioni
    chrome.storage.local.get(settings, (items) => {
        settings = items;
    });

    // Funzione per mostrare notifiche
    function showNotification(text) {
        const notification = document.createElement('div');
        notification.className = 'ptsimo-notification';
        notification.textContent = text;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 99999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);

        // Aggiungiamo un suono di notifica
        const audio = new Audio(chrome.runtime.getURL('sounds/pin.mp3'));
        if (settings.showNotification) {
            audio.play().catch(() => {});
        }

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Funzione per generare un ritardo casuale per la modalità sicura
    function getSafeDelay() {
        return settings.safeMode ? Math.random() * 1000 + 500 : 500;
    }

    // Funzione per aggiungere una variazione casuale alla posizione in modalità sicura
    function addSafeOffset(value) {
        if (!settings.safeMode) return value;
        const offset = (Math.random() - 0.5) * 0.0001;
        return value + offset;
    }

    // Funzione per aggiornare le statistiche
    function updateStats(position) {
        chrome.storage.local.get({ pinCount: 0 }, (result) => {
            chrome.storage.local.set({
                pinCount: result.pinCount + 1,
                lastPosition: position
            });
        });
    }

    // Funzione per creare il pannello delle impostazioni
    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'ptsimo-settings';
        panel.style.cssText = `
            position: fixed;
            left: 10px;
            top: 20%;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 99999;
            display: none;
            width: 250px;
        `;

        panel.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">Impostazioni</h3>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">
                    <input type="checkbox" id="ptsimo-notifications" ${settings.showNotification ? 'checked' : ''}>
                    Mostra notifiche
                </label>
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">
                    <input type="checkbox" id="ptsimo-animation" ${settings.buttonAnimation ? 'checked' : ''}>
                    Animazione pulsante
                </label>
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Precisione del pin:</label>
                <input type="range" id="ptsimo-precision" min="0.1" max="1" step="0.1" value="${settings.pinPrecision}" style="width: 100%">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span>Preciso</span>
                    <span>Impreciso</span>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">
                    <input type="checkbox" id="ptsimo-safemode" ${settings.safeMode ? 'checked' : ''}>
                    Modalità sicura
                </label>
                <small style="color: #666;">Aggiunge variazioni casuali per evitare rilevamenti</small>
            </div>
            <button id="ptsimo-save" style="
                width: 100%;
                padding: 8px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Salva</button>
        `;

        document.body.appendChild(panel);

        // Gestione del salvataggio
        document.getElementById('ptsimo-save').addEventListener('click', () => {
            settings = {
                showNotification: document.getElementById('ptsimo-notifications').checked,
                buttonAnimation: document.getElementById('ptsimo-animation').checked,
                pinPrecision: parseFloat(document.getElementById('ptsimo-precision').value),
                safeMode: document.getElementById('ptsimo-safemode').checked
            };

            chrome.storage.local.set(settings, () => {
                showNotification('Impostazioni salvate!');
                panel.style.display = 'none';
            });
        });

        return panel;
    }

    window.addEventListener('load', () => {
        // Creo il contenitore per i pulsanti
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            position: fixed;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        // Pulsante Pin
        const pinButton = document.createElement('button');
        pinButton.innerHTML = '📍 Pin';
        pinButton.id = 'ptsimo-button';
        pinButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        // Pulsante Impostazioni
        const settingsButton = document.createElement('button');
        settingsButton.innerHTML = '⚙️';
        settingsButton.style.cssText = `
            background: #2196F3;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        if (settings.buttonAnimation) {
            pinButton.classList.add('animate');
        }

        // Creo il pannello delle impostazioni
        const settingsPanel = createSettingsPanel();

        // Gestione click sul pulsante impostazioni
        settingsButton.addEventListener('click', () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });

        // Gestione click sul pin
        pinButton.addEventListener('click', async () => {
            const iframe = document.querySelector('#PanoramaIframe');
            if (!iframe?.src) return;

            try {
                const url = new URL(iframe.src);
                const location = url.searchParams.get('location');
                if (location) {
                    const [lat, lng] = location.split(',').map(Number);
                    const position = `${lat}, ${lng}`;
                    
                    const guessButton = document.querySelector('button[class*="guess"]');
                    if (guessButton) {
                        guessButton.click();
                        
                        setTimeout(() => {
                            const map = document.querySelector('#map');
                            if (map) {
                                const mapRect = map.getBoundingClientRect();
                                const precision = settings.pinPrecision;
                                const x = mapRect.left + (mapRect.width * (addSafeOffset(lng) + 180) / 360) * precision;
                                const y = mapRect.top + (mapRect.height * (90 - addSafeOffset(lat)) / 180) * precision;

                                const clickEvent = new MouseEvent('click', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                    clientX: x,
                                    clientY: y
                                });
                                map.dispatchEvent(clickEvent);

                                if (settings.showNotification) {
                                    const modeText = settings.safeMode ? ' (Modalità sicura attiva)' : '';
                                    showNotification(`Pin posizionato a: ${position}${modeText}`);
                                }
                                updateStats(position);
                            }
                        }, getSafeDelay());
                    }
                }
            } catch (error) {
                console.error('Errore:', error);
            }
        });

        // Aggiungo i pulsanti al contenitore
        buttonContainer.appendChild(pinButton);
        buttonContainer.appendChild(settingsButton);
        document.body.appendChild(buttonContainer);

        // Chiudi il pannello delle impostazioni quando si clicca fuori
        document.addEventListener('click', (e) => {
            if (!settingsPanel.contains(e.target) && e.target !== settingsButton) {
                settingsPanel.style.display = 'none';
            }
        });
    });
})(); 