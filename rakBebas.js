// =========================================================
// MODUL RAK BEBAS / CUSTOMIZE (rakBebas.js)
// =========================================================

let dataRakBebas = [];
const STORAGE_KEY_BEBAS = "apo_data_rak_bebas";
let currentBebasIndex = null;
let html5QrCodeBebas = null;
let isFlashOnBebas = false;
let statusFilterSelisihBebas = false;

// HELPER MODAL ALERT & CONFIRM MODERN
function showModernAlert(message, title = "Informasi") {
    return new Promise((resolve) => {
        let existingModal = document.getElementById('modernGlobalAlertModal');
        if (existingModal) existingModal.remove();

        let modalDiv = document.createElement('div');
        modalDiv.id = 'modernGlobalAlertModal';
        modalDiv.className = 'modern-modal-overlay';
        modalDiv.innerHTML = `
            <div class="modern-modal-card" style="text-align: center;">
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text-color);">${title}</div>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.4;">${message}</div>
                <button id="alertOkBtn" style="width: 100%; background: #2563eb; color: white; border: none; border-radius: 8px; padding: 10px; font-weight: bold; font-size: 13px; cursor: pointer;">OK</button>
            </div>
        `;
        document.body.appendChild(modalDiv);

        document.getElementById('alertOkBtn').onclick = function() {
            modalDiv.remove();
            resolve(true);
        };
    });
}

