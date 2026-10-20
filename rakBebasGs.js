// =========================================================
// MODUL SO RAK BEBAS BY GOOGLE SPREADSHEET (rakBebasGs.js)
// =========================================================

let dataRakBebasGs = [];
let STORAGE_KEY_BEBAS_GS = "apo_data_rak_bebas_gs";
let STORAGE_ID_KEY = "apo_last_spreadsheet_id";
let STORAGE_SHEET_KEY = "apo_last_sheet_name";
let currentIndexAktifGs = null;
let html5QrCodeGs = null;
let isFlashOnGs = false;
let statusFilterSelisihGs = false;
let currentSpreadsheetId = "";
let currentSheetName = "";
let workbookGlobal = null;

// Fungsi Pembuka Menu dari Halaman Utama
function pilihMenuBebasGs() {
    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');
    
    if (mainMenuCard) mainMenuCard.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.remove('hidden');
    
    loadMenuRakBebasGs();
}

// Fungsi Utama Saat Menu Dipilih
function loadMenuRakBebasGs() {
    let workspaceCard = document.getElementById('workspaceCard');
    let menu979Container = document.getElementById('menu979Container');
    let menuBebasContainer = document.getElementById('menuBebasContainer');
    let soFormArea = document.getElementById('soFormArea');
    let adminFormArea = document.getElementById('adminFormArea');

    if (menu979Container) menu979Container.classList.add('hidden');
    if (menuBebasContainer) menuBebasContainer.classList.add('hidden');
    if (soFormArea) soFormArea.classList.add('hidden');
    if (adminFormArea) adminFormArea.classList.add('hidden');

    let container = document.getElementById('menuBebasGsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'menuBebasGsContainer';
        workspaceCard.appendChild(container);
    }
    container.classList.remove('hidden');

    let lastSavedId = localStorage.getItem(STORAGE_ID_KEY) || "";
    let lastSavedSheet = localStorage.getItem(STORAGE_SHEET_KEY) || "";

    if (!window.XLSX) {
        let scriptXlsx = document.createElement('script');
        scriptXlsx.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        document.head.appendChild(scriptXlsx);
    }

    container.innerHTML = `
        <div style="padding: 10px 16px;">
            <div class="gs-config-card" id="gsConfigCardArea" style="position: relative; margin-bottom: 8px; padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span class="gs-config-label" style="margin-bottom: 0;">Konfigurasi Sumber Data (Tempel Link Google Spreadsheet)</span>
                    <button onclick="minimizeConfigCardGs()" title="Minimize" style="background: transparent; border: none; color: var(--text-muted); font-size: 14px; font-weight: bold; cursor: pointer; padding: 0 4px;">▲</button>
                </div>
                <div class="gs-input-row" style="margin-bottom: 8px;">
                    <input type="text" id="gsSpreadsheetIdInput" value="${lastSavedId}" placeholder="Tempel Link Spreadsheet di sini..." class="gs-id-input">
                    <button onclick="hubungkanDanAmbilSheetGs()" class="gs-load-btn" style="background: #2563eb;">Cek Sheet</button>
                </div>

                <div id="sheetSelectionArea" class="hidden" style="margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 8px;">
                    <label style="font-size: 11px; color: #38bdf8; display: block; margin-bottom: 4px; font-weight: bold;">Pilih Sheet / Halaman:</label>
                    <div style="display: flex; gap: 8px;">
                        <select id="gsSheetSelect" class="gs-id-input" style="flex: 1; cursor: pointer; background: #1f2937; color: #fff;">
                            <option value="${lastSavedSheet}">${lastSavedSheet || '-- Pilih Sheet --'}</option>
                        </select>
                        <button onclick="muatDataDariSheetPilihanGs()" style="background: #059669; color: white; border: none; border-radius: 8px; padding: 0 16px; font-weight: bold; font-size: 12px; cursor: pointer;">Muat Data</button>
                    </div>
                </div>
            </div>

            <div id="btnToggleGantiGsContainer" class="hidden" style="margin-bottom: 8px; text-align: right;">
                <button onclick="bukaFormGantiSpreadsheetGs()" style="background: #374151; color: #38bdf8; border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    ⚙️ Ganti Spreadsheet
                </button>
            </div>

            <div id="gsContentArea" class="hidden">
                <div class="top-action-bar-row1">
                    <button onclick="konfirmasiResetDataGs()" class="action-top-btn reset-btn" title="Reset Semua Data Qty">🗑️ Reset Data</button>
                    <button onclick="filterSelisihToggleGs()" id="btnCekSelisihGs" class="action-top-btn selisih-btn">📊 Cek Selisih</button>
                </div>
                <div class="top-action-bar-row2">
                    <div class="search-box-wrapper">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="inputCariItemGs" oninput="handlePencarianInputGs(this.value)" placeholder="Cari PLU, Barcode, Nama..." class="modern-search-input" />
                        <button id="btnClearSearchGs" onclick="bersihkanPencarianGs()" class="clear-search-btn hidden">×</button>
                    </div>
                    <button onclick="bukaScannerKameraGs()" class="scan-btn">📷 Scan</button>
                </div>
                <div id="scannerContainerGs" class="scanner-box hidden">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <b style="font-size: 12px; color: #38bdf8;">Arahkan Kamera ke Barcode</b>
                        <div style="display: flex; gap: 6px;">
                            <button id="flashToggleBtnGs" onclick="toggleFlashLightGs()" class="flash-ctrl-btn">⚡ Flash: OFF</button>
                            <button onclick="tutupScannerKameraGs()" class="close-scanner-btn">Tutup</button>
                        </div>
                    </div>
                    <div id="readerGs"></div>
                </div>
                <div class="table-full-container">
                    <table id="tabelRakBebasGs">
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
                        <tbody id="tbodyRakBebasGs"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    if (!window.Html5Qrcode) {
        let scriptTag = document.createElement('script');
        scriptTag.src = "https://unpkg.com/html5-qrcode";
        document.head.appendChild(scriptTag);
    }

    if (!document.getElementById('popupQtyModalGs')) {
        let modalDiv = document.createElement('div');
        modalDiv.id = 'popupQtyModalGs';
        modalDiv.className = 'modern-modal-overlay hidden';
        modalDiv.innerHTML = `
            <div class="modern-modal-card">
                <div class="modern-modal-header">
                    <span class="modal-product-title" id="modalNamaItemGs">-</span>
                    <button onclick="tutupPopupQtyGs()" class="modern-close-x">&times;</button>
                </div>
                <div class="modern-meta-info">
                    <span>PLU: <b id="modalPluTextGs">-</b></span>
                    <span>•</span>
                    <span>Barcode: <b id="modalBarcodeTextGs">-</b></span>
                </div>
                <div class="modern-input-box-area">
                    <div class="modern-current-label">Qty Tersimpan: <span id="modalCurrentQtyGs">0</span></div>
                    <label class="modern-input-label">Tambah Qty (Tempat Lain):</label>
                    <div class="modern-stepper-row">
                        <button onclick="ubahNilaiInputPopupGs(-1)" class="modern-step-btn">-</button>
                        <input type="number" id="modalInputTambahGs" value="0" class="modern-number-input" />
                        <button onclick="ubahNilaiInputPopupGs(1)" class="modern-step-btn">+</button>
                    </div>
                </div>
                <div class="modern-btn-row" style="margin-bottom: 8px;">
                    <button onclick="tutupPopupQtyGs()" class="modern-btn-batal">Batal</button>
                    <button onclick="simpanQtyTambahGs()" class="modern-btn-simpan">Simpan</button>
                </div>
                <button onclick="resetQtyItemGs()" style="width: 100%; background: #dc2626; color: white; border: none; border-radius: 8px; padding: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">🔄 Reset Qty Item Ini ke 0</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    if (lastSavedId) {
        currentSpreadsheetId = lastSavedId;
        currentSheetName = lastSavedSheet || "Sheet1";
        STORAGE_KEY_BEBAS_GS = "apo_data_rak_bebas_gs_" + currentSpreadsheetId + "_" + currentSheetName;
        
        let savedLocalData = localStorage.getItem(STORAGE_KEY_BEBAS_GS);
        if (savedLocalData) {
            try {
                let parsedLocal = JSON.parse(savedLocalData);
                if (parsedLocal && parsedLocal.length > 0) {
                    dataRakBebasGs = parsedLocal;
                    renderTabelGs(dataRakBebasGs);
                    
                    let configCard = document.getElementById('gsConfigCardArea');
                    let btnToggle = document.getElementById('btnToggleGantiGsContainer');
                    let contentArea = document.getElementById('gsContentArea');

                    if (configCard) configCard.classList.add('hidden');
                    if (btnToggle) btnToggle.classList.remove('hidden');
                    if (contentArea) contentArea.classList.remove('hidden');

                    let dropdownHTML = `
                        <button onclick="tutupDropdownOtomatis(); sinkronisasiStokServerGs(true);">🔄 Sync Server</button>
                        <button onclick="tutupDropdownOtomatis(); exportExcelGs();">📥 Download / Cetak</button>
                    `;
                    setupWorkspaceHeader("SO Rak Bebas by GS", `${dataRakBebasGs.length} item dipulihkan (${currentSheetName})`, true, dropdownHTML);
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    if (typeof setupWorkspaceHeader === 'function') {
        setupWorkspaceHeader(
            "SO Rak Bebas by GS", 
            "Tempel link Spreadsheet untuk memulai", 
            true,
            `<button onclick="toggleGlobalDropdownMenu()" class="auth-action-btn">Pengaturan</button>`
        );
    }
}

function ekstrakSpreadsheetId(input) {
    let text = input.trim();
    let match = text.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
        return match[1];
    }
    return text;
}

async function hubungkanDanAmbilSheetGs() {
    let rawInput = document.getElementById('gsSpreadsheetIdInput').value.trim();
    if (!rawInput) {
        if (typeof showModernAlert === 'function') showModernAlert("Link atau Spreadsheet ID wajib diisi!", "Perhatian");
        else alert("Link atau Spreadsheet ID wajib diisi!");
        return;
    }

    currentSpreadsheetId = ekstrakSpreadsheetId(rawInput);
    if (!currentSpreadsheetId) {
        if (typeof showModernAlert === 'function') showModernAlert("Link Google Spreadsheet tidak valid.", "Error");
        else alert("Link Google Spreadsheet tidak valid.");
        return;
    }

    localStorage.setItem(STORAGE_ID_KEY, currentSpreadsheetId);
    if (typeof showModernAlert === 'function') showModernAlert("Memindai daftar sheet...", "Memproses");

    try {
        let exportUrl = `https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/export?format=xlsx`;
        let response = await fetch(exportUrl);
        
        if (!response.ok) {
            throw new Error("Gagal mengakses spreadsheet. Pastikan akses link disetel ke 'Anyone with the link can view'.");
        }

        let arrayBuffer = await response.arrayBuffer();
        
        if (!window.XLSX) {
            throw new Error("Library pemindai belum siap, silakan coba klik 'Cek Sheet' sekali lagi.");
        }

        workbookGlobal = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        let sheetNames = workbookGlobal.SheetNames;

        let selectEl = document.getElementById('gsSheetSelect');
        selectEl.innerHTML = "";
        
        sheetNames.forEach(sheet => {
            let opt = document.createElement('option');
            opt.value = sheet;
            opt.innerText = sheet;
            selectEl.appendChild(opt);
        });

        let sheetArea = document.getElementById('sheetSelectionArea');
        if (sheetArea) sheetArea.classList.remove('hidden');

        if (typeof showModernAlert === 'function') showModernAlert(`Ditemukan ${sheetNames.length} sheet. Silakan pilih sheet lalu klik Muat Data!`, "Sukses");

    } catch (err) {
        console.error("Error Get Sheets:", err);
        if (typeof showModernAlert === 'function') showModernAlert("Gagal memindai sheet otomatis. Pastikan link publik.", "Perhatian");
    }
}

async function muatDataDariSheetPilihanGs() {
    let selectEl = document.getElementById('gsSheetSelect');
    currentSheetName = selectEl && selectEl.value ? selectEl.value : "Sheet1";

    STORAGE_KEY_BEBAS_GS = "apo_data_rak_bebas_gs_" + currentSpreadsheetId + "_" + currentSheetName;
    localStorage.setItem(STORAGE_SHEET_KEY, currentSheetName);

    if (typeof showModernAlert === 'function') showModernAlert(`Memuat data dari sheet [${currentSheetName}]...`, "Memproses");

    try {
        let masterItems = [];

        if (workbookGlobal && workbookGlobal.Sheets[currentSheetName]) {
            let worksheet = workbookGlobal.Sheets[currentSheetName];
            let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

            for (let i = 1; i < rows.length; i++) {
                let row = rows[i];
                if (!row || row.length === 0) continue;

                let plu = row[0] !== undefined ? String(row[0]).trim() : "";
                let barcodeRaw = row[1] !== undefined ? String(row[1]).trim() : "-";
                let barcode = bersihkanFormatBarcode(barcodeRaw);
                let namaItem = row[2] !== undefined ? String(row[2]).trim() : "";

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
        } else {
            let response = await fetch('/api/spreadsheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spreadsheetId: currentSpreadsheetId, sheetName: currentSheetName, action: 'getData' })
            });
            let result = await response.json();
            if (response.ok && result.success) {
                parseCSVDataGs(result.csvData);
                return;
            } else {
                throw new Error(result.message || "Gagal mengambil data sheet.");
            }
        }

        let savedLocalData = localStorage.getItem(STORAGE_KEY_BEBAS_GS);
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

        dataRakBebasGs = masterItems;
        localStorage.setItem(STORAGE_KEY_BEBAS_GS, JSON.stringify(dataRakBebasGs));
        renderTabelGs(dataRakBebasGs);

        let configCard = document.getElementById('gsConfigCardArea');
        let btnToggle = document.getElementById('btnToggleGantiGsContainer');
        let contentArea = document.getElementById('gsContentArea');

        if (configCard) configCard.classList.add('hidden');
        if (btnToggle) btnToggle.classList.remove('hidden');
        if (contentArea) contentArea.classList.remove('hidden');

        let dropdownHTML = `
            <button onclick="tutupDropdownOtomatis(); sinkronisasiStokServerGs(true);">🔄 Sync Server</button>
            <button onclick="tutupDropdownOtomatis(); exportExcelGs();">📥 Download / Cetak</button>
        `;

        if (savedLocalData) {
            setupWorkspaceHeader("SO Rak Bebas by GS", `${dataRakBebasGs.length} item (${currentSheetName} - Tersimpan)`, true, dropdownHTML);
        } else {
            setupWorkspaceHeader("SO Rak Bebas by GS", `Sinkronisasi server... (${currentSheetName})`, true, dropdownHTML);
            sinkronisasiStokServerGs(false);
        }

        if (typeof showModernAlert === 'function') showModernAlert(`Sheet [${currentSheetName}] berhasil dimuat!`, "Sukses");

    } catch (err) {
        console.error("Error GS Data:", err);
        if (typeof showModernAlert === 'function') showModernAlert(err.message, "Error");
        else alert(err.message);
    }
}

function bersihkanFormatBarcode(val) {
    if (!val || val === "-") return "-";
    let str = String(val).trim().replace(/"/g, '');
    
    if (str.includes('E+') || str.includes('e+') || str.includes('E-') || str.includes('e-')) {
        let num = Number(str);
        if (!isNaN(num)) {
            return num.toLocaleString('fullwide', { useGrouping: false });
        }
    }
    return str;
}

function parseCSVDataGs(text) {
    let lines = text.split("\n");
    let masterItems = [];

    for (let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        let row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let plu = row[0] ? row[0].replace(/"/g, '').trim() : "";
        let barcodeRaw = row[1] ? row[1].replace(/"/g, '').trim() : "-";
        let barcode = bersihkanFormatBarcode(barcodeRaw);
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

    let savedLocalData = localStorage.getItem(STORAGE_KEY_BEBAS_GS);
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

    dataRakBebasGs = masterItems;
    localStorage.setItem(STORAGE_KEY_BEBAS_GS, JSON.stringify(dataRakBebasGs));
    renderTabelGs(dataRakBebasGs);

    let dropdownHTML = `
        <button onclick="tutupDropdownOtomatis(); sinkronisasiStokServerGs(true);">🔄 Sync Server</button>
        <button onclick="tutupDropdownOtomatis(); exportExcelGs();">📥 Download / Cetak</button>
    `;

    if (savedLocalData) {
        setupWorkspaceHeader("SO Rak Bebas by GS", `${dataRakBebasGs.length} item (${currentSheetName} - Tersimpan)`, true, dropdownHTML);
    } else {
        setupWorkspaceHeader("SO Rak Bebas by GS", `Sinkronisasi server... (${currentSheetName})`, true, dropdownHTML);
        sinkronisasiStokServerGs(false);
    }
}

function minimizeConfigCardGs() {
    let configCard = document.getElementById('gsConfigCardArea');
    let btnToggle = document.getElementById('btnToggleGantiGsContainer');

    if (configCard) configCard.classList.add('hidden');
    if (btnToggle) btnToggle.classList.remove('hidden');
}

function bukaFormGantiSpreadsheetGs() {
    let configCard = document.getElementById('gsConfigCardArea');
    let btnToggle = document.getElementById('btnToggleGantiGsContainer');

    if (configCard) configCard.classList.remove('hidden');
    if (btnToggle) btnToggle.classList.add('hidden');
    
    let inputEl = document.getElementById('gsSpreadsheetIdInput');
    if (inputEl) {
        inputEl.focus();
        inputEl.select();
    }
}

function renderTabelGs(listData) {
    let tbody = document.getElementById('tbodyRakBebasGs');
    if (!tbody) return;
    tbody.innerHTML = "";

    listData.forEach((item) => {
        let realIndex = dataRakBebasGs.findIndex(d => d.plu === item.plu);
        let selisihWarna = item.selisih !== 0 ? "color: #ef4444; font-weight: bold;" : "";
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center; font-size: 12px;">${item.no}</td>
            <td style="font-size: 12px;">
                <b>${item.plu}</b><br>
                <span onclick="tampilkanBarcodeGlobal('${item.barcode}', '${item.namaItem.replace(/'/g, "\\'")}')" style="color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Klik untuk tampilkan barcode">
                    <span>${item.barcode}</span>
                    <span style="font-size: 10px; background: rgba(56, 189, 248, 0.15); padding: 1px 4px; border-radius: 4px;">🪪 🔍</span>
                </span>
            </td>
            <td style="font-size: 12px;">${item.namaItem}</td>
            <td style="text-align: center;">
                <div onclick="bukaPopupQtyGs(${realIndex})" class="qty-pill-box" title="Klik untuk tambah/hitung ulang">
                    <span id="qty-text-gs-${realIndex}" style="font-weight: bold; font-size: 14px; color: #38bdf8;">${item.qty}</span>
                    <small style="font-size: 9px; display: block; color: var(--text-muted);">ketuk edit</small>
                </div>
            </td>
            <td style="text-align: center; font-size: 13px;" id="oh-val-gs-${realIndex}">${item.oh}</td>
            <td style="text-align: center; font-size: 13px; ${selisihWarna}" id="selisih-val-gs-${realIndex}">${item.selisih}</td>
        `;
        tbody.appendChild(tr);
    });
}

function handlePencarianInputGs(val) {
    let clearBtn = document.getElementById('btnClearSearchGs');
    if (val.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
    filterPencarianRealtimeGs(val);
}

function filterPencarianRealtimeGs(keyword) {
    let query = keyword.toLowerCase().trim();
    if (!query) {
        if (statusFilterSelisihGs) {
            let filtered = dataRakBebasGs.filter(item => item.selisih !== 0);
            renderTabelGs(filtered);
        } else {
            renderTabelGs(dataRakBebasGs);
        }
        return;
    }

    let baseList = statusFilterSelisihGs ? dataRakBebasGs.filter(item => item.selisih !== 0) : dataRakBebasGs;
    let filtered = baseList.filter(item => 
        item.plu.toLowerCase().includes(query) ||
        item.barcode.toLowerCase().includes(query) ||
        item.namaItem.toLowerCase().includes(query)
    );

    renderTabelGs(filtered);
}

function bersihkanPencarianGs() {
    let inputEl = document.getElementById('inputCariItemGs');
    inputEl.value = "";
    document.getElementById('btnClearSearchGs').classList.add('hidden');
    
    if (statusFilterSelisihGs) {
        let filtered = dataRakBebasGs.filter(item => item.selisih !== 0);
        renderTabelGs(filtered);
    } else {
        renderTabelGs(dataRakBebasGs);
    }
    inputEl.focus();
}

async function bukaScannerKameraGs() {
    let scannerBox = document.getElementById('scannerContainerGs');
    scannerBox.classList.remove('hidden');
    isFlashOnGs = false;
    updateFlashButtonUIGs();

    if (!html5QrCodeGs) {
        html5QrCodeGs = new Html5Qrcode("readerGs");
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

            await html5QrCodeGs.start(
                selectedCameraId,
                { fps: 20, qrbox: { width: 260, height: 140 } },
                (decodedText) => {
                    tutupScannerKameraGs();
                    cariDanBukaItemDariBarcodeGs(decodedText.trim());
                },
                (errorMessage) => {}
            );
        } else {
            throw "Tidak ada kamera terdeteksi.";
        }
    } catch (err) {
        html5QrCodeGs.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 260, height: 140 } },
            (decodedText) => {
                tutupScannerKameraGs();
                cariDanBukaItemDariBarcodeGs(decodedText.trim());
            },
            (errorMessage) => {}
        ).catch(async fallbackErr => {
            if (typeof showModernAlert === 'function') await showModernAlert("Gagal mengaktifkan kamera: " + fallbackErr, "Error Kamera");
            scannerBox.classList.add('hidden');
        });
    }
}

function toggleFlashLightGs() {
    if (!html5QrCodeGs || !html5QrCodeGs.isScanning) return;

    isFlashOnGs = !isFlashOnGs;
    html5QrCodeGs.applyVideoConstraints({
        advanced: [{ torch: isFlashOnGs }]
    }).then(() => {
        updateFlashButtonUIGs();
    }).catch(async err => {
        isFlashOnGs = !isFlashOnGs;
        if (typeof showModernAlert === 'function') await showModernAlert("Fitur Flash (Senter) tidak didukung pada perangkat ini.", "Informasi");
    });
}

function updateFlashButtonUIGs() {
    let btn = document.getElementById('flashToggleBtnGs');
    if (!btn) return;
    if (isFlashOnGs) {
        btn.style.background = "#eab308";
        btn.style.color = "#000";
        btn.innerText = "⚡ Flash: ON";
    } else {
        btn.style.background = "#4b5563";
        btn.style.color = "#fff";
        btn.innerText = "⚡ Flash: OFF";
    }
}

function tutupScannerKameraGs() {
    let scannerBox = document.getElementById('scannerContainerGs');
    scannerBox.classList.add('hidden');

    if (html5QrCodeGs && html5QrCodeGs.isScanning) {
        if (isFlashOnGs) {
            html5QrCodeGs.applyVideoConstraints({ advanced: [{ torch: false }] }).catch(() => {});
            isFlashOnGs = false;
        }
        html5QrCodeGs.stop().then(() => {
            html5QrCodeGs.clear();
        }).catch(err => console.error(err));
    }
}

function cariDanBukaItemDariBarcodeGs(scannedBarcode) {
    let foundIndex = dataRakBebasGs.findIndex(item => item.barcode === scannedBarcode);
    if (foundIndex !== -1) {
        bersihkanPencarianGs();
        bukaPopupQtyGs(foundIndex);
    } else {
        if (typeof showModernAlert === 'function') showModernAlert(`Barcode [${scannedBarcode}] tidak ditemukan di dalam Master Rak GS ini.`, "Item Tidak Ditemukan");
    }
}

function bukaPopupQtyGs(index) {
    currentIndexAktifGs = index;
    let item = dataRakBebasGs[index];

    document.getElementById('modalNamaItemGs').innerText = item.namaItem;
    document.getElementById('modalPluTextGs').innerText = item.plu;
    document.getElementById('modalBarcodeTextGs').innerText = item.barcode;
    document.getElementById('modalCurrentQtyGs').innerText = item.qty;
    document.getElementById('modalInputTambahGs').value = "0";

    document.getElementById('popupQtyModalGs').classList.remove('hidden');
    document.getElementById('modalInputTambahGs').focus();
    document.getElementById('modalInputTambahGs').select();
}

function tutupPopupQtyGs() {
    document.getElementById('popupQtyModalGs').classList.add('hidden');
    currentIndexAktifGs = null;
}

function ubahNilaiInputPopupGs(delta) {
    let inputEl = document.getElementById('modalInputTambahGs');
    let val = parseInt(inputEl.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    inputEl.value = val;
}

function simpanQtyTambahGs() {
    if (currentIndexAktifGs === null) return;

    let inputTambah = parseInt(document.getElementById('modalInputTambahGs').value) || 0;
    let item = dataRakBebasGs[currentIndexAktifGs];

    item.qty += inputTambah;
    if (item.qty < 0) item.qty = 0;

    item.selisih = item.qty - item.oh;

    let qtySpan = document.getElementById(`qty-text-gs-${currentIndexAktifGs}`);
    if (qtySpan) qtySpan.innerText = item.qty;

    let selisihEl = document.getElementById(`selisih-val-gs-${currentIndexAktifGs}`);
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

    localStorage.setItem(STORAGE_KEY_BEBAS_GS, JSON.stringify(dataRakBebasGs));
    tutupPopupQtyGs();
}

async function resetQtyItemGs() {
    if (currentIndexAktifGs === null) return;
    let isConfirmed = typeof showModernConfirm === 'function' ? await showModernConfirm("Reset Qty item ini menjadi 0?", "Konfirmasi Reset") : confirm("Reset Qty item ini?");
    if (isConfirmed) {
        let item = dataRakBebasGs[currentIndexAktifGs];
        item.qty = 0;
        item.selisih = item.qty - item.oh;

        let qtySpan = document.getElementById(`qty-text-gs-${currentIndexAktifGs}`);
        if (qtySpan) qtySpan.innerText = item.qty;

        let selisihEl = document.getElementById(`selisih-val-gs-${currentIndexAktifGs}`);
        if (selisihEl) {
            selisihEl.innerText = item.selisih;
            selisihEl.style.color = "inherit";
            selisihEl.style.fontWeight = "normal";
        }

        localStorage.setItem(STORAGE_KEY_BEBAS_GS, JSON.stringify(dataRakBebasGs));
        renderTabelGs(dataRakBebasGs);
        tutupPopupQtyGs();
    }
}

async function konfirmasiResetDataGs() {
    let isConfirmed = typeof showModernConfirm === 'function' ? await showModernConfirm("PERINGATAN: Apakah Anda yakin ingin mereset semua data Qty fisik?", "Reset Seluruh Rak GS") : confirm("Reset semua?");
    if (isConfirmed) {
        localStorage.removeItem(STORAGE_KEY_BEBAS_GS);
        localStorage.removeItem(STORAGE_ID_KEY);
        localStorage.removeItem(STORAGE_SHEET_KEY);
        dataRakBebasGs.forEach(item => {
            item.qty = 0;
            item.oh = 0;
            item.selisih = 0;
        });
        renderTabelGs(dataRakBebasGs);
        let contentArea = document.getElementById('gsContentArea');
        let configCard = document.getElementById('gsConfigCardArea');
        let btnToggle = document.getElementById('btnToggleGantiGsContainer');
        let sheetArea = document.getElementById('sheetSelectionArea');
        
        if (contentArea) contentArea.classList.add('hidden');
        if (configCard) configCard.classList.remove('hidden');
        if (btnToggle) btnToggle.classList.add('hidden');
        if (sheetArea) sheetArea.classList.add('hidden');

        document.getElementById('gsSpreadsheetIdInput').value = "";
        if (typeof showModernAlert === 'function') await showModernAlert("Semua data Qty dan Link berhasil direset!", "Sukses");
    }
}

async function sinkronisasiStokServerGs(isManual = false) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    let dropdownHTML = `
        <button onclick="tutupDropdownOtomatis(); sinkronisasiStokServerGs(true);">🔄 Sync Server</button>
        <button onclick="tutupDropdownOtomatis(); exportExcelGs();">📥 Download / Cetak</button>
    `;

    if (!savedToken || isSkipped) {
        if (isManual && typeof showModernAlert === 'function') await showModernAlert("Mode Tamu / Belum Login: Tidak dapat melakukan sinkronisasi server.", "Perhatian");
        setupWorkspaceHeader("SO Rak Bebas by GS", "Mode Tamu (OH = 0)", true, dropdownHTML);
        return;
    }

    setupWorkspaceHeader("SO Rak Bebas by GS", "Sync server...", true, dropdownHTML);

    let successCount = 0;
    let isSessionExpired = false;

    for (let i = 0; i < dataRakBebasGs.length; i++) {
        let item = dataRakBebasGs[i];
        if (!item.barcode || item.barcode === "-") continue;

        try {
            let response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode: item.barcode, token: savedToken })
            });

            let result = await response.json();

            if (response.status === 401 || response.status === 403 || (result && result.success === false && (result.message?.includes('token') || result.message?.includes('sesi') || result.message?.includes('login') || result.message?.includes('auth')))) {
                isSessionExpired = true;
                break;
            }

            if (response.ok && result.success) {
                item.oh = parseInt(result.systemStock) || 0;
                item.selisih = item.qty - item.oh;
                
                let realIndex = dataRakBebasGs.findIndex(d => d.plu === item.plu);
                let ohEl = document.getElementById(`oh-val-gs-${realIndex}`);
                let selisihEl = document.getElementById(`selisih-val-gs-${realIndex}`);
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

    if (isSessionExpired) {
        localStorage.removeItem('apo_token');
        localStorage.removeItem('apo_user_name');
        localStorage.removeItem('apo_store_name');
        
        let sessionModal = document.getElementById('sessionModal');
        if (sessionModal) sessionModal.classList.remove('hidden');

        setupWorkspaceHeader("SO Rak Bebas by GS", "Sesi Berakhir (Harap Login)", false);
        return;
    }

    localStorage.setItem(STORAGE_KEY_BEBAS_GS, JSON.stringify(dataRakBebasGs));
    setupWorkspaceHeader("SO Rak Bebas by GS", `${successCount} item tersinkron (${currentSheetName})`, true, dropdownHTML);
    if (isManual && typeof showModernAlert === 'function') await showModernAlert(`Sinkronisasi Rak Bebas GS Berhasil! Stok ${successCount} item diperbarui.`, "Sukses");
}

function filterSelisihToggleGs() {
    statusFilterSelisihGs = !statusFilterSelisihGs;
    let btn = document.getElementById('btnCekSelisihGs');
    let keyword = document.getElementById('inputCariItemGs').value;

    if (statusFilterSelisihGs) {
        btn.style.background = "#dc2626";
        btn.innerText = "📋 Tampilkan Semua";
        let filtered = dataRakBebasGs.filter(item => item.selisih !== 0);
        if (keyword) {
            filtered = filtered.filter(item => 
                item.plu.toLowerCase().includes(keyword) ||
                item.barcode.toLowerCase().includes(keyword) ||
                item.namaItem.toLowerCase().includes(keyword)
            );
        }
        renderTabelGs(filtered);
    } else {
        btn.style.background = "#2563eb";
        btn.innerText = "📊 Cek Selisih";
        if (keyword) {
            filterPencarianRealtimeGs(keyword);
        } else {
            renderTabelGs(dataRakBebasGs);
        }
    }
}

function exportExcelGs() {
    if (typeof exportUniversalReport === 'function') {
        exportUniversalReport("Stock Opname - Rak Bebas by GS", dataRakBebasGs);
    } else {
        alert("Fungsionalitas ekspor belum tersedia.");
    }
}
