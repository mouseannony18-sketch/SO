const CSV_URL = "https://docs.google.com/spreadsheets/d/15Albul63206zfgQ8vaa0krgcoryLURf2xEGv3K-UueI/export?format=csv";

let dataMenu979 = [];
const STORAGE_KEY_979 = "apo_data_menu_979";
let currentIndexAktif = null;
let html5QrCode = null;
let isFlashOn = false;

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

async function loadMenu979() {
    setupWorkspaceHeader("Rak 979 (Stock Opname)", "Memuat data...", true);

    let menuBebasContainer = document.getElementById('menuBebasContainer');
    if (menuBebasContainer) menuBebasContainer.classList.add('hidden');

    let soArea = document.getElementById('soFormArea');
    let adminArea = document.getElementById('adminFormArea');
    if (soArea) soArea.classList.add('hidden');
    if (adminArea) adminArea.classList.add('hidden');

    let menu979Container = document.getElementById('menu979Container');
    if (menu979Container) {
        menu979Container.classList.remove('hidden');
        menu979Container.innerHTML = `
            <!-- BARIS 1: TOMBOL RESET & CEK SELISIH -->
            <div class="top-action-bar-row1">
                <button onclick="konfirmasiResetData()" class="action-top-btn reset-btn" title="Reset Semua Data Qty">🗑️ Reset Data</button>
                <button onclick="filterSelisihToggle()" id="btnCekSelisih" class="action-top-btn selisih-btn">📊 Cek Selisih</button>
            </div>

            <!-- BARIS 2: PENCARIAN 75% & TOMBOL SCAN 20% -->
            <div class="top-action-bar-row2">
                <div class="search-box-wrapper">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="inputCariItem" oninput="handlePencarianInput(this.value)" placeholder="Cari PLU, Barcode, Nama..." class="modern-search-input" />
                    <button id="btnClearSearch" onclick="bersihkanPencarian()" class="clear-search-btn hidden">×</button>
                </div>
                <button onclick="bukaScannerKamera()" class="scan-btn">📷 Scan</button>
            </div>

            <!-- AREA SCANNER KAMERA -->
            <div id="scannerContainer" class="scanner-box hidden">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <b style="font-size: 12px; color: #38bdf8;">Arahkan Kamera ke Barcode</b>
                    <div style="display: flex; gap: 6px;">
                        <button id="flashToggleBtn" onclick="toggleFlashLight()" class="flash-ctrl-btn">⚡ Flash: OFF</button>
                        <button onclick="tutupScannerKamera()" class="close-scanner-btn">Tutup</button>
                    </div>
                </div>
                <div id="reader"></div>
            </div>

            <!-- TABEL UTAMA FULL LAYAR -->
            <div class="table-full-container">
                <table id="tabelMenu979">
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
                    <tbody id="tbodyMenu979"></tbody>
                </table>
            </div>
        `;
    }

    if (!window.Html5Qrcode) {
        let scriptTag = document.createElement('script');
        scriptTag.src = "https://unpkg.com/html5-qrcode";
        document.head.appendChild(scriptTag);
    }

    if (!document.getElementById('popupQtyModal')) {
        let modalDiv = document.createElement('div');
        modalDiv.id = 'popupQtyModal';
        modalDiv.className = 'modern-modal-overlay hidden';
        modalDiv.innerHTML = `
            <div class="modern-modal-card">
                <div class="modern-modal-header">
                    <span class="modal-product-title" id="modalNamaItem">-</span>
                    <button onclick="tutupPopupQty()" class="modern-close-x">&times;</button>
                </div>
                
                <div class="modern-meta-info">
                    <span>PLU: <b id="modalPluText">-</b></span>
                    <span>•</span>
                    <span>Barcode: <b id="modalBarcodeText">-</b></span>
                </div>

                <div class="modern-input-box-area">
                    <div class="modern-current-label">
                        Qty Tersimpan: <span id="modalCurrentQty">0</span>
                    </div>
                    <label class="modern-input-label">Tambah Qty (Tempat Lain):</label>
                    
                    <div class="modern-stepper-row">
                        <button onclick="ubahNilaiInputPopup(-1)" class="modern-step-btn">-</button>
                        <input type="number" id="modalInputTambah" value="0" class="modern-number-input" />
                        <button onclick="ubahNilaiInputPopup(1)" class="modern-step-btn">+</button>
                    </div>
                </div>

                <div class="modern-btn-row" style="margin-bottom: 8px;">
                    <button onclick="tutupPopupQty()" class="modern-btn-batal">Batal</button>
                    <button onclick="simpanQtyTambah()" class="modern-btn-simpan">Simpan</button>
                </div>
                <button onclick="resetQtyItem979()" style="width: 100%; background: #dc2626; color: white; border: none; border-radius: 8px; padding: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">🔄 Reset Qty Item Ini ke 0</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    try {
        let response = await fetch(CSV_URL);
        let csvText = await response.text();
        parseCSVData(csvText);
    } catch (error) {
        console.error(error);
        setupWorkspaceHeader("Rak 979 (Stock Opname)", "Gagal memuat data spreadsheet.", false);
    }
}

function parseCSVData(text) {
    let lines = text.split("\n");
    let masterItems = [];

    for (let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        let row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let plu = row[0] ? row[0].replace(/"/g, '').trim() : "";
        let barcode = row[1] ? row[1].replace(/"/g, '').trim() : "-";
        let namaItem = row[2] ? row[2].replace(/"/g, '').trim() : "";

        if (plu || namaItem) {
            masterItems.push({
                no: masterItems.length + 1,
                plu: plu,
                barcode: barcode,
                namaItem: namaItem,
                qty: 0,
                oh: 0,
                selisih: 0
            });
        }
    }

    let savedLocalData = localStorage.getItem(STORAGE_KEY_979);
    if (savedLocalData) {
        try {
            let parsedLocal = JSON.parse(savedLocalData);
            masterItems.forEach(master => {
                let found = parsedLocal.find(p => p.plu === master.plu);
                if (found) {
                    master.qty = found.qty || 0;
                    master.oh = found.oh || 0;
                    master.selisih = master.qty - master.oh;
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    dataMenu979 = masterItems;
    renderTabel979(dataMenu979);
    
    if (savedLocalData) {
        setupWorkspaceHeader("Rak 979 (Stock Opname)", `${dataMenu979.length} item (Tersimpan)`, true);
    } else {
        setupWorkspaceHeader("Rak 979 (Stock Opname)", `Sinkronisasi server...`, true);
        sinkronisasiStokServer979(false);
    }
}

function renderTabel979(listData) {
    let tbody = document.getElementById('tbodyMenu979');
    if (!tbody) return;
    tbody.innerHTML = "";

    listData.forEach((item) => {
        let realIndex = dataMenu979.findIndex(d => d.plu === item.plu);
        let selisihWarna = item.selisih !== 0 ? "color: #ef4444; font-weight: bold;" : "";
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center; font-size: 12px;">${item.no}</td>
            <td style="font-size: 12px;"><b>${item.plu}</b><br><small style="color: var(--text-muted);">${item.barcode}</small></td>
            <td style="font-size: 12px;">${item.namaItem}</td>
            <td style="text-align: center;">
                <div onclick="bukaPopupQty(${realIndex})" class="qty-pill-box" title="Klik untuk tambah/hitung ulang">
                    <span id="qty-text-${realIndex}" style="font-weight: bold; font-size: 14px; color: #38bdf8;">${item.qty}</span>
                    <small style="font-size: 9px; display: block; color: var(--text-muted);">ketuk edit</small>
                </div>
            </td>
            <td style="text-align: center; font-size: 13px;" id="oh-val-${realIndex}">${item.oh}</td>
            <td style="text-align: center; font-size: 13px; ${selisihWarna}" id="selisih-val-${realIndex}">${item.selisih}</td>
        `;
        tbody.appendChild(tr);
    });
}