function showModernConfirm(message, title = "Konfirmasi") {
    return new Promise((resolve) => {
        let existingModal = document.getElementById('modernGlobalConfirmModal');
        if (existingModal) existingModal.remove();

        let modalDiv = document.createElement('div');
        modalDiv.id = 'modernGlobalConfirmModal';
        modalDiv.className = 'modern-modal-overlay';
        modalDiv.innerHTML = `
            <div class="modern-modal-card" style="text-align: center;">
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text-color);">${title}</div>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.4;">${message}</div>
                <div style="display: flex; gap: 8px;">
                    <button id="confirmBatalBtn" style="flex: 1; background: #4b5563; color: white; border: none; border-radius: 8px; padding: 10px; font-weight: bold; font-size: 13px; cursor: pointer;">Batal</button>
                    <button id="confirmYaBtn" style="flex: 1; background: #dc2626; color: white; border: none; border-radius: 8px; padding: 10px; font-weight: bold; font-size: 13px; cursor: pointer;">Ya, Lanjutkan</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        document.getElementById('confirmBatalBtn').onclick = function() {
            modalDiv.remove();
            resolve(false);
        };
        document.getElementById('confirmYaBtn').onclick = function() {
            modalDiv.remove();
            resolve(true);
        };
    });
}

async function loadMenuRakBebas() {
    setupWorkspaceHeader("Rak Bebas / Customize", "Memuat item bebas...", true);

    let menu979Container = document.getElementById('menu979Container');
    if (menu979Container) menu979Container.classList.add('hidden');

    let soArea = document.getElementById('soFormArea');
    let adminArea = document.getElementById('adminFormArea');
    if (soArea) soArea.classList.add('hidden');
    if (adminArea) adminArea.classList.add('hidden');

    let container = document.getElementById('workspaceCard');
    let menuBebasContainer = document.getElementById('menuBebasContainer');
    
    if (!menuBebasContainer) {
        menuBebasContainer = document.createElement('div');
        menuBebasContainer.id = 'menuBebasContainer';
        container.appendChild(menuBebasContainer);
    }
    menuBebasContainer.classList.remove('hidden');

    menuBebasContainer.innerHTML = `
        <!-- BARIS 1: TOMBOL RESET & CEK SELISIH -->
        <div class="top-action-bar-row1">
            <button onclick="konfirmasiResetRakBebas()" class="action-top-btn reset-btn" title="Reset Semua Data Rak Bebas">🗑️ Reset Data</button>
            <button onclick="filterSelisihToggleBebas()" id="btnCekSelisihBebas" class="action-top-btn selisih-btn">📊 Cek Selisih</button>
        </div>

        <!-- BARIS 2: PENCARIAN 75% & TOMBOL SCAN 20% -->
        <div class="top-action-bar-row2">
            <div class="search-box-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" id="inputCariBebas" onkeydown="handleKeyInputRakBebas(event, this.value)" oninput="handlePencarianBebas(this.value)" placeholder="Ketik Barcode / PLU lalu Enter..." class="modern-search-input" />
                <button id="btnClearSearchBebas" onclick="bersihkanPencarianBebas()" class="clear-search-btn hidden">×</button>
            </div>
            <button onclick="bukaScannerBebas()" class="scan-btn">📷 Scan</button>
        </div>

        <!-- AREA SCANNER KAMERA -->
        <div id="scannerContainerBebas" class="scanner-box hidden">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <b style="font-size: 12px; color: #38bdf8;">Arahkan Kamera ke Barcode Barang</b>
                <div style="display: flex; gap: 6px;">
                    <button id="flashToggleBtnBebas" onclick="toggleFlashBebas()" class="flash-ctrl-btn">⚡ Flash: OFF</button>
                    <button onclick="tutupScannerBebas()" class="close-scanner-btn">Tutup</button>
                </div>
            </div>
            <div id="readerBebas"></div>
        </div>

        <!-- TABEL UTAMA FULL LAYAR -->
        <div class="table-full-container">
            <table id="tabelRakBebas">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th>PLU / Barcode</th>
                        <th>Nama Item</th>
                        <th style="text-align: center; width: 110px;">QTY (Fisik)</th>
                        <th style="text-align: center; width: 50px;">OH</th>
                        <th style="text-align: center; width: 60px;">Selisih</th>
                    </tr>
                </thead>
                <tbody id="tbodyRakBebas"></tbody>
            </table>
        </div>
    `;

    if (!window.Html5Qrcode) {
        let scriptTag = document.createElement('script');
        scriptTag.src = "https://unpkg.com/html5-qrcode";
        document.head.appendChild(scriptTag);
    }

    if (!document.getElementById('popupQtyModalBebas')) {
        let modalDiv = document.createElement('div');
        modalDiv.id = 'popupQtyModalBebas';
        modalDiv.className = 'modern-modal-overlay hidden';
        modalDiv.innerHTML = `
            <div class="modern-modal-card">
                <div class="modern-modal-header">
                    <span class="modal-product-title" id="modalNamaItemBebas">-</span>
                    <button onclick="tutupPopupBebas()" class="modern-close-x">&times;</button>
                </div>
                
                <div class="modern-meta-info">
                    <span>PLU: <b id="modalPluBebas">-</b></span>
                    <span>•</span>
                    <span>Barcode: <b id="modalBarcodeBebas">-</b></span>
                </div>

                <div class="modern-input-box-area">
                    <div class="modern-current-label">
                        Qty Tersimpan: <span id="modalCurrentQtyBebas">0</span>
                    </div>
                    <label class="modern-input-label">Tambah / Ubah Qty Fisik:</label>
                    
                    <div class="modern-stepper-row">
                        <button onclick="ubahNilaiBebas(-1)" class="modern-step-btn">-</button>
                        <input type="number" id="modalInputTambahBebas" value="0" class="modern-number-input" />
                        <button onclick="ubahNilaiBebas(1)" class="modern-step-btn">+</button>
                    </div>
                </div>

                <div class="modern-btn-row" style="margin-bottom: 8px;">
                    <button onclick="tutupPopupBebas()" class="modern-btn-batal">Batal</button>
                    <button onclick="simpanQtyBebas()" class="modern-btn-simpan">Simpan</button>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button onclick="resetQtyItemBebas()" style="flex: 1; background: #eab308; color: #000; border: none; border-radius: 8px; padding: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">🔄 Reset Qty ke 0</button>
                    <button onclick="hapusItemDariPopup()" style="flex: 1; background: #dc2626; color: white; border: none; border-radius: 8px; padding: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">🗑️ Hapus Item</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    muatDataLokalRakBebas();
}

function muatDataLokalRakBebas() {
    let saved = localStorage.getItem(STORAGE_KEY_BEBAS);
    if (saved) {
        try {
            dataRakBebas = JSON.parse(saved);
        } catch (e) {
            dataRakBebas = [];
        }
    } else {
        dataRakBebas = [];
    }
    renderTabelRakBebas(dataRakBebas);
    setupWorkspaceHeader("Rak Bebas / Customize", `${dataRakBebas.length} item tersimpan`, true, `<button onclick="exportExcelRakBebas()">📥 Download / Cetak</button>`);
}

function renderTabelRakBebas(listData) {
    let tbody = document.getElementById('tbodyRakBebas');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (listData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 25px;">Belum ada item. Ketik Barcode/PLU lalu tekan Enter atau klik Scan.</td></tr>`;
        return;
    }

    listData.forEach((item, idx) => {
        let realIndex = dataRakBebas.findIndex(d => d.barcode === item.barcode || d.plu === item.plu);
        let selisihWarna = item.selisih !== 0 ? "color: #ef4444; font-weight: bold;" : "";

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center; font-size: 12px;">${idx + 1}</td>
            <td style="font-size: 12px;"><b>${item.plu || '-'}</b><br><small style="color: var(--text-muted);">${item.barcode}</small></td>
            <td style="font-size: 12px;">${item.namaItem}</td>
            <td style="text-align: center;">
                <div onclick="bukaPopupBebas(${realIndex})" class="qty-pill-box" title="Klik untuk edit qty">
                    <span style="font-weight: bold; font-size: 14px; color: #38bdf8;">${item.qty}</span>
                    <small style="font-size: 9px; display: block; color: var(--text-muted);">ketuk edit</small>
                </div>
            </td>
            <td style="text-align: center; font-size: 13px;" id="oh-bebas-${idx}">${item.oh}</td>
            <td style="text-align: center; font-size: 13px; ${selisihWarna}" id="selisih-bebas-${idx}">${item.selisih}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleKeyInputRakBebas(event, val) {
    if (event.key === 'Enter') {
        event.preventDefault();
        let query = val.trim();
        if (!query) return;

        await tambahAtauCariItemRakBebas(query);
        let inputEl = document.getElementById('inputCariBebas');
        inputEl.value = "";
        bersihkanPencarianBebas();
    }
}

function handlePencarianBebas(val) {
    let clearBtn = document.getElementById('btnClearSearchBebas');
    if (val.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }

    let query = val.toLowerCase().trim();
    if (!query) {
        renderTabelRakBebas(dataRakBebas);
        return;
    }

    let filtered = dataRakBebas.filter(item => 
        (item.plu && item.plu.toLowerCase().includes(query)) ||
        (item.barcode && item.barcode.toLowerCase().includes(query)) ||
        (item.namaItem && item.namaItem.toLowerCase().includes(query))
    );
    renderTabelRakBebas(filtered);
}

function bersihkanPencarianBebas() {
    let inputEl = document.getElementById('inputCariBebas');
    inputEl.value = "";
    document.getElementById('btnClearSearchBebas').classList.add('hidden');
    renderTabelRakBebas(dataRakBebas);
    inputEl.focus();
}

async function tambahAtauCariItemRakBebas(code) {
    let existing = dataRakBebas.find(d => d.barcode === code || d.plu === code);
    if (existing) {
        let idx = dataRakBebas.indexOf(existing);
        bukaPopupBebas(idx);
        return;
    }

    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken || isSkipped) {
        await showModernAlert("Mode Tamu / Belum Login: Tidak dapat melakukan verifikasi barcode ke server.", "Akses Terbatas");
        return;
    }

    let namaBarang = "";
    let systemStock = 0;
    let pluVal = code;
    let barcodeVal = code;
    let isFound = false;

    try {
        let response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: code, token: savedToken })
        });
        let result = await response.json();
        
        if (response.ok && result.success && result.productName) {
            namaBarang = result.productName;
            systemStock = parseInt(result.systemStock) || 0;
            if (result.raw && result.raw.plu) pluVal = result.raw.plu;
            isFound = true;
        }
    } catch (e) {
        console.error(e);
    }

    if (!isFound) {
        await showModernAlert(`Item dengan Barcode / PLU [${code}] tidak tersedia di inventory. Coba lagi atau scan ulang.`, "Item Tidak Ditemukan");
        return;
    }

    let newItem = {
        no: dataRakBebas.length + 1,
        plu: pluVal,
        barcode: barcodeVal,
        namaItem: namaBarang,
        qty: 0,
        oh: systemStock,
        selisih: 0 - systemStock
    };

    dataRakBebas.push(newItem);
    localStorage.setItem(STORAGE_KEY_BEBAS, JSON.stringify(dataRakBebas));
    renderTabelRakBebas(dataRakBebas);
    bukaPopupBebas(dataRakBebas.length - 1);
}

