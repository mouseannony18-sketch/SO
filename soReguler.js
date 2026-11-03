// =========================================================
// MODUL SO REGULER / PARTIAL (soReguler.js)
// Ekstraksi Planogram PDF dengan Scanner QR Link (Kamera Belakang) & Normalisasi Barcode
// =========================================================

let dataMenuSoReguler = [];
const STORAGE_KEY_SO_REGULER = "apo_data_so_reguler_pdf";
let currentIndexSoAktif = null;
let html5QrCodeSo = null;
let html5QrCodeLink = null;
let isSoFlashOn = false;
let isLinkFlashOn = false;
let statusSoFilterSelisih = false;
let isPdfCardMinimized = false;

// =========================================================
// RENDER TAMPILAN UTAMA WORKSPACE SO REGULER
// =========================================================
function loadMenuSoReguler() {
    setupWorkspaceHeader("SO Reguler / Partial", "Sumber Planogram PDF", true, `
        <button onclick="tutupDropdownOtomatis(); sinkronisasiStokServerSoReguler(true);">🔄 Sync Server</button>
        <button onclick="tutupDropdownOtomatis(); exportExcelSoReguler();">📥 Download / Cetak</button>
    `);

    let menu979Container = document.getElementById('menu979Container');
    let menuBebasContainer = document.getElementById('menuBebasContainer');
    let adminArea = document.getElementById('adminFormArea');
    if (menu979Container) menu979Container.classList.add('hidden');
    if (menuBebasContainer) menuBebasContainer.classList.add('hidden');
    if (adminArea) adminArea.classList.add('hidden');

    let soFormArea = document.getElementById('soFormArea');
    if (soFormArea) {
        soFormArea.classList.remove('hidden');
        soFormArea.innerHTML = `
            <!-- CARD 1: SUMBER DATA PLANOGRAM PDF + SCAN QR LINK -->
            <div class="card" id="pdfSourceCard" style="margin-bottom: 12px; transition: all 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleMinimizePdfCard()">
                    <h3 id="pdfCardTitle" style="font-size: 14px; margin: 0;">1. Sumber Data Planogram PDF</h3>
                    <button id="pdfToggleArrowBtn" class="header-icon-btn" style="width: 28px !important; height: 28px !important; font-size: 12px !important;" title="Minimize / Expand">▲</button>
                </div>
                
                <div id="pdfCardBodyContent" style="margin-top: 10px;">
                    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">
                        Unggah file PDF lokal, tempel link, atau scan QR Code tautan PDF dari komputer.
                    </p>
                    
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 11px; font-weight: bold; display: block; margin-bottom: 3px;">Opsi A: Upload File PDF dari Perangkat</label>
                        <input type="file" id="pdfFileInput" accept=".pdf" class="input-field" onchange="handlePdfUpload(event)" style="padding: 6px; font-size: 12px;">
                    </div>

                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 11px; font-weight: bold; display: block; margin-bottom: 3px;">Opsi B: Masukkan Tautan / Link PDF</label>
                        <div style="display: flex; gap: 6px;">
                            <input type="text" id="pdfLinkInput" placeholder="https://..." class="input-field" style="margin: 0; font-size: 12px; padding: 6px;" />
                            <button onclick="handlePdfFromLink()" class="secondary-btn" style="width: 90px; margin: 0; font-size: 12px; padding: 6px;">Muat Link</button>
                        </div>
                    </div>

                    <div>
                        <button onclick="bukaScannerQrLink()" style="width: 100%; background: #059669; color: white; border: none; border-radius: 8px; padding: 8px; font-weight: bold; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            📷 Scan QR Code Link PDF dari Layar Komputer
                        </button>
                    </div>

                    <div id="scannerQrLinkContainer" class="scanner-box hidden" style="margin-top: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <b style="font-size: 12px; color: #38bdf8;">Arahkan ke QR Code di Komputer</b>
                            <div style="display: flex; gap: 6px;">
                                <button id="flashLinkToggleBtn" onclick="toggleLinkFlashLight()" class="flash-ctrl-btn">⚡ Flash: OFF</button>
                                <button onclick="tutupScannerQrLink()" class="close-scanner-btn">Tutup</button>
                            </div>
                        </div>
                        <div id="readerQrLink"></div>
                    </div>
                </div>

                <div id="pdfCardMinimizedView" class="hidden" style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                    <span id="pdfSummaryText" style="font-size: 12px; color: #38bdf8; font-weight: bold;">PDF Aktif: -</span>
                    <button onclick="toggleMinimizePdfCard()" class="secondary-btn" style="width: auto; padding: 4px 10px; font-size: 11px; margin: 0;">🔄 Ganti Data PDF</button>
                </div>
                
                <p id="pdfStatusMsg" style="font-size: 12px; color: #38bdf8; margin-top: 8px; font-weight: bold;"></p>
            </div>

            <!-- CARD 2: KONTROL AKSI & TABEL ITEM SO -->
            <div class="card">
                <div class="top-action-bar-row1" style="margin-bottom: 8px;">
                    <button onclick="konfirmasiResetSoReguler()" class="action-top-btn reset-btn" title="Reset Semua Data Qty">🗑️ Reset Data</button>
                    <button onclick="filterSoSelisihToggle()" id="btnCekSoSelisih" class="action-top-btn selisih-btn">📊 Cek Selisih</button>
                </div>
                
                <div class="top-action-bar-row2" style="margin-bottom: 10px;">
                    <div class="search-box-wrapper">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="inputCariSoItem" oninput="handleSoPencarianInput(this.value)" placeholder="Cari PLU, Barcode, Deskripsi..." class="modern-search-input" />
                        <button id="btnClearSoSearch" onclick="bersihkanSoPencarian()" class="clear-search-btn hidden">×</button>
                    </div>
                    <button onclick="bukaSoScannerKamera()" class="scan-btn">📷 Scan</button>
                </div>

                <div id="scannerSoContainer" class="scanner-box hidden" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <b style="font-size: 12px; color: #38bdf8;">Arahkan Kamera ke Barcode Item</b>
                        <div style="display: flex; gap: 6px;">
                            <button id="flashSoToggleBtn" onclick="toggleSoFlashLight()" class="flash-ctrl-btn">⚡ Flash: OFF</button>
                            <button onclick="tutupSoScannerKamera()" class="close-scanner-btn">Tutup</button>
                        </div>
                    </div>
                    <div id="readerSo"></div>
                </div>

                <div class="table-full-container">
                    <table id="tabelSoReguler">
                        <thead>
                            <tr>
                                <th style="width: 40px;">#</th>
                                <th>PLU / Barcode</th>
                                <th>Deskripsi Produk</th>
                                <th style="text-align: center; width: 110px;">QTY (Fisik)</th>
                                <th style="text-align: center; width: 50px;">OH</th>
                                <th style="text-align: center; width: 60px;">Selisih</th>
                            </tr>
                        </thead>
                        <tbody id="tbodySoReguler">
                            <tr>
                                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 25px;">
                                    Belum ada data planogram dimuat. Silakan pilih file PDF di atas.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    if (!window.Html5Qrcode) {
        let scriptTag = document.createElement('script');
        scriptTag.src = "https://unpkg.com/html5-qrcode";
        document.head.appendChild(scriptTag);
    }

    if (!document.getElementById('popupSoQtyModal')) {
        let modalDiv = document.createElement('div');
        modalDiv.id = 'popupSoQtyModal';
        modalDiv.className = 'modern-modal-overlay hidden';
        modalDiv.innerHTML = `
            <div class="modern-modal-card">
                <div class="modern-modal-header">
                    <span class="modal-product-title" id="modalSoNamaItem">-</span>
                    <button onclick="tutupPopupSoQty()" class="modern-close-x">&times;</button>
                </div>
                <div class="modern-meta-info">
                    <span>PLU: <b id="modalSoPluText">-</b></span>
                    <span>•</span>
                    <span>Barcode: <b id="modalSoBarcodeText">-</b></span>
                </div>
                <div class="modern-input-box-area">
                    <div class="modern-current-label">Qty Tersimpan: <span id="modalSoCurrentQty">0</span></div>
                    <label class="modern-input-label">Tambah Qty (Tempat Lain):</label>
                    <div class="modern-stepper-row">
                        <button onclick="ubahNilaiInputSoPopup(-1)" class="modern-step-btn">-</button>
                        <input type="number" id="modalSoInputTambah" value="0" class="modern-number-input" />
                        <button onclick="ubahNilaiInputSoPopup(1)" class="modern-step-btn">+</button>
                    </div>
                </div>
                <div class="modern-btn-row" style="margin-bottom: 8px;">
                    <button onclick="tutupPopupSoQty()" class="modern-btn-batal">Batal</button>
                    <button onclick="simpanSoQtyTambah()" class="modern-btn-simpan">Simpan</button>
                </div>
                <button onclick="resetQtyItemSoReguler()" style="width: 100%; background: #dc2626; color: white; border: none; border-radius: 8px; padding: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">🔄 Reset Qty Item Ini ke 0</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    let savedLocal = localStorage.getItem(STORAGE_KEY_SO_REGULER);
    if (savedLocal) {
        try {
            dataMenuSoReguler = JSON.parse(savedLocal);
            renderTabelSoReguler(dataMenuSoReguler);
            setStatusPdf(`Dimuat ${dataMenuSoReguler.length} item dari memori lokal.`, "#22c55e");
            
            if (dataMenuSoReguler.length > 0) {
                isPdfCardMinimized = true;
                applyPdfCardMinimizeState();
                let summaryEl = document.getElementById('pdfSummaryText');
                if (summaryEl) summaryEl.innerText = `PDF Aktif (${dataMenuSoReguler.length} Item)`;
            }
        } catch(e) {
            console.error(e);
        }
    }
}

// =========================================================
// PEMBERSIH & PENDETEKSI BARCODE (EAN-8, 11-Digit, & EAN-13)
// =========================================================
function bersihkanFormatBarcodeSo(val) {
    if (!val || val === "-") return "-";
    let str = String(val).trim().replace(/"/g, '');
    
    if (str.includes('E+') || str.includes('e+') || str.includes('E-') || str.includes('e-')) {
        let num = Number(str);
        if (!isNaN(num)) {
            str = num.toLocaleString('fullwide', { useGrouping: false });
        }
    }

    let cleanVal = String(str).trim();

    // 1. Barcode 7 Digit (EAN-8 -> menjadi 8 digit)
    if (cleanVal.length === 7 && !isNaN(cleanVal)) {
        let sum = 0;
        for (let i = 0; i < 7; i++) {
            let digit = parseInt(cleanVal[i]);
            let multiplier = (i % 2 === 0) ? 3 : 1;
            sum += digit * multiplier;
        }
        let mod = sum % 10;
        let checkDigit = (mod === 0) ? 0 : 10 - mod;
        return cleanVal + checkDigit;
    }

    // 2. Barcode 11 Digit (UPC/EAN terpotong -> menjadi 12 digit)
    if (cleanVal.length === 11 && !isNaN(cleanVal)) {
        let sum = 0;
        for (let i = 0; i < 11; i++) {
            let digit = parseInt(cleanVal[i]);
            let multiplier = (i % 2 === 0) ? 3 : 1;
            sum += digit * multiplier;
        }
        let mod = sum % 10;
        let checkDigit = (mod === 0) ? 0 : 10 - mod;
        return cleanVal + checkDigit;
    }

    // 3. Barcode 12 Digit (EAN-13 -> menjadi 13 digit)
    if (cleanVal.length === 12 && !isNaN(cleanVal)) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            let digit = parseInt(cleanVal[i]);
            let multiplier = (i % 2 === 0) ? 1 : 3;
            sum += digit * multiplier;
        }
        let mod = sum % 10;
        let checkDigit = (mod === 0) ? 0 : 10 - mod;
        return cleanVal + checkDigit;
    }

    return cleanVal;
}