function handlePencarianInput(val) {
    let clearBtn = document.getElementById('btnClearSearch');
    if (val.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
    filterPencarianRealtime(val);
}

function filterPencarianRealtime(keyword) {
    let query = keyword.toLowerCase().trim();
    if (!query) {
        if (statusFilterSelisih) {
            let filtered = dataMenu979.filter(item => item.selisih !== 0);
            renderTabel979(filtered);
        } else {
            renderTabel979(dataMenu979);
        }
        return;
    }

    let baseList = statusFilterSelisih ? dataMenu979.filter(item => item.selisih !== 0) : dataMenu979;
    let filtered = baseList.filter(item => 
        item.plu.toLowerCase().includes(query) ||
        item.barcode.toLowerCase().includes(query) ||
        item.namaItem.toLowerCase().includes(query)
    );

    renderTabel979(filtered);
}

function bersihkanPencarian() {
    let inputEl = document.getElementById('inputCariItem');
    inputEl.value = "";
    document.getElementById('btnClearSearch').classList.add('hidden');
    
    if (statusFilterSelisih) {
        let filtered = dataMenu979.filter(item => item.selisih !== 0);
        renderTabel979(filtered);
    } else {
        renderTabel979(dataMenu979);
    }
    inputEl.focus();
}

async function bukaScannerKamera() {
    let scannerBox = document.getElementById('scannerContainer');
    scannerBox.classList.remove('hidden');
    isFlashOn = false;
    updateFlashButtonUI();

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
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

            await html5QrCode.start(
                selectedCameraId,
                { fps: 20, qrbox: { width: 260, height: 140 } },
                (decodedText) => {
                    tutupScannerKamera();
                    cariDanBukaItemDariBarcode(decodedText.trim());
                },
                (errorMessage) => {}
            );
        } else {
            throw "Tidak ada kamera terdeteksi.";
        }
    } catch (err) {
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 260, height: 140 } },
            (decodedText) => {
                tutupScannerKamera();
                cariDanBukaItemDariBarcode(decodedText.trim());
            },
            (errorMessage) => {}
        ).catch(async fallbackErr => {
            await showModernAlert("Gagal mengaktifkan kamera: " + fallbackErr, "Error Kamera");
            scannerBox.classList.add('hidden');
        });
    }
}