async function sinkronisasiStokServerBebas(isManual = false) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken || isSkipped) {
        if (isManual) await showModernAlert("Mode Tamu / Belum Login: Tidak dapat melakukan sinkronisasi server.", "Perhatian");
        return;
    }

    if (dataRakBebas.length === 0) {
        if (isManual) await showModernAlert("Belum ada item di Rak Bebas untuk disinkronkan.", "Informasi");
        return;
    }

    setupWorkspaceHeader("Rak Bebas / Customize", "Sync server...", true);

    let successCount = 0;
    for (let i = 0; i < dataRakBebas.length; i++) {
        let item = dataRakBebas[i];
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
                
                let ohEl = document.getElementById(`oh-bebas-${i}`);
                let selisihEl = document.getElementById(`selisih-bebas-${i}`);
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

    localStorage.setItem(STORAGE_KEY_BEBAS, JSON.stringify(dataRakBebas));
    setupWorkspaceHeader("Rak Bebas / Customize", `${dataRakBebas.length} item tersimpan`, true, `<button onclick="exportExcelRakBebas()">📥 Download / Cetak</button>`);
    if (isManual) await showModernAlert(`Sinkronisasi Rak Bebas Berhasil! Stok ${successCount} item diperbarui.`, "Sukses");
}

async function bukaScannerBebas() {
    let scannerBox = document.getElementById('scannerContainerBebas');
    scannerBox.classList.remove('hidden');
    isFlashOnBebas = false;
    updateFlashButtonUIBebas();

    if (!html5QrCodeBebas) {
        html5QrCodeBebas = new Html5Qrcode("readerBebas");
    }

    try {
        let devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
            let selectedCameraId = devices[0].id;
            let backCameras = devices.filter(device => {
                let label = device.label.toLowerCase();
                return label.includes('back') || label.includes('rear') || label.includes('belakang');
            });

            if (backCameras.length > 0) {
                selectedCameraId = backCameras[backCameras.length - 1].id;
            } else if (devices.length > 1) {
                selectedCameraId = devices[1].id;
            }

            await html5QrCodeBebas.start(
                selectedCameraId,
                { fps: 20, qrbox: { width: 260, height: 140 } },
                (decodedText) => {
                    tutupScannerBebas();
                    tambahAtauCariItemRakBebas(decodedText.trim());
                },
                (errorMessage) => {}
            );
        } else {
            throw "Tidak ada kamera.";
        }
    } catch (err) {
        html5QrCodeBebas.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 260, height: 140 } },
            (decodedText) => {
                tutupScannerBebas();
                tambahAtauCariItemRakBebas(decodedText.trim());
            },
            (errorMessage) => {}
        ).catch(async fallbackErr => {
            await showModernAlert("Gagal mengaktifkan kamera: " + fallbackErr, "Error Kamera");
            scannerBox.classList.add('hidden');
        });
    }
}