// =========================================================
// SINKRONISASI STOK SERVER
// =========================================================
async function sinkronisasiStokServerSoReguler(isManual = false) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    let dropdownHTML = `
        <button onclick="tutupDropdownOtomatis(); sinkronisasiStokServerSoReguler(true);">🔄 Sync Server</button>
        <button onclick="tutupDropdownOtomatis(); exportExcelSoReguler();">📥 Download / Cetak</button>
    `;

    if (!savedToken || isSkipped) {
        if (isManual) await showModernAlert("Mode Tamu / Belum Login: Tidak dapat melakukan sinkronisasi server.", "Perhatian");
        setupWorkspaceHeader("SO Reguler / Partial", "Mode Tamu (OH = 0)", true, dropdownHTML);
        return;
    }

    if (dataMenuSoReguler.length === 0) {
        if (isManual) await showModernAlert("Belum ada data item planogram untuk disinkronkan.", "Perhatian");
        return;
    }

    setupWorkspaceHeader("SO Reguler / Partial", "Sync server...", true, dropdownHTML);

    let successCount = 0;
    let isSessionExpired = false;

    for (let i = 0; i < dataMenuSoReguler.length; i++) {
        let item = dataMenuSoReguler[i];
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
                
                let ohEl = document.getElementById(`oh-so-val-${i}`);
                let selisihEl = document.getElementById(`selisih-so-val-${i}`);
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

        setupWorkspaceHeader("SO Reguler / Partial", "Sesi Berakhir (Harap Login)", false);
        return;
    }

    localStorage.setItem(STORAGE_KEY_SO_REGULER, JSON.stringify(dataMenuSoReguler));
    setupWorkspaceHeader("SO Reguler / Partial", `${successCount} item tersinkron`, true, dropdownHTML);
    if (isManual) await showModernAlert(`Sinkronisasi SO Reguler Berhasil! Stok ${successCount} item diperbarui dari server.`, "Sukses");
}