function toggleFlashLight() {
    if (!html5QrCode || !html5QrCode.isScanning) return;

    isFlashOn = !isFlashOn;
    html5QrCode.applyVideoConstraints({
        advanced: [{ torch: isFlashOn }]
    }).then(() => {
        updateFlashButtonUI();
    }).catch(async err => {
        isFlashOn = !isFlashOn;
        await showModernAlert("Fitur Flash (Senter) tidak didukung pada perangkat ini.", "Informasi");
    });
}

function updateFlashButtonUI() {
    let btn = document.getElementById('flashToggleBtn');
    if (!btn) return;
    if (isFlashOn) {
        btn.style.background = "#eab308";
        btn.style.color = "#000";
        btn.innerText = "⚡ Flash: ON";
    } else {
        btn.style.background = "#4b5563";
        btn.style.color = "#fff";
        btn.innerText = "⚡ Flash: OFF";
    }
}

function tutupScannerKamera() {
    let scannerBox = document.getElementById('scannerContainer');
    scannerBox.classList.add('hidden');

    if (html5QrCode && html5QrCode.isScanning) {
        if (isFlashOn) {
            html5QrCode.applyVideoConstraints({ advanced: [{ torch: false }] }).catch(() => {});
            isFlashOn = false;
        }
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.error(err));
    }
}

function cariDanBukaItemDariBarcode(scannedBarcode) {
    let foundIndex = dataMenu979.findIndex(item => item.barcode === scannedBarcode);
    if (foundIndex !== -1) {
        bersihkanPencarian();
        bukaPopupQty(foundIndex);
    } else {
        showModernAlert(`Barcode [${scannedBarcode}] tidak ditemukan di dalam Master Rak 979.`, "Item Tidak Ditemukan");
    }
}

async function konfirmasiResetData() {
    let isConfirmed = await showModernConfirm("PERINGATAN: Apakah Anda yakin ingin mereset semua data Qty fisik?", "Reset Seluruh Rak");
    if (isConfirmed) {
        localStorage.removeItem(STORAGE_KEY_979);
        dataMenu979.forEach(item => {
            item.qty = 0;
            item.oh = 0;
            item.selisih = 0;
        });
        renderTabel979(dataMenu979);
        setupWorkspaceHeader("Rak 979 (Stock Opname)", "Data direset.", true);
        await showModernAlert("Semua data Qty berhasil direset!", "Sukses");
    }
}

