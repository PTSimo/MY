document.addEventListener('DOMContentLoaded', () => {
    // Carica tutte le statistiche
    chrome.storage.local.get(['pinCount', 'lastPosition', 'avgPrecision'], (result) => {
        document.getElementById('pinCount').textContent = result.pinCount || 0;
        document.getElementById('lastPosition').textContent = result.lastPosition || '-';
        document.getElementById('avgPrecision').textContent = 
            result.avgPrecision ? `${(result.avgPrecision * 100).toFixed(1)}%` : '-';
    });

    // Gestisce il click sul pulsante opzioni
    document.getElementById('options').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
}); 