function toggleFlashBebas() {
    if (!html5QrCodeBebas || !html5QrCodeBebas.isScanning) return;
    isFlashOnBebas = !isFlashOnBebas;
    html5QrCodeBebas.applyVideoConstraints({ advanced: [{ torch: isFlashOnBebas }] }).then(() => {
        updateFlashButtonUIBebas();
    }).catch(async () => {
        isFlashOnBebas = !isFlashOnBebas;
        await showModernAlert("Fitur Senter tidak didukung perangkat ini.", "Informasi");
    });
}

function updateFlashButtonUIBebas() {
    let btn = document.getElementById('flashToggleBtnBebas');
    if (!btn) return;
    if (isFlashOnBebas) {
        btn.style.background = "#eab308";
        btn.style.color = "#000";
        btn.innerText = "⚡ Flash: ON";
    } else {
        btn.style.background = "#4b5563";
        btn.style.color = "#fff";
        btn.innerText = "⚡ Flash: OFF";
    }
}

function tutupScannerBebas() {
    let scannerBox = document.getElementById('scannerContainerBebas');
    scannerBox.classList.add('hidden');
    if (html5QrCodeBebas && html5QrCodeBebas.isScanning) {
        if (isFlashOnBebas) {
            html5QrCodeBebas.applyVideoConstraints({ advanced: [{ torch: false }] }).catch(() => {});
            isFlashOnBebas = false;
        }
        html5QrCodeBebas.stop().then(() => html5QrCodeBebas.clear()).catch(err => console.error(err));
    }
}