function toggleMinimizePdfCard() {
    isPdfCardMinimized = !isPdfCardMinimized;
    applyPdfCardMinimizeState();
}

function applyPdfCardMinimizeState() {
    let bodyContent = document.getElementById('pdfCardBodyContent');
    let minimizedView = document.getElementById('pdfCardMinimizedView');
    let arrowBtn = document.getElementById('pdfToggleArrowBtn');
    let cardTitle = document.getElementById('pdfCardTitle');

    if (!bodyContent || !minimizedView || !arrowBtn) return;

    if (isPdfCardMinimized) {
        bodyContent.classList.add('hidden');
        minimizedView.classList.remove('hidden');
        arrowBtn.innerText = "▼";
        if (dataMenuSoReguler.length > 0) {
            cardTitle.innerText = `Sumber Data PDF (${dataMenuSoReguler.length} Item Dimuat)`;
        } else {
            cardTitle.innerText = `Sumber Data PDF (Belum ada data)`;
        }
    } else {
        bodyContent.classList.remove('hidden');
        minimizedView.classList.add('hidden');
        arrowBtn.innerText = "▲";
        cardTitle.innerText = "1. Sumber Data Planogram PDF";
    }
}

function setStatusPdf(msg, color) {
    let el = document.getElementById('pdfStatusMsg');
    if (el) {
        el.innerText = msg;
        el.style.color = color;
    }
}

function handlePdfUpload(event) {
    let file = event.target.files[0];
    if (!file) return;

    setStatusPdf("Membaca file PDF lokal...", "#38bdf8");
    let reader = new FileReader();
    reader.onload = function(e) {
        let typedarray = new Uint8Array(e.target.result);
        parsePdfDataPlanogram(typedarray);
    };
    reader.readAsArrayBuffer(file);
}

// Otomatis Konversi Link Google Drive dengan CORS Proxy Bypass
function formatGoogleDriveLink(url) {
    let cleanUrl = url.trim();
    let fileIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/) || cleanUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    
    if (fileIdMatch && fileIdMatch[1]) {
        let fileId = fileIdMatch[1];
        let directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
    }
    return cleanUrl;
}

function handlePdfFromLink() {
    let rawInput = document.getElementById('pdfLinkInput').value.trim();
    if (!rawInput) {
        showModernAlert("Silakan masukkan tautan link PDF terlebih dahulu!", "Perhatian");
        return;
    }

    let url = formatGoogleDriveLink(rawInput);

    setStatusPdf("Mengunduh dan membaca PDF dari link...", "#38bdf8");
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Gagal mengambil file dari link.");
            return response.arrayBuffer();
        })
        .then(buffer => {
            parsePdfDataPlanogram(new Uint8Array(buffer));
        })
        .catch(err => {
            console.error(err);
            setStatusPdf("Error: Gagal memuat PDF dari link.", "#ef4444");
            showModernAlert("Gagal memuat PDF dari link tersebut.", "Perhatian");
        });
}

// =========================================================
// SCANNER KHUSUS QR CODE LINK PDF (Kamera Belakang)
// =========================================================
async function bukaScannerQrLink() {
    let scannerBox = document.getElementById('scannerQrLinkContainer');
    scannerBox.classList.remove('hidden');
    isLinkFlashOn = false;
    updateLinkFlashButtonUI();

    if (!html5QrCodeLink) {
        html5QrCodeLink = new Html5Qrcode("readerQrLink");
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

            await html5QrCodeLink.start(
                selectedCameraId,
                { fps: 20, qrbox: { width: 240, height: 120 } },
                (decodedText) => {
                    tutupScannerQrLink();
                    let linkInput = document.getElementById('pdfLinkInput');
                    if (linkInput) {
                        linkInput.value = decodedText.trim();
                    }
                    handlePdfFromLink();
                },
                (errorMessage) => {}
            );
        } else {
            throw "Tidak ada kamera terdeteksi.";
        }
    } catch (err) {
        html5QrCodeLink.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 240, height: 120 } },
            (decodedText) => {
                tutupScannerQrLink();
                let linkInput = document.getElementById('pdfLinkInput');
                if (linkInput) {
                    linkInput.value = decodedText.trim();
                }
                handlePdfFromLink();
            },
            (errorMessage) => {}
        ).catch(async fallbackErr => {
            await showModernAlert("Gagal mengaktifkan kamera: " + fallbackErr, "Error Kamera");
            scannerBox.classList.add('hidden');
        });
    }
}

