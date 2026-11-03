// =========================================================
// MODUL ADMIN INVENTORY (adminInventory.js)
// =========================================================

let dataMasterInventoryCache = [];
let html5QrCodeAdmin = null;

const GAS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJiZct8bOWnp1Ki7ArLW4Gq9hM2Lu6wffA-okAgV8aZJL4V3BueVeJC9jTuGvQIHTE8w/exec";

function pilihMenuAdminInventory() {
    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');
    
    if (mainMenuCard) mainMenuCard.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.remove('hidden');
    
    loadMenuAdminInventory();
}

function loadMenuAdminInventory() {
    let workspaceCard = document.getElementById('workspaceCard');
    
    ['menu979Container', 'menuBebasContainer', 'menuBebasGsContainer', 'soFormArea', 'adminFormArea'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    let container = document.getElementById('adminInventoryContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'adminInventoryContainer';
        workspaceCard.appendChild(container);
    }
    container.classList.remove('hidden');

    container.innerHTML = `
        <div style="padding: 10px 16px;">
            
            <!-- SECTION 1: SINKRONISASI SERVER CEX (Hanya Input Store ID, Branch DC Otomatis) -->
            <div class="gs-config-card" style="margin-bottom: 12px; padding: 12px 16px; border: 1px solid #38bdf8;">
                <h4 style="color: #38bdf8; font-size: 13px; margin-bottom: 6px;">🌐 Sinkronisasi Master dari Server CEX</h4>
                <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Masukkan Store ID toko Anda (Branch DC dideteksi otomatis).</p>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 6px;">
                        <input type="text" id="cexStoreIdInput" placeholder="Masukkan Store ID (Cth: M104)" class="input-field" style="margin:0; flex: 1;">
                    </div>
                    <button onclick="tarikDataDariServerCexViaApi()" class="primary-btn" style="margin:0; background: #2563eb;">🚀 Tarik Data Master CEX</button>
                </div>
            </div>

            <!-- SECTION 2: INPUT MANUAL + KAMERA SCANNER -->
            <div class="gs-config-card" style="margin-bottom: 12px; padding: 12px 16px;">
                <h4 style="color: #059669; font-size: 13px; margin-bottom: 8px;">➕ Input Manual Item Master</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <input type="text" id="admInputPlu" placeholder="Nomor PLU (Cth: 465911)" class="input-field" style="margin:0;">
                    
                    <div style="display: flex; gap: 6px;">
                        <input type="text" id="admInputBarcode" placeholder="Barcode Barang" class="input-field" style="margin:0; flex:1;">
                        <button onclick="bukaKameraAdminScan()" style="background: #374151; color: #38bdf8; border: 1px solid var(--border-color); border-radius: 8px; padding: 0 12px; font-size: 12px; cursor: pointer;">📷 Scan</button>
                    </div>

                    <!-- Area Kamera Scanner Admin -->
                    <div id="scannerContainerAdmin" class="scanner-box hidden" style="margin-bottom: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <b style="font-size: 11px; color: #38bdf8;">Arahkan ke Barcode</b>
                            <button onclick="tutupKameraAdminScan()" class="close-scanner-btn" style="padding: 2px 8px; font-size: 10px;">Tutup</button>
                        </div>
                        <div id="readerAdmin" style="width: 100%;"></div>
                    </div>

                    <input type="text" id="admInputNama" placeholder="Deskripsi / Nama Item" class="input-field" style="margin:0;">
                    <button onclick="tambahItemManualKeSpreadsheet()" class="primary-btn" style="margin:0; background: #059669;">Simpan Manual ke Spreadsheet</button>
                </div>
            </div>

            <!-- SECTION 3: LIVE SEARCH MASTER ITEM -->
            <div class="gs-config-card" style="padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h4 style="color: #38bdf8; font-size: 13px; margin:0;">🔍 Cek Master Item (Live Search)</h4>
                    <button onclick="muatCacheDataMaster()" style="background: #374151; color: #38bdf8; border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer;">🔄 Muat Ulang Cache</button>
                </div>
                
                <div class="search-box-wrapper" style="margin-bottom: 8px;">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="inputLiveSearchAdmin" oninput="handleLiveSearchAdmin(this.value)" placeholder="Ketik PLU atau Deskripsi barang..." class="modern-search-input" />
                </div>

                <div class="table-full-container" style="max-height: 250px; overflow-y: auto;">
                    <table id="tabelMasterAdmin">
                        <thead>
                            <tr>
                                <th style="width: 40px;">#</th>
                                <th>PLU / Barcode</th>
                                <th>Deskripsi Item</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyMasterAdmin">
                            <tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Ketik kata kunci di atas untuk mencari barang...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    muatCacheDataMaster();

    if (typeof setupWorkspaceHeader === 'function') {
        setupWorkspaceHeader("Admin Inventory", "Kelola & Sinkronisasi Master Item", true, `<button onclick="tutupDropdownOtomatis();" class="auth-action-btn">Menu</button>`);
    }
}

// =========================================================
// FUNGSI TARIK DATA LANGSUNG MELALUI GOOGLE APPS SCRIPT
// =========================================================
async function tarikDataDariServerCexViaApi() {
    let storeId = document.getElementById('cexStoreIdInput').value.trim();

    if (!storeId) {
        if (typeof showModernAlert === 'function') showModernAlert("Store ID wajib diisi!", "Perhatian");
        else alert("Store ID wajib diisi!");
        return;
    }

    if (typeof showModernAlert === 'function') showModernAlert("Google Spreadsheet sedang menarik data langsung dari server CEX (Proses ini mungkin memakan waktu beberapa detik)...", "Memproses");

    try {
        let response = await fetch(GAS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ 
                action: 'pullFromCexServer', 
                storeId: storeId 
            })
        });

        let result = await response.json();

        if (result && result.success) {
            if (typeof showModernAlert === 'function') showModernAlert(result.message, "Sukses");
            muatCacheDataMaster(); // Refresh cache tabel live search
        } else {
            throw new Error(result.message || "Gagal melakukan sinkronisasi.");
        }
    } catch (err) {
        console.error("Apps Script Direct Sync Error:", err);
        if (typeof showModernAlert === 'function') showModernAlert("Terjadi kesalahan saat menarik data: " + err.message, "Error");
    }
}

// =========================================================
// FUNGSI INPUT MANUAL
// =========================================================
async function tambahItemManualKeSpreadsheet() {
    let plu = document.getElementById('admInputPlu').value.trim();
    let barcode = document.getElementById('admInputBarcode').value.trim();
    let deskripsi = document.getElementById('admInputNama').value.trim();

    if (!plu || !deskripsi) {
        if (typeof showModernAlert === 'function') showModernAlert("PLU dan Deskripsi Item wajib diisi!", "Perhatian");
        else alert("PLU dan Deskripsi Item wajib diisi!");
        return;
    }

    await kirimDataKeGoogleScript({
        action: 'syncOrAdd',
        items: [{ plu: plu, barcode: barcode || "-", deskripsi: deskripsi }]
    });

    document.getElementById('admInputPlu').value = "";
    document.getElementById('admInputBarcode').value = "";
    document.getElementById('admInputNama').value = "";
    document.getElementById('admInputPlu').focus();
}

async function kirimDataKeGoogleScript(payloadData) {
    try {
        await fetch(GAS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payloadData)
        });

        if (typeof showModernAlert === 'function') showModernAlert("Data berhasil disinkronkan ke Spreadsheet!", "Sukses");
        muatCacheDataMaster();
    } catch (err) {
        console.error("GAS Error:", err);
        if (typeof showModernAlert === 'function') showModernAlert("Gagal mengirim data ke Spreadsheet.", "Error");
    }
}

// =========================================================
// FUNGSI CACHE & LIVE SEARCH MASTER ITEM
// =========================================================
async function muatCacheDataMaster() {
    try {
        let response = await fetch(GAS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'getData' })
        });
        
        let result = await response.json();
        if (result && result.success) {
            dataMasterInventoryCache = result.data || [];
            if (typeof showModernAlert === 'function') showModernAlert(`Cache dimuat (${dataMasterInventoryCache.length} item master).`, "Informasi");
        }
    } catch (err) {
        console.error("Gagal memuat cache master:", err);
    }
}

function handleLiveSearchAdmin(keyword) {
    let query = keyword.toLowerCase().trim();
    let tbody = document.getElementById('tbodyMasterAdmin');
    if (!tbody) return;

    if (!query || query.length < 2) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Ketik minimal 2 karakter untuk mencari barang...</td></tr>`;
        return;
    }

    let filtered = dataMasterInventoryCache.filter(item => 
        item.plu.toLowerCase().includes(query) ||
        item.barcode.toLowerCase().includes(query) ||
        (item.namaItem && item.namaItem.toLowerCase().includes(query))
    ).slice(0, 50); // Batasi tampil 50 item teratas agar ringan

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Barang tidak ditemukan dalam master.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    filtered.forEach((item, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center; font-size: 12px;">${index + 1}</td>
            <td style="font-size: 12px;">
                <b>${item.plu}</b><br>
                <span style="color: #38bdf8; font-size: 11px;">${item.barcode}</span>
            </td>
            <td style="font-size: 12px;">${item.namaItem}</td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================================
// FUNGSI KAMERA SCANNER BARCODE
// =========================================================
async function bukaKameraAdminScan() {
    let scannerBox = document.getElementById('scannerContainerAdmin');
    scannerBox.classList.remove('hidden');

    if (!window.Html5Qrcode) return;

    if (!html5QrCodeAdmin) {
        html5QrCodeAdmin = new Html5Qrcode("readerAdmin");
    }

    try {
        await html5QrCodeAdmin.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 240, height: 120 } },
            (decodedText) => {
                tutupKameraAdminScan();
                let cleanCode = decodedText.trim();
                document.getElementById('admInputBarcode').value = cleanCode;
                if (typeof showModernAlert === 'function') showModernAlert(`Barcode terpindai: ${cleanCode}`, "Berhasil");
            },
            (errorMessage) => {}
        );
    } catch (err) {
        if (typeof showModernAlert === 'function') showModernAlert("Gagal membuka kamera: " + err, "Error Kamera");
        scannerBox.classList.add('hidden');
    }
}

function tutupKameraAdminScan() {
    let scannerBox = document.getElementById('scannerContainerAdmin');
    scannerBox.classList.add('hidden');

    if (html5QrCodeAdmin && html5QrCodeAdmin.isScanning) {
        html5QrCodeAdmin.stop().then(() => {
            html5QrCodeAdmin.clear();
        }).catch(err => console.error(err));
    }
}
