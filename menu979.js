const CSV_URL = "https://docs.google.com/spreadsheets/d/15Albul63206zfgQ8vaa0krgcoryLURf2xEGv3K-UueI/export?format=csv";

let dataMenu979 = [];
const STORAGE_KEY_979 = "apo_data_menu_979";

async function loadMenu979() {
    let container = document.getElementById('workspaceCard');
    container.style.maxWidth = "100%";
    container.style.margin = "0";
    container.style.borderRadius = "0";
    container.style.minHeight = "100vh";

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <h3 style="font-size: 18px; margin: 0;">Menu Rak 979 (Stock Opname)</h3>
            <button onclick="sinkronisasiStokServer(true)" style="background: #2563eb; width: auto; padding: 6px 12px; font-size: 12px; margin: 0;" title="Perbarui stok sistem dari server">🔄 Sync Stok Server</button>
        </div>
        <p id="statusLoad979" style="text-align: center; color: var(--text-muted); font-size: 12px; margin-bottom: 15px;">Memuat data master...</p>
        
        <div class="table-full-container">
            <table id="tabelMenu979">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th>PLU / Barcode</th>
                        <th>Nama Item</th>
                        <th style="text-align: center; width: 130px;">QTY (Fisik)</th>
                        <th style="text-align: center; width: 50px;">OH</th>
                        <th style="text-align: center; width: 60px;">Selisih</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button onclick="exportExcel979()" class="excel-btn" style="flex: 1; margin:0; padding: 12px;">Download Excel</button>
            <button onclick="filterSelisih979()" style="background: #f59e0b; flex: 1; margin:0; padding: 12px;">Filter Selisih</button>
        </div>
        <button onclick="kembaliKeMenu()" class="back-btn" style="padding: 12px;">Kembali ke Menu Utama</button>
    `;

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
    renderTabel979();
    
    if (savedLocalData) {
        document.getElementById('statusLoad979').innerText = `Memuat ${dataMenu979.length} item dari memori tersimpan. Klik "Sync Stok Server" untuk memperbarui stok.`;
    } else {
        document.getElementById('statusLoad979').innerText = `Total ${dataMenu979.length} item dimuat. Menyinkronkan stok server...`;
        sinkronisasiStokServer(false);
    }
}

function renderTabel979() {
    let tbody = document.querySelector('#tabelMenu979 tbody');
    tbody.innerHTML = "";

    dataMenu979.forEach((item, index) => {
        let tr = document.createElement('tr');
        let selisihWarna = item.selisih !== 0 ? "color: #ef4444;" : "";
        tr.innerHTML = `
            <td style="text-align: center; font-size: 12px;">${item.no}</td>
            <td style="font-size: 12px;"><b>${item.plu}</b><br><small style="color: var(--text-muted);">${item.barcode}</small></td>
            <td style="font-size: 12px;">${item.namaItem}</td>
            <td style="text-align: center; white-space: nowrap;">
                <div class="qty-control-group">
                    <button onclick="ubahQty(${index}, -1)" class="qty-btn-adjust">-</button>
                    <input type="number" id="qty-input-${index}" value="${item.qty}" onchange="updateQtyManual(${index}, this.value)" class="qty-input-box" />
                    <button onclick="ubahQty(${index}, 1)" class="qty-btn-adjust">+</button>
                </div>
            </td>
            <td style="text-align: center; font-size: 13px;" id="oh-val-${index}">${item.oh}</td>
            <td style="text-align: center; font-size: 13px; font-weight: bold; ${selisihWarna}" id="selisih-val-${index}">${item.selisih}</td>
        `;
        tbody.appendChild(tr);
    });
}

function ubahQty(index, delta) {
    let inputEl = document.getElementById(`qty-input-${index}`);
    let val = parseInt(inputEl.value) || 0;
    val += delta;
    if (val < 0) val = 0;

    inputEl.value = val;
    updateQtyManual(index, val);
}

function updateQtyManual(index, value) {
    let val = parseInt(value) || 0;
    if (val < 0) val = 0;

    dataMenu979[index].qty = val;
    dataMenu979[index].selisih = dataMenu979[index].qty - dataMenu979[index].oh;

    let selisihEl = document.getElementById(`selisih-val-${index}`);
    selisihEl.innerText = dataMenu979[index].selisih;
    
    if (dataMenu979[index].selisih !== 0) {
        selisihEl.style.color = "#ef4444";
    } else {
        selisihEl.style.color = "inherit";
    }

    localStorage.setItem(STORAGE_KEY_979, JSON.stringify(dataMenu979));
}

// Fungsi sinkronisasi stok server (bisa dipanggil otomatis atau lewat tombol manual)
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
                // Hitung ulang selisih berdasarkan Qty fisik saat ini dan OH terbaru
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

let hanyaSelisih = false;
function filterSelisih979() {
    hanyaSelisih = !hanyaSelisih;
    let tbody = document.querySelector('#tabelMenu979 tbody');
    let rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let selisihVal = parseInt(document.getElementById(`selisih-val-${i}`).innerText);
        if (hanyaSelisih && selisihVal === 0) {
            rows[i].style.display = "none";
        } else {
            rows[i].style.display = "";
        }
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