function toggleLinkFlashLight() {
    if (!html5QrCodeLink || !html5QrCodeLink.isScanning) return;

    isLinkFlashOn = !isLinkFlashOn;
    html5QrCodeLink.applyVideoConstraints({
        advanced: [{ torch: isLinkFlashOn }]
    }).then(() => {
        updateLinkFlashButtonUI();
    }).catch(() => {
        isLinkFlashOn = !isLinkFlashOn;
    });
}

function updateLinkFlashButtonUI() {
    let btn = document.getElementById('flashLinkToggleBtn');
    if (!btn) return;
    if (isLinkFlashOn) {
        btn.style.background = "#eab308";
        btn.style.color = "#000";
        btn.innerText = "⚡ Flash: ON";
    } else {
        btn.style.background = "#4b5563";
        btn.style.color = "#fff";
        btn.innerText = "⚡ Flash: OFF";
    }
}

function tutupScannerQrLink() {
    let scannerBox = document.getElementById('scannerQrLinkContainer');
    scannerBox.classList.add('hidden');

    if (html5QrCodeLink && html5QrCodeLink.isScanning) {
        if (isLinkFlashOn) {
            html5QrCodeLink.applyVideoConstraints({ advanced: [{ torch: false }] }).catch(() => {});
            isLinkFlashOn = false;
        }
        html5QrCodeLink.stop().then(() => {
            html5QrCodeLink.clear();
        }).catch(err => console.error(err));
    }
}

