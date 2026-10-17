async function sinkronisasiStokServer979(isManual = false) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken || isSkipped) {
        if (isManual) alert("Mode Tamu / Belum Login: Tidak dapat melakukan sinkronisasi server.");
        setupWorkspaceHeader("Rak 979 (Stock Opname)", "Mode Tamu (OH = 0)", true);
        return;
    }

    setupWorkspaceHeader("Rak 979 (Stock Opname)", "Sync server...", true);

    let successCount = 0;
    for (let i = 0; i < dataMenu979.length; i++) {
        let item = dataMenu979[i];
        if (!item.barcode || item.barcode === "-") continue;

        try {
            let response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode: item.barcode, token: savedToken })
            });

            let result = await response.json();
            if (response.ok && result.success) {
                item.oh = parseInt(result.systemStock) || 0;
                item.selisih = item.qty - item.oh;
                
                let ohEl = document.getElementById(`oh-val-${i}`);
                let selisihEl = document.getElementById(`selisih-val-${i}`);
                if (ohEl) ohEl.innerText = item.oh;
                if (selisihEl) {
                    selisihEl.innerText = item.selisih;
                    if (item.selisih !== 0) {
                        selisihEl.style.color = "#ef4444";
                        selisihEl.style.fontWeight = "bold";
                    } else {
                        selisihEl.style.color = "inherit";
                        selisihEl.style.fontWeight = "normal";
                    }
                }
                successCount++;
            }
        } catch (e) {
            console.error(e);
        }
    }

    localStorage.setItem(STORAGE_KEY_979, JSON.stringify(dataMenu979));
    setupWorkspaceHeader("Rak 979 (Stock Opname)", `${successCount} item tersinkron`, true);
    if (isManual) alert(`Sinkronisasi Berhasil! Stok ${successCount} item diperbarui.`);
}
