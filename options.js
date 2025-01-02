// Carica le impostazioni salvate
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get({
        showNotification: true,
        buttonAnimation: true,
        pinPrecision: 1,
        safeMode: false
    }, (items) => {
        document.getElementById('showNotification').checked = items.showNotification;
        document.getElementById('buttonAnimation').checked = items.buttonAnimation;
        document.getElementById('pinPrecision').value = items.pinPrecision;
        document.getElementById('safeMode').checked = items.safeMode;
    });
});

// Salva le impostazioni
document.getElementById('save').addEventListener('click', () => {
    const settings = {
        showNotification: document.getElementById('showNotification').checked,
        buttonAnimation: document.getElementById('buttonAnimation').checked,
        pinPrecision: parseFloat(document.getElementById('pinPrecision').value),
        safeMode: document.getElementById('safeMode').checked
    };

    chrome.storage.local.set(settings, () => {
        // Mostra feedback di salvataggio
        const button = document.getElementById('save');
        button.textContent = 'Salvato!';
        setTimeout(() => {
            button.textContent = 'Salva impostazioni';
        }, 1500);
    });
}); 