// =========================================================
// MESIN PARSER DENGAN NORMALISASI BARCODE OTOMATIS
// =========================================================
async function parsePdfDataPlanogram(dataUint8) {
    try {
        let loadingTask = pdfjsLib.getDocument({ data: dataUint8 });
        let pdfDoc = await loadingTask.promise;
        let totalPages = pdfDoc.numPages;
        
        let allLines = [];

        for (let i = 1; i <= totalPages; i++) {
            setStatusPdf(`Mengekstrak halaman ${i} dari ${totalPages}...`, "#38bdf8");
            let page = await pdfDoc.getPage(i);
            let textContent = await page.getTextContent();
            
            let items = textContent.items;
            items.sort((a, b) => {
                let yDiff = b.transform[5] - a.transform[5];
                if (Math.abs(yDiff) > 4) return yDiff; 
                return a.transform[4] - b.transform[4]; 
            });

            let currentY = null;
            let lineText = "";
            for (let item of items) {
                let y = Math.round(item.transform[5]);
                if (currentY === null || Math.abs(currentY - y) > 4) {
                    if (lineText.trim() !== "") allLines.push(lineText.trim());
                    lineText = item.str;
                    currentY = y;
                } else {
                    lineText += " " + item.str;
                }
            }
            if (lineText.trim() !== "") allLines.push(lineText.trim());
        }

        let rawProducts = [];
        let currentItem = null;

        for (let line of allLines) {
            line = line.replace(/\s+/g, ' ').trim();
            let tokens = line.split(' ');

            let validItem = false;
            let plu = "";
            let barcodeRaw = "-";
            let idxDesc = 0;

            if (tokens.length >= 3) {
                for (let j = 0; j < tokens.length - 1; j++) {
                    let tokenCurr = tokens[j];
                    let tokenNext = tokens[j + 1];

                    if (/^\d{1,2}$/.test(tokenCurr) && /^\d{3,14}$/.test(tokenNext)) {
                        let num = parseInt(tokenCurr);
                        if (num >= 1 && num <= 99) {
                            validItem = true;

                            if (tokenNext.length >= 7 && tokenNext.length <= 14) {
                                barcodeRaw = tokenNext;
                            } else if (tokenNext.length >= 3 && tokenNext.length <= 6) {
                                plu = tokenNext;
                            }
                            idxDesc = j + 2;

                            if (tokens.length > j + 2 && /^\d+$/.test(tokens[j + 2])) {
                                let tokenAfter = tokens[j + 2];
                                if (barcodeRaw === "-" && tokenAfter.length >= 7 && tokenAfter.length <= 14) {
                                    barcodeRaw = tokenAfter;
                                    idxDesc = j + 3;
                                } else if (!plu && tokenAfter.length >= 3 && tokenAfter.length <= 6) {
                                    plu = tokenAfter;
                                    idxDesc = j + 3;
                                }
                            }
                            break;
                        }
                    }
                }
            }

            if (validItem) {
                if (currentItem) {
                    rawProducts.push(currentItem);
                }

                let tempDesc = [];
                for (let k = idxDesc; k < tokens.length; k++) {
                    let word = tokens[k];
                    if (/^0[1-4]$/.test(word) && k > idxDesc + 1) {
                        break;
                    }
                    tempDesc.push(word);
                }

                let bersihDesc = tempDesc.join(" ").trim();
                let finalBarcode = bersihkanFormatBarcodeSo(barcodeRaw);

                rawProducts.push({
                    plu: plu || '-',
                    barcode: finalBarcode,
                    namaItem: bersihDesc || line,
                    qty: 0,
                    oh: 0,
                    selisih: 0
                });
                currentItem = rawProducts[rawProducts.length - 1];
            } else {
                if (currentItem) {
                    if (!/^\d+(\.\d+)?\s+\d+/.test(line) && !line.includes("PLANOGRAM") && !line.includes("Toko") && !line.includes("Class")) {
                        currentItem.namaItem += " " + line;
                    }
                }
            }
        }

        let uniqueProducts = [];
        let seenPluSet = new Set();

        for (let prod of rawProducts) {
            if (prod.plu !== '-' && seenPluSet.has(prod.plu)) {
                continue; 
            }
            if (prod.plu !== '-') {
                seenPluSet.add(prod.plu);
            }
            uniqueProducts.push(prod);
        }

        let savedLocalData = localStorage.getItem(STORAGE_KEY_SO_REGULER);
        if (savedLocalData) {
            try {
                let parsedLocal = JSON.parse(savedLocalData);
                uniqueProducts.forEach(master => {
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

        dataMenuSoReguler = uniqueProducts;
        localStorage.setItem(STORAGE_KEY_SO_REGULER, JSON.stringify(dataMenuSoReguler));
        renderTabelSoReguler(dataMenuSoReguler);
        setStatusPdf(`Berhasil mengekstrak ${dataMenuSoReguler.length} item unik bersih dari Planogram!`, "#22c55e");

        isPdfCardMinimized = true;
        applyPdfCardMinimizeState();
        let summaryEl = document.getElementById('pdfSummaryText');
        if (summaryEl) summaryEl.innerText = `PDF Aktif (${dataMenuSoReguler.length} Item)`;

    } catch (error) {
        console.error(error);
        setStatusPdf("Gagal memproses file PDF.", "#ef4444");
    }
}

// =========================================================
// RENDER TABEL SO REGULER
// =========================================================
function renderTabelSoReguler(listData) {
    let tbody = document.getElementById('tbodySoReguler');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (listData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 25px;">Tidak ada item ditemukan.</td></tr>`;
        return;
    }

    listData.forEach((item, index) => {
        let realIndex = dataMenuSoReguler.findIndex(d => d.plu === item.plu);
        let selisihWarna = item.selisih !== 0 ? "color: #ef4444; font-weight: bold;" : "";
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center; font-size: 12px;">${index + 1}</td>
            <td style="font-size: 12px;">
                <b>${item.plu}</b><br>
                <span onclick="tampilkanBarcodeGlobal('${item.barcode}', '${item.namaItem.replace(/'/g, "\\'")}');" style="color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Klik untuk tampilkan barcode">
                    <span>${item.barcode}</span>
                    <span style="font-size: 10px; background: rgba(56, 189, 248, 0.15); padding: 1px 4px; border-radius: 4px;">🪪 🔍</span>
                </span>
            </td>
            <td style="font-size: 12px;">${item.namaItem}</td>
            <td style="text-align: center;">
                <div onclick="bukaPopupSoQty(${realIndex})" class="qty-pill-box" title="Klik untuk tambah/hitung ulang">
                    <span id="qty-so-text-${realIndex}" style="font-weight: bold; font-size: 14px; color: #38bdf8;">${item.qty}</span>
                    <small style="font-size: 9px; display: block; color: var(--text-muted);">ketuk edit</small>
                </div>
            </td>
            <td style="text-align: center; font-size: 13px;" id="oh-so-val-${realIndex}">${item.oh}</td>
            <td style="text-align: center; font-size: 13px; ${selisihWarna}" id="selisih-so-val-${realIndex}">${item.selisih}</td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================================
// PENCARIAN REAL-TIME & FILTER SELISIH
// =========================================================
function handleSoPencarianInput(val) {
    let clearBtn = document.getElementById('btnClearSoSearch');
    if (val.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
    filterSoPencarianRealtime(val);
}

function filterSoPencarianRealtime(keyword) {
    let query = keyword.toLowerCase().trim();
    if (!query) {
        if (statusSoFilterSelisih) {
            let filtered = dataMenuSoReguler.filter(item => item.selisih !== 0);
            renderTabelSoReguler(filtered);
        } else {
            renderTabelSoReguler(dataMenuSoReguler);
        }
        return;
    }

    let baseList = statusSoFilterSelisih ? dataMenuSoReguler.filter(item => item.selisih !== 0) : dataMenuSoReguler;
    let filtered = baseList.filter(item => 
        item.plu.toLowerCase().includes(query) ||
        item.barcode.toLowerCase().includes(query) ||
        item.namaItem.toLowerCase().includes(query)
    );

    renderTabelSoReguler(filtered);
}

function bersihkanSoPencarian() {
    let inputEl = document.getElementById('inputCariSoItem');
    inputEl.value = "";
    document.getElementById('btnClearSoSearch').classList.add('hidden');
    
    if (statusSoFilterSelisih) {
        let filtered = dataMenuSoReguler.filter(item => item.selisih !== 0);
        renderTabelSoReguler(filtered);
    } else {
        renderTabelSoReguler(dataMenuSoReguler);
    }
    inputEl.focus();
}

function filterSoSelisihToggle() {
    statusSoFilterSelisih = !statusSoFilterSelisih;
    let btn = document.getElementById('btnCekSoSelisih');
    let keyword = document.getElementById('inputCariSoItem').value;

    if (statusSoFilterSelisih) {
        btn.style.background = "#dc2626";
        btn.innerText = "📋 Tampilkan Semua";
        let filtered = dataMenuSoReguler.filter(item => item.selisih !== 0);
        if (keyword) {
            filtered = filtered.filter(item => 
                item.plu.toLowerCase().includes(keyword) ||
                item.barcode.toLowerCase().includes(keyword) ||
                item.namaItem.toLowerCase().includes(keyword)
            );
        }
        renderTabelSoReguler(filtered);
    } else {
        btn.style.background = "#2563eb";
        btn.innerText = "📊 Cek Selisih";
        if (keyword) {
            filterSoPencarianRealtime(keyword);
        } else {
            renderTabelSoReguler(dataMenuSoReguler);
        }
    }
}

// =========================================================
// POPUP QTY & STEPPER
// =========================================================
function bukaPopupSoQty(index) {
    currentIndexSoAktif = index;
    let item = dataMenuSoReguler[index];

    document.getElementById('modalSoNamaItem').innerText = item.namaItem;
    document.getElementById('modalSoPluText').innerText = item.plu;
    document.getElementById('modalSoBarcodeText').innerText = item.barcode;
    document.getElementById('modalSoCurrentQty').innerText = item.qty;
    document.getElementById('modalSoInputTambah').value = "0";

    document.getElementById('popupSoQtyModal').classList.remove('hidden');
    document.getElementById('modalSoInputTambah').focus();
    document.getElementById('modalSoInputTambah').select();
}

function tutupPopupSoQty() {
    document.getElementById('popupSoQtyModal').classList.add('hidden');
    currentIndexSoAktif = null;
}

function ubahNilaiInputSoPopup(delta) {
    let inputEl = document.getElementById('modalSoInputTambah');
    let val = parseInt(inputEl.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    inputEl.value = val;
}

function simpanSoQtyTambah() {
    if (currentIndexSoAktif === null) return;

    let inputTambah = parseInt(document.getElementById('modalSoInputTambah').value) || 0;
    let item = dataMenuSoReguler[currentIndexSoAktif];

    item.qty += inputTambah;
    if (item.qty < 0) item.qty = 0;

    item.selisih = item.qty - item.oh;

    let qtySpan = document.getElementById(`qty-so-text-${currentIndexSoAktif}`);
    if (qtySpan) qtySpan.innerText = item.qty;

    let selisihEl = document.getElementById(`selisih-so-val-${currentIndexSoAktif}`);
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

    localStorage.setItem(STORAGE_KEY_SO_REGULER, JSON.stringify(dataMenuSoReguler));
    tutupPopupSoQty();
}

async function resetQtyItemSoReguler() {
    if (currentIndexSoAktif === null) return;
    let isConfirmed = await showModernConfirm("Reset Qty item ini menjadi 0?", "Konfirmasi Reset");
    if (isConfirmed) {
        let item = dataMenuSoReguler[currentIndexSoAktif];
        item.qty = 0;
        item.selisih = item.qty - item.oh;

        localStorage.setItem(STORAGE_KEY_SO_REGULER, JSON.stringify(dataMenuSoReguler));
        renderTabelSoReguler(dataMenuSoReguler);
        tutupPopupSoQty();
    }
}

async function konfirmasiResetSoReguler() {
    let isConfirmed = await showModernConfirm("PERINGATAN: Apakah Anda yakin ingin mereset semua data Qty fisik SO Reguler?", "Reset Seluruh SO");
    if (isConfirmed) {
        localStorage.removeItem(STORAGE_KEY_SO_REGULER);
        dataMenuSoReguler.forEach(item => {
            item.qty = 0;
            item.oh = 0;
            item.selisih = 0;
        });
        renderTabelSoReguler(dataMenuSoReguler);
        await showModernAlert("Semua data Qty SO Reguler berhasil direset!", "Sukses");
    }
}

// =========================================================
// SCANNER KAMERA & SENTER FLASHLIGHT
// =========================================================
async function bukaSoScannerKamera() {
    let scannerBox = document.getElementById('scannerSoContainer');
    scannerBox.classList.remove('hidden');
    isSoFlashOn = false;
    updateSoFlashButtonUI();

    if (!html5QrCodeSo) {
        html5QrCodeSo = new Html5Qrcode("readerSo");
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

            await html5QrCodeSo.start(
                selectedCameraId,
                { fps: 20, qrbox: { width: 260, height: 140 } },
                (decodedText) => {
                    tutupSoScannerKamera();
                    cariDanBukaSoItemDariBarcode(decodedText.trim());
                },
                (errorMessage) => {}
            );
        } else {
            throw "Tidak ada kamera terdeteksi.";
        }
    } catch (err) {
        html5QrCodeSo.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 260, height: 140 } },
            (decodedText) => {
                tutupSoScannerKamera();
                cariDanBukaSoItemDariBarcode(decodedText.trim());
            },
            (errorMessage) => {}
        ).catch(async fallbackErr => {
            await showModernAlert("Gagal mengaktifkan kamera: " + fallbackErr, "Error Kamera");
            scannerBox.classList.add('hidden');
        });
    }
}

function toggleSoFlashLight() {
    if (!html5QrCodeSo || !html5QrCodeSo.isScanning) return;

    isSoFlashOn = !isSoFlashOn;
    html5QrCodeSo.applyVideoConstraints({
        advanced: [{ torch: isSoFlashOn }]
    }).then(() => {
        updateSoFlashButtonUI();
    }).catch(async err => {
        isSoFlashOn = !isSoFlashOn;
        await showModernAlert("Fitur Flash (Senter) tidak didukung pada perangkat ini.", "Informasi");
    });
}

function updateSoFlashButtonUI() {
    let btn = document.getElementById('flashSoToggleBtn');
    if (!btn) return;
    if (isSoFlashOn) {
        btn.style.background = "#eab308";
        btn.style.color = "#000";
        btn.innerText = "⚡ Flash: ON";
    } else {
        btn.style.background = "#4b5563";
        btn.style.color = "#fff";
        btn.innerText = "⚡ Flash: OFF";
    }
}

function tutupSoScannerKamera() {
    let scannerBox = document.getElementById('scannerSoContainer');
    scannerBox.classList.add('hidden');

    if (html5QrCodeSo && html5QrCodeSo.isScanning) {
        if (isSoFlashOn) {
            html5QrCodeSo.applyVideoConstraints({ advanced: [{ torch: false }] }).catch(() => {});
            isSoFlashOn = false;
        }
        html5QrCodeSo.stop().then(() => {
            html5QrCodeSo.clear();
        }).catch(err => console.error(err));
    }
}

function cariDanBukaSoItemDariBarcode(scannedBarcode) {
    let cleanScanned = bersihkanFormatBarcodeSo(scannedBarcode);
    let foundIndex = dataMenuSoReguler.findIndex(item => item.barcode === cleanScanned);
    if (foundIndex !== -1) {
        bersihkanSoPencarian();
        bukaPopupSoQty(foundIndex);
    } else {
        showModernAlert(`Barcode [${cleanScanned}] tidak ditemukan dalam Planogram PDF ini.`, "Item Tidak Ditemukan");
    }
}

// =========================================================
// EKSPOR LAPORAN EXCEL
// =========================================================
function exportExcelSoReguler() {
    if (dataMenuSoReguler.length === 0) {
        showModernAlert("Belum ada data SO Reguler untuk diexport!", "Perhatian");
        return;
    }
    exportUniversalReport("Stock Opname - SO Reguler (Planogram)", dataMenuSoReguler);
}
