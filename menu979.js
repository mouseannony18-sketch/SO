const CSV_URL = "https://docs.google.com/spreadsheets/d/15Albul63206zfgQ8vaa0krgcoryLURf2xEGv3K-UueI/export?format=csv";

let dataMenu979 = [];
const STORAGE_KEY_979 = "apo_data_menu_979";
let currentIndexAktif = null;
let html5QrCode = null;
let isFlashOn = false;

async function loadMenu979() {
    let container = document.getElementById('workspaceCard');
    container.style.maxWidth = "100%";
    container.style.margin = "0";
    container.style.borderRadius = "0";
    container.style.minHeight = "100vh";

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="font-size: 18px; margin: 0;">Menu Rak 979 (Stock Opname)</h3>
            <button onclick="sinkronisasiStokServer(true)" style="background: #2563eb; width: auto; padding: 6px 12px; font-size: 12px; margin: 0;" title="Perbarui stok sistem dari server">🔄 Sync Server</button>
        </div>
        
        <!-- PENCARIAN DENGAN TOMBOL CLEAR (X) & TOMBOL AKSI -->
        <div class="top-action-bar">
            <div class="search-box-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" id="inputCariItem" oninput="handlePencarianInput(this.value)" placeholder="Cari PLU / Barcode / Nama..." class="modern-search-input" />
                <button id="btnClearSearch" onclick="bersihkanPencarian()" class="clear-search-btn hidden" title="Hapus pencarian">×</button>
            </div>
            <button onclick="bukaScannerKamera()" class="action-top-btn scan-btn" title="Scan Barcode via Kamera">📷 Scan</button>
            <button onclick="konfirmasiResetData()" class="action-top-btn reset-btn" title="Reset Semua Data Qty">🗑️ Reset</button>
        </div>

        <p id="statusLoad979" style="text-align: center; color: var(--text-muted); font-size: 12px; margin-bottom: 10px;">Memuat data master...</p>
        
        <!-- AREA SCANNER KAMERA (KEMBALI KE KONFIGURASI NORMAL YG STABIL) -->
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

        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button onclick="exportExcel979()" class="excel-btn" style="flex: 1; margin:0; padding: 12px;">Download Excel</button>
            <button onclick="filterSelisihToggle()" id="btnFilterSelisih" style="background: #f59e0b; flex: 1; margin:0; padding: 12px;">Filter Selisih</button>
        </div>
        <button onclick="kembaliKeMenu()" class="back-btn" style="padding: 12px;">Kembali ke Menu Utama</button>
    `;

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

                <div class="modern-btn-row">
                    <button onclick="tutupPopupQty()" class="modern-btn-batal">Batal</button>
                    <button onclick="simpanQtyTambah()" class="modern-btn-simpan">Simpan</button>
                </div>
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
        document.getElementById('statusLoad979').innerText = "Gagal memuat data spreadsheet.";
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
            console.error("Gagal memuat data tersimpan:", e);
        }
    }

    dataMenu979 = masterItems;
    renderTabel979(dataMenu979);
    
    if (savedLocalData) {
        document.getElementById('statusLoad979').innerText = `Memuat ${dataMenu979.length} item dari memori tersimpan.`;
    } else {
        document.getElementById('statusLoad979').innerText = `Total ${dataMenu979.length} item dimuat. Menyinkronkan stok server...`;
        sinkronisasiStokServer(false);
    }
}

function renderTabel979(listData) {
    let tbody = document.getElementById('tbodyMenu979');
    if (!tbody) return;
    tbody.innerHTML = "";

    listData.forEach((item) => {
        let realIndex = dataMenu979.findIndex(d => d.plu === item.plu);
        let selisihWarna = item.selisih !== 0 ? "color: #ef4444;" : "";
        
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
            <td style="text-align: center; font-size: 13px; font-weight: bold; ${selisihWarna}" id="selisih-val-${realIndex}">${item.selisih}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Logika Pencarian & Tombol Clear (X)
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
        renderTabel979(dataMenu979);
        return;
    }

    let filtered = dataMenu979.filter(item => 
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
    renderTabel979(dataMenu979);
    inputEl.focus();
}

// Buka Kamera dengan Memilih Kamera Belakang Utama (Normal / Non-Wide)
async function bukaScannerKamera() {
    let scannerBox = document.getElementById('scannerContainer');
    scannerBox.classList.remove('hidden');
    isFlashOn = false;
    updateFlashButtonUI();

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    try {
        // Dapatkan daftar seluruh kamera perangkat
        let devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
            let selectedCameraId = devices[0].id; // Default kamera pertama

            // Cari kamera belakang (biasanya berlabel back, rear, atau bukan front)
            let backCameras = devices.filter(device => {
                let label = device.label.toLowerCase();
                return label.includes('back') || label.includes('rear') || label.includes('belakang') || label.includes('0');
            });

            if (backCameras.length > 0) {
                // Jika ada beberapa kamera belakang, pilih yang bukan ultra-wide (biasanya kamera utama berada di urutan awal kamera belakang)
                selectedCameraId = backCameras[0].id;
            }

            // Jalankan scanner menggunakan ID kamera utama spesifik tersebut
            await html5QrCode.start(
                selectedCameraId,
                { 
                    fps: 20, 
                    qrbox: { width: 260, height: 140 }
                },
                (decodedText) => {
                    tutupScannerKamera();
                    cariDanBukaItemDariBarcode(decodedText.trim());
                },
                (errorMessage) => {}
            );
        } else {
            throw "Tidak ada kamera yang ditemukan.";
        }
    } catch (err) {
        // Fallback otomatis ke environment standar jika pengambilan list kamera gagal
        console.warn("Gagal memilih kamera spesifik, menggunakan mode default:", err);
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 260, height: 140 } },
            (decodedText) => {
                tutupScannerKamera();
                cariDanBukaItemDariBarcode(decodedText.trim());
            },
            (errorMessage) => {}
        ).catch(fallbackErr => {
            alert("Gagal mengaktifkan kamera: " + fallbackErr);
            scannerBox.classList.add('hidden');
        });
    }
}

// Kontrol LED Flash (Senter)
function toggleFlashLight() {
    if (!html5QrCode || !html5QrCode.isScanning) return;

    isFlashOn = !isFlashOn;
    html5QrCode.applyVideoConstraints({
        advanced: [{ torch: isFlashOn }]
    }).then(() => {
        updateFlashButtonUI();
    }).catch(err => {
        console.warn("Kontrol Flash tidak didukung:", err);
        isFlashOn = !isFlashOn;
        alert("Fitur Flash (Senter) tidak didukung pada perangkat/browser ini.");
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
        alert(`Barcode [${scannedBarcode}] tidak ditemukan di dalam Daftar Master Rak 979 ini.`);
    }
}

function konfirmasiResetData() {
    let konfirmasi = confirm("PERINGATAN: Apakah Anda yakin ingin mereset semua data Qty fisik dan stok sistem yang tersimpan?");
    if (konfirmasi) {
        localStorage.removeItem(STORAGE_KEY_979);
        dataMenu979.forEach(item => {
            item.qty = 0;
            item.oh = 0;
            item.selisih = 0;
        });
        renderTabel979(dataMenu979);
        document.getElementById('statusLoad979').innerText = "Data berhasil direset menjadi 0.";
        alert("Semua data Qty berhasil direset!");
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
        } else {
            selisihEl.style.color = "inherit";
        }
    }

    localStorage.setItem(STORAGE_KEY_979, JSON.stringify(dataMenu979));
    tutupPopupQty();
}

async function sinkronisasiStokServer(isManual = false) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken || isSkipped) {
        if (isManual) alert("Mode Tamu / Belum Login: Tidak dapat melakukan sinkronisasi server.");
        document.getElementById('statusLoad979').innerText = `Total ${dataMenu979.length} item dimuat. (Mode Tanpa Login / OH = 0)`;
        return;
    }

    let statusEl = document.getElementById('statusLoad979');
    statusEl.innerText = "Sedang menyinkronkan ulang stok sistem dari server...";

    let successCount = 0;
    for (let i = 0; i < dataMenu979.length; i++) {
        let item = dataMenu979[i];
        
        if (!item.barcode || item.barcode === "-") {
            continue;
        }

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
                    } else {
                        selisihEl.style.color = "inherit";
                    }
                }
                successCount++;
            }
        } catch (e) {
            console.error(`Gagal sync barcode ${item.barcode}:`, e);
        }
    }

    localStorage.setItem(STORAGE_KEY_979, JSON.stringify(dataMenu979));
    statusEl.innerText = `Sinkronisasi selesai! Berhasil memperbarui stok ${successCount} item dari server.`;
    
    if (isManual) {
        alert(`Sinkronisasi Berhasil! Stok sistem untuk ${successCount} item telah diperbarui.`);
    }
}

let statusFilterSelisih = false;
function filterSelisihToggle() {
    statusFilterSelisih = !statusFilterSelisih;
    let btn = document.getElementById('btnFilterSelisih');

    if (statusFilterSelisih) {
        btn.style.background = "#dc2626";
        btn.innerText = "Tampilkan Semua";
        let filtered = dataMenu979.filter(item => item.selisih !== 0);
        renderTabel979(filtered);
    } else {
        btn.style.background = "#f59e0b";
        btn.innerText = "Filter Selisih";
        renderTabel979(dataMenu979);
    }
}

function exportExcel979() {
    if (dataMenu979.length === 0) return alert('Belum ada data!');
    
    let exportData = dataMenu979.map(item => ({
        PLU: item.plu,
        Barcode: item.barcode,
        Nama_Item: item.namaItem,
        Qty_Fisik: item.qty,
        Stok_Sistem_OH: item.oh,
        Selisih: item.selisih
    }));

    let ws = XLSX.utils.json_to_sheet(exportData);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rak_979");
    XLSX.writeFile(wb, "StockOpname_Rak_979.xlsx");
}
