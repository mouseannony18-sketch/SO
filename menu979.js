// Konfigurasi Link CSV Spreadsheet Rak 979
const CSV_URL = "https://docs.google.com/spreadsheets/d/15Albul63206zfgQ8vaa0krgcoryLURf2xEGv3K-UueI/export?format=csv";

let dataMenu979 = [];

// Fungsi utama yang dipanggil saat Menu 979 dibuka
async function loadMenu979() {
    let container = document.getElementById('workspaceCard');
    container.innerHTML = `
        <h3>Menu Rak 979 (Stock Opname)</h3>
        <p id="statusLoad979" style="text-align: center; color: var(--text-muted); font-size: 13px;">Sedang memuat data master dari Spreadsheet...</p>
        
        <div style="overflow-x: auto; max-height: 450px; margin-top: 10px;">
            <table id="tabelMenu979">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>PLU</th>
                        <th>Barcode</th>
                        <th>Nama Item</th>
                        <th style="text-align: center;">QTY</th>
                        <th style="text-align: center;">OH</th>
                        <th style="text-align: center;">Selisih</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button onclick="exportExcel979()" class="excel-btn" style="flex: 1; margin:0;">Download Excel</button>
            <button onclick="filterSelisih979()" style="background: #f59e0b; flex: 1; margin:0;">Filter Selisih</button>
        </div>
        <button onclick="kembaliKeMenu()" class="back-btn">Kembali ke Menu Utama</button>
    `;

    try {
        let response = await fetch(CSV_URL);
        let csvText = await response.text();
        
        parseCSVData(csvText);
    } catch (error) {
        console.error(error);
        document.getElementById('statusLoad979').innerText = "Gagal memuat data spreadsheet. Periksa koneksi atau link publish.";
    }
}

// Memproses teks CSV menjadi array objek
function parseCSVData(text) {
    let lines = text.split("\n");
    dataMenu979 = [];

    // Mulai dari baris 1 (mengabaikan baris ke-0 jika header: PLU, Barcode, NamaItem)
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Mengatasi koma di dalam teks (menggunakan regex CSV parser sederhana)
        let row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let plu = row[0] ? row[0].replace(/"/g, '').trim() : "";
        let barcode = row[1] ? row[1].replace(/"/g, '').trim() : "-";
        let namaItem = row[2] ? row[2].replace(/"/g, '').trim() : "";

        if (plu || namaItem) {
            dataMenu979.push({
                no: dataMenu979.length + 1,
                plu: plu,
                barcode: barcode,
                namaItem: namaItem,
                qty: 0,
                oh: 0,
                selisih: 0
            });
        }
    }

    renderTabel979();
    document.getElementById('statusLoad979').innerText = `Total ${dataMenu979.length} item dimuat. Menyinkronkan stok server...`;
    
    // Sinkronisasi stok sistem (OH) secara latar belakang
    sinkronisasiStokServer();
}

// Render tabel ke HTML
function renderTabel979() {
    let tbody = document.querySelector('#tabelMenu979 tbody');
    tbody.innerHTML = "";

    dataMenu979.forEach((item, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">${item.no}</td>
            <td><b>${item.plu}</b></td>
            <td><small>${item.barcode}</small></td>
            <td>${item.namaItem}</td>
            <td style="text-align: center; white-space: nowrap;">
                <button onclick="ubahQty(${index}, -1)" style="padding: 2px 6px; width: auto; background: #dc3545; margin:0;">-</button>
                <span id="qty-val-${index}" style="margin: 0 8px; font-weight: bold;">${item.qty}</span>
                <button onclick="ubahQty(${index}, 1)" style="padding: 2px 6px; width: auto; background: #28a745; margin:0;">+</button>
            </td>
            <td style="text-align: center;" id="oh-val-${index}">${item.oh}</td>
            <td style="text-align: center; font-weight: bold;" id="selisih-val-${index}">${item.selisih}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fungsi mengubah QTY fisik dengan tombol + / -
function ubahQty(index, delta) {
    dataMenu979[index].qty += delta;
    if (dataMenu979[index].qty < 0) dataMenu979[index].qty = 0;

    // Hitung ulang selisih: QTY Fisik - Stok Sistem (OH)
    dataMenu979[index].selisih = dataMenu979[index].qty - dataMenu979[index].oh;

    // Perbarui tampilan teks di tabel secara instan tanpa reload ulang seluruh tabel
    document.getElementById(`qty-val-${index}`).innerText = dataMenu979[index].qty;
    let selisihEl = document.getElementById(`selisih-val-${index}`);
    selisihEl.innerText = dataMenu979[index].selisih;
    
    if (dataMenu979[index].selisih !== 0) {
        selisihEl.style.color = "#ef4444"; // Merah jika ada selisih
    } else {
        selisihEl.style.color = "inherit";
    }
}

// Sinkronisasi otomatis stok server (OH) untuk item yang memiliki barcode valid
async function sinkronisasiStokServer() {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken || isSkipped) {
        document.getElementById('statusLoad979').innerText = `Total ${dataMenu979.length} item dimuat. (Mode Tanpa Login / Sinkronisasi OH = 0)`;
        return;
    }

    let successCount = 0;
    for (let i = 0; i < dataMenu979.length; i++) {
        let item = dataMenu979[i];
        
        // Jika barcode kosong atau tanda "-", lewati pengecekan server
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
                
                // Update tampilan baris tersebut
                let ohEl = document.getElementById(`oh-val-${i}`);
                let selisihEl = document.getElementById(`selisih-val-${i}`);
                if (ohEl) ohEl.innerText = item.oh;
                if (selisihEl) {
                    selisihEl.innerText = item.selisih;
                    if (item.selisih !== 0) selisihEl.style.color = "#ef4444";
                }
                successCount++;
            }
        } catch (e) {
            console.error(`Gagal sync barcode ${item.barcode}:`, e);
        }
    }

    document.getElementById('statusLoad979').innerText = `Sinkronisasi selesai. Berhasil memperbarui stok ${successCount} item dari server.`;
}

// Tombol Filter khusus item yang berselisih
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

// Ekspor ke Excel (.xlsx) khusus Rak 979
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