function bukaPopupQty(index) {
    currentIndexAktif = index;
    let item = dataMenu979[index];

    document.getElementById('modalNamaItem').innerText = item.namaItem;
    document.getElementById('modalPluText').innerText = item.plu;
    document.getElementById('modalBarcodeText').innerText = item.barcode;
    document.getElementById('modalCurrentQty').innerText = item.qty;
    document.getElementById('modalInputTambah').value = "0";

    document.getElementById('popupQtyModal').classList.remove('hidden');
    document.getElementById('modalInputTambah').focus();
    document.getElementById('modalInputTambah').select();
}

function tutupPopupQty() {
    document.getElementById('popupQtyModal').classList.add('hidden');
    currentIndexAktif = null;
}

function ubahNilaiInputPopup(delta) {
    let inputEl = document.getElementById('modalInputTambah');
    let val = parseInt(inputEl.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    inputEl.value = val;
}

function simpanQtyTambah() {
    if (currentIndexAktif === null) return;

    let inputTambah = parseInt(document.getElementById('modalInputTambah').value) || 0;
    let item = dataMenu979[currentIndexAktif];

    item.qty += inputTambah;
    if (item.qty < 0) item.qty = 0;

    item.selisih = item.qty - item.oh;

    let qtySpan = document.getElementById(`qty-text-${currentIndexAktif}`);
    if (qtySpan) qtySpan.innerText = item.qty;

    let selisihEl = document.getElementById(`selisih-val-${currentIndexAktif}`);
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

    localStorage.setItem(STORAGE_KEY_979, JSON.stringify(dataMenu979));
    tutupPopupQty();
}

async function resetQtyItem979() {
    if (currentIndexAktif === null) return;
    let isConfirmed = await showModernConfirm("Reset Qty item ini menjadi 0?", "Konfirmasi Reset");
    if (isConfirmed) {
        let item = dataMenu979[currentIndexAktif];
        item.qty = 0;
        item.selisih = item.qty - item.oh;

        let qtySpan = document.getElementById(`qty-text-${currentIndexAktif}`);
        if (qtySpan) qtySpan.innerText = item.qty;

        let selisihEl = document.getElementById(`selisih-val-${currentIndexAktif}`);
        if (selisihEl) {
            selisihEl.innerText = item.selisih;
            selisihEl.style.color = "inherit";
            selisihEl.style.fontWeight = "normal";
        }

        localStorage.setItem(STORAGE_KEY_979, JSON.stringify(dataMenu979));
        renderTabel979(dataMenu979);
        tutupPopupQty();
    }
}

async function sinkronisasiStokServer979(isManual = false) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken || isSkipped) {
        if (isManual) await showModernAlert("Mode Tamu / Belum Login: Tidak dapat melakukan sinkronisasi server.", "Perhatian");
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
    if (isManual) await showModernAlert(`Sinkronisasi Rak 979 Berhasil! Stok ${successCount} item diperbarui.`, "Sukses");
}

let statusFilterSelisih = false;
function filterSelisihToggle() {
    statusFilterSelisih = !statusFilterSelisih;
    let btn = document.getElementById('btnCekSelisih');
    let keyword = document.getElementById('inputCariItem').value;

    if (statusFilterSelisih) {
        btn.style.background = "#dc2626";
        btn.innerText = "📋 Tampilkan Semua";
        let filtered = dataMenu979.filter(item => item.selisih !== 0);
        if (keyword) {
            filtered = filtered.filter(item => 
                item.plu.toLowerCase().includes(keyword) ||
                item.barcode.toLowerCase().includes(keyword) ||
                item.namaItem.toLowerCase().includes(keyword)
            );
        }
        renderTabel979(filtered);
    } else {
        btn.style.background = "#2563eb";
        btn.innerText = "📊 Cek Selisih";
        if (keyword) {
            filterPencarianRealtime(keyword);
        } else {
            renderTabel979(dataMenu979);
        }
    }
}

function exportExcel979() {
    exportUniversalReport("Stock Opname - Rak 979 (Rawan Hilang)", dataMenu979);
}