function bukaPopupBebas(index) {
    currentBebasIndex = index;
    let item = dataRakBebas[index];

    document.getElementById('modalNamaItemBebas').innerText = item.namaItem;
    document.getElementById('modalPluBebas').innerText = item.plu || "-";
    document.getElementById('modalBarcodeBebas').innerText = item.barcode;
    document.getElementById('modalCurrentQtyBebas').innerText = item.qty;
    document.getElementById('modalInputTambahBebas').value = "0";

    document.getElementById('popupQtyModalBebas').classList.remove('hidden');
    document.getElementById('modalInputTambahBebas').focus();
    document.getElementById('modalInputTambahBebas').select();
}

function tutupPopupBebas() {
    document.getElementById('popupQtyModalBebas').classList.add('hidden');
    currentBebasIndex = null;
}

function ubahNilaiBebas(delta) {
    let inputEl = document.getElementById('modalInputTambahBebas');
    let val = parseInt(inputEl.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    inputEl.value = val;
}

function simpanQtyBebas() {
    if (currentBebasIndex === null) return;
    let tambah = parseInt(document.getElementById('modalInputTambahBebas').value) || 0;
    let item = dataRakBebas[currentBebasIndex];

    item.qty += tambah;
    if (item.qty < 0) item.qty = 0;
    item.selisih = item.qty - item.oh;

    localStorage.setItem(STORAGE_KEY_BEBAS, JSON.stringify(dataRakBebas));
    renderTabelRakBebas(dataRakBebas);
    tutupPopupBebas();
}

async function resetQtyItemBebas() {
    if (currentBebasIndex === null) return;
    let isConfirmed = await showModernConfirm("Reset Qty item ini menjadi 0?", "Konfirmasi Reset");
    if (isConfirmed) {
        let item = dataRakBebas[currentBebasIndex];
        item.qty = 0;
        item.selisih = item.qty - item.oh;

        localStorage.setItem(STORAGE_KEY_BEBAS, JSON.stringify(dataRakBebas));
        renderTabelRakBebas(dataRakBebas);
        tutupPopupBebas();
    }
}

async function hapusItemDariPopup() {
    if (currentBebasIndex === null) return;
    let isConfirmed = await showModernConfirm("Hapus item ini dari daftar Rak Bebas?", "Konfirmasi Hapus");
    if (isConfirmed) {
        dataRakBebas.splice(currentBebasIndex, 1);
        dataRakBebas.forEach((d, idx) => d.no = idx + 1);
        localStorage.setItem(STORAGE_KEY_BEBAS, JSON.stringify(dataRakBebas));
        renderTabelRakBebas(dataRakBebas);
        tutupPopupBebas();
        setupWorkspaceHeader("Rak Bebas / Customize", `${dataRakBebas.length} item tersimpan`, true, `<button onclick="exportExcelRakBebas()">📥 Download / Cetak</button>`);
    }
}

async function konfirmasiResetRakBebas() {
    let isConfirmed = await showModernConfirm("PERINGATAN: Apakah Anda yakin ingin mereset dan menghapus semua item di Rak Bebas?", "Reset Seluruh Rak");
    if (isConfirmed) {
        localStorage.removeItem(STORAGE_KEY_BEBAS);
        dataRakBebas = [];
        renderTabelRakBebas(dataRakBebas);
        setupWorkspaceHeader("Rak Bebas / Customize", "Data direset", true, `<button onclick="exportExcelRakBebas()">📥 Download / Cetak</button>`);
        await showModernAlert("Rak Bebas berhasil dikosongkan!", "Sukses");
    }
}

function filterSelisihToggleBebas() {
    statusFilterSelisihBebas = !statusFilterSelisihBebas;
    let btn = document.getElementById('btnCekSelisihBebas');
    
    if (statusFilterSelisihBebas) {
        btn.style.background = "#dc2626";
        btn.innerText = "📋 Tampilkan Semua";
        let filtered = dataRakBebas.filter(item => item.selisih !== 0);
        renderTabelRakBebas(filtered);
    } else {
        btn.style.background = "#2563eb";
        btn.innerText = "📊 Cek Selisih";
        renderTabelRakBebas(dataRakBebas);
    }
}

function exportExcelRakBebas() {
    exportUniversalReport("Stock Opname - Rak Bebas / Customize", dataRakBebas);
}
