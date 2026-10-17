let tokenGlobal = "";
let dataSO = [];
let menuAktif = "";
let currentNik = "";
let isSessionValid = true;

window.onload = function() {
    let savedTheme = localStorage.getItem('apo_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        document.querySelector('.theme-toggle-btn').innerText = '☀️';
    }

    let savedToken = localStorage.getItem('apo_token');
    let savedNik = localStorage.getItem('apo_nik');
    let savedName = localStorage.getItem('apo_name');
    let savedStore = localStorage.getItem('apo_store');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    let isPageRefreshed = sessionStorage.getItem('apo_is_refreshed');
    let activeMenu = localStorage.getItem('apo_active_menu');

    if ((savedToken && savedNik) || isSkipped) {
        tokenGlobal = savedToken || "";
        currentNik = savedNik || "Tamu";
        isSessionValid = savedToken ? true : false;
        
        document.getElementById('userNameText').innerText = savedName || (isSkipped ? "Mode Tamu (Tanpa Login)" : "Karyawan Alfamart");
        document.getElementById('storeNameText').innerText = savedStore || "Sinkronisasi Server: 0 (Null)";

        updateAuthButtonState(isSessionValid);

        document.getElementById('loginCard').classList.add('hidden');
        document.getElementById('sessionModal').classList.add('hidden');

        if (isPageRefreshed && activeMenu === '979' && typeof loadMenu979 === 'function') {
            document.getElementById('mainMenuCard').classList.add('hidden');
            document.getElementById('workspaceCard').classList.remove('hidden');
            loadMenu979();
        } else {
            localStorage.removeItem('apo_active_menu');
            document.getElementById('workspaceCard').classList.add('hidden');
            document.getElementById('mainMenuCard').classList.remove('hidden');
        }

        sessionStorage.setItem('apo_is_refreshed', 'true');
    } else {
        isSessionValid = false;
        updateAuthButtonState(false);
        showLoginScreen();
    }
};

// Menangkap tombol "Back" fisik di HP / Browser agar kembali ke Menu Utama
window.onpopstate = function(event) {
    let workspaceCard = document.getElementById('workspaceCard');
    let mainMenuCard = document.getElementById('mainMenuCard');

    if (workspaceCard && !workspaceCard.classList.contains('hidden')) {
        localStorage.removeItem('apo_active_menu');
        workspaceCard.classList.add('hidden');
        if (mainMenuCard) mainMenuCard.classList.remove('hidden');
    }
};

// Fungsi Global Layar Penuh (Fullscreen)
function toggleFullScreen() {
    let elem = document.documentElement;
    let fsBtn = document.getElementById('fsToggleBtn');

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        if (fsBtn) fsBtn.innerText = "🗗";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        if (fsBtn) fsBtn.innerText = "⛶";
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        document.querySelector('.theme-toggle-btn').innerText = '☀️';
        localStorage.setItem('apo_theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle-btn').innerText = '🌙';
        localStorage.setItem('apo_theme', 'dark');
    }
}

function updateAuthButtonState(isValid) {
    let authBtn = document.getElementById('authBtn');
    if (isValid) {
        authBtn.innerText = "Keluar";
        authBtn.className = "auth-action-btn logout-color";
    } else {
        authBtn.innerText = "Login";
        authBtn.className = "auth-action-btn login-color";
    }
}

function handleAuthAction() {
    if (isSessionValid) {
        logout();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    localStorage.removeItem('apo_active_menu');
    document.getElementById('sessionModal').classList.add('hidden');
    document.getElementById('workspaceCard').classList.add('hidden');
    document.getElementById('mainMenuCard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
}

function lewatiLogin() {
    localStorage.setItem('apo_skipped', 'true');
    localStorage.removeItem('apo_token');
    localStorage.removeItem('apo_nik');
    localStorage.removeItem('apo_name');
    localStorage.removeItem('apo_store');
    isSessionValid = false;
    
    document.getElementById('userNameText').innerText = "Mode Tamu (Tanpa Login)";
    document.getElementById('storeNameText').innerText = "Sinkronisasi Server: 0 (Null)";
    
    updateAuthButtonState(false);

    document.getElementById('sessionModal').classList.add('hidden');
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('workspaceCard').classList.add('hidden');
    document.getElementById('mainMenuCard').classList.remove('hidden');
}

async function prosesLogin() {
    let nik = document.getElementById('nik').value.trim();
    let pin = document.getElementById('pin').value;
    let otp = document.getElementById('otp').value;
    let status = document.getElementById('statusLogin');

    if(!nik || !pin || !otp) {
        alert('Semua kolom harus diisi!');
        return;
    }

    status.innerText = "Menghubungi server...";

    try {
        let response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nik, pin, otp })
        });

        let result = await response.json();

        if(response.ok && result.success) {
            tokenGlobal = result.token;
            currentNik = nik;
            let employeeName = result.employeeName || "Karyawan Alfamart";
            let storeName = result.storeName || "Toko Alfamart";
            
            localStorage.setItem('apo_token', tokenGlobal);
            localStorage.setItem('apo_nik', currentNik);
            localStorage.setItem('apo_name', employeeName);
            localStorage.setItem('apo_store', storeName);
            localStorage.removeItem('apo_skipped');

            isSessionValid = true;
            updateAuthButtonState(true);

            document.getElementById('userNameText').innerText = employeeName;
            document.getElementById('storeNameText').innerText = storeName;

            document.getElementById('sessionModal').classList.add('hidden');
            document.getElementById('loginCard').classList.add('hidden');
            document.getElementById('workspaceCard').classList.add('hidden');
            document.getElementById('mainMenuCard').classList.remove('hidden');
        } else {
            status.innerText = "Gagal: " + (result.message || "Autentikasi ditolak");
        }
    } catch (error) {
        status.innerText = "Terjadi kesalahan jaringan.";
        console.error(error);
    }
}

function pilihMenu(jenis) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken && !isSkipped) {
        isSessionValid = false;
        updateAuthButtonState(false);
        document.getElementById('sessionModal').classList.remove('hidden');
        return;
    }

    menuAktif = jenis;
    localStorage.setItem('apo_active_menu', jenis);
    history.pushState({ menu: jenis }, "", "#" + jenis);

    document.getElementById('mainMenuCard').classList.add('hidden');
    document.getElementById('workspaceCard').classList.remove('hidden');

    let judul = "";
    if (jenis === '979') {
        judul = "Menu Rak 979 (Stock Opname)";
        if (typeof loadMenu979 === 'function') {
            loadMenu979();
        }
    } else if (jenis === 'partial') {
        judul = "SO Reguler / Partial";
        bukaAreaSO();
    } else if (jenis === 'bebas') {
        judul = "Rak Bebas / Customize";
        bukaAreaSO();
    } else if (jenis === 'admin') {
        let passwordAdmin = prompt("Masukkan PIN/Sandi khusus Admin:");
        if (passwordAdmin === "admin123") {
            judul = "Tambah Item Inventory (Admin)";
            bukaAreaAdmin();
        } else {
            alert("Akses ditolak! Sandi admin salah.");
            kembaliKeMenu();
            return;
        }
    }
    document.getElementById('judulMenuAktif').innerText = judul;
}

function tutupModalLogin() {
    document.getElementById('sessionModal').classList.add('hidden');
    showLoginScreen();
}

function tutupModalDanLanjutkan() {
    document.getElementById('sessionModal').classList.add('hidden');
    lewatiLogin();
}

function bukaAreaSO() {
    document.getElementById('soFormArea').classList.remove('hidden');
    document.getElementById('adminFormArea').classList.add('hidden');
}

function bukaAreaAdmin() {
    document.getElementById('soFormArea').classList.add('hidden');
    document.getElementById('adminFormArea').classList.remove('hidden');
}

function kembaliKeMenu() {
    localStorage.removeItem('apo_active_menu');
    sessionStorage.removeItem('apo_is_refreshed');

    let workspaceCard = document.getElementById('workspaceCard');
    if (workspaceCard) workspaceCard.classList.add('hidden');

    let sessionModal = document.getElementById('sessionModal');
    if (sessionModal) sessionModal.classList.add('hidden');

    let mainMenuCard = document.getElementById('mainMenuCard');
    if (mainMenuCard) {
        mainMenuCard.classList.remove('hidden');
        history.pushState("", document.title, window.location.pathname);
    } else {
        window.location.href = window.location.pathname;
    }
}

function logout() {
    localStorage.removeItem('apo_token');
    localStorage.removeItem('apo_nik');
    localStorage.removeItem('apo_name');
    localStorage.removeItem('apo_store');
    localStorage.removeItem('apo_skipped');
    localStorage.removeItem('apo_active_menu');
    
    tokenGlobal = "";
    currentNik = "";
    isSessionValid = false;
    
    updateAuthButtonState(false);
    showLoginScreen();
}

// ==========================================
// FUNGSI UNIVERSAL EKSPOR EXCEL & PDF/CETAK
// ==========================================
function exportUniversalReport(judulLaporan, dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return alert('Belum ada data untuk diunduh atau dicetak!');
    }

    let pilihan = confirm(`Unduh Laporan [${judulLaporan}]?\n\n[OK] = Download Excel (.xlsx)\n[Cancel] = Cetak / Simpan ke PDF`);

    if (pilihan) {
        downloadExcelCustomGlobal(judulLaporan, dataArray);
    } else {
        cetakPDFGlobal(judulLaporan, dataArray);
    }
}

async function downloadExcelCustomGlobal(judul, dataArray) {
    // Pastikan pustaka xlsx-js-style termuat untuk mendukung warna, border, dan alignment
    if (!window.XLSX || !window.XLSX.write_file) {
        if (!document.getElementById('xlsxStyleScript')) {
            let script = document.createElement('script');
            script.id = 'xlsxStyleScript';
            script.src = "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.full.min.js";
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }
    }

    let todayStr = "Tanggal: " + new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let totalQty = dataArray.reduce((sum, item) => sum + (parseInt(item.qty || item.QTY || 0)), 0);
    let totalOh = dataArray.reduce((sum, item) => sum + (parseInt(item.oh || item.OH || 0)), 0);
    let totalSelisih = dataArray.reduce((sum, item) => sum + (parseInt(item.selisih || item.Selisih || 0)), 0);

    let wb = XLSX.utils.book_new();
    let ws = {};

    // 1. Desain Judul & Tanggal (Baris 1 & 2)
    ws['A1'] = { v: judul, s: { font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "059669" } }, alignment: { horizontal: "center", vertical: "center" } } };
    ws['A2'] = { v: todayStr, s: { font: { italic: true, sz: 10, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "D1FAE5" } }, alignment: { horizontal: "left", vertical: "center" } } };

    // Merge baris judul dari kolom A sampai G
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
    ];

    // 2. Header Kolom (Baris 4)
    let headers = ["No.", "PLU", "Barcode", "Nama Item", "QTY Fisik", "OH (On Hand)", "Selisih"];
    headers.forEach((h, colIdx) => {
        let cellRef = XLSX.utils.encode_cell({ r: 3, c: colIdx });
        ws[cellRef] = {
            v: h,
            s: {
                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                fill: { fgColor: { rgb: "059669" } }, // Hijau Alfamart/Operational
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            }
        };
    });

    // 3. Masukkan Data Item (Baris 5 dan seterusnya)
    let currentRow = 4; // Indeks baris mulai dari 4 (baris ke-5 di Excel)
    dataArray.forEach((item, index) => {
        let no = item.no || (index + 1);
        let plu = item.plu || item.PLU || "-";
        let barcode = item.barcode || item.Barcode || "-";
        let nama = item.namaItem || item.Nama_Item || item.nama || "-";
        let qty = item.qty ?? item.QTY ?? 0;
        let oh = item.oh ?? item.OH ?? 0;
        let selisih = item.selisih ?? item.Selisih ?? 0;

        let rowData = [
            { v: no, align: "center" },
            { v: plu, align: "right" },
            { v: barcode, align: "right" },
            { v: nama, align: "left" },
            { v: qty, align: "center" },
            { v: oh, align: "center" },
            { v: selisih, align: "center", bold: true, color: selisih !== 0 ? "DC2626" : "000000" }
        ];

        rowData.forEach((cellInfo, colIdx) => {
            let cellRef = XLSX.utils.encode_cell({ r: currentRow, c: colIdx });
            ws[cellRef] = {
                v: cellInfo.v,
                s: {
                    font: { bold: cellInfo.bold || false, color: { rgb: cellInfo.color || "000000" }, sz: 10 },
                    alignment: { horizontal: cellInfo.align, vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "D1D5DB" } },
                        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
                        left: { style: "thin", color: { rgb: "D1D5DB" } },
                        right: { style: "thin", color: { rgb: "D1D5DB" } }
                    }
                }
            };
        });
        currentRow++;
    });

    // 4. Baris Total Keseluruhan di Bagian Bawah
    let totalRowIdx = currentRow;
    let totalCells = [
        { v: "TOTAL KESELURUHAN", span: 4, align: "right" },
        { v: totalQty, align: "center" },
        { v: totalOh, align: "center" },
        { v: totalSelisih, align: "center" }
    ];

    // Gabungkan kolom A sampai D untuk teks "TOTAL KESELURUHAN"
    ws['!merges'].push({ s: { r: totalRowIdx, c: 0 }, e: { r: totalRowIdx, c: 3 } });

    let colTracker = 0;
    totalCells.forEach((tc, idx) => {
        let cellRef = XLSX.utils.encode_cell({ r: totalRowIdx, c: colTracker });
        ws[cellRef] = {
            v: tc.v,
            s: {
                font: { bold: true, color: { rgb: "000000" }, sz: 11 },
                fill: { fgColor: { rgb: "FDE047" } }, // Kuning keemasan total
                alignment: { horizontal: tc.align, vertical: "center" },
                border: {
                    top: { style: "medium", color: { rgb: "000000" } },
                    bottom: { style: "medium", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            }
        };
        colTracker += (tc.span || 1);
    });

    // Isi sel kosong yang terkena merge total agar border kuningnya rapi
    for (let c = 1; c <= 3; c++) {
        let emptyRef = XLSX.utils.encode_cell({ r: totalRowIdx, c: c });
        ws[emptyRef] = {
            v: "",
            s: {
                border: {
                    top: { style: "medium", color: { rgb: "000000" } },
                    bottom: { style: "medium", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                fill: { fgColor: { rgb: "FDE047" } }
            }
        };
    }

    // Set rentang tabel worksheet
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRowIdx, c: 6 } });

    // Atur Lebar Kolom Agar Proporsional dan Tidak Terpotong
    ws['!cols'] = [
        { wch: 6 },   // No
        { wch: 12 },  // PLU
        { wch: 16 },  // Barcode
        { wch: 38 },  // Nama Item
        { wch: 12 },  // QTY Fisik
        { wch: 12 },  // OH
        { wch: 10 }   // Selisih
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Rak_979");
    XLSX.writeFile(wb, judul.replace(/[^a-zA-Z0-9]/g, "_") + ".xlsx");
}


function cetakPDFGlobal(judul, dataArray) {
    let todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    let totalQty = dataArray.reduce((sum, item) => sum + (parseInt(item.qty || item.QTY || 0)), 0);
    let totalOh = dataArray.reduce((sum, item) => sum + (parseInt(item.oh || item.OH || 0)), 0);
    let totalSelisih = dataArray.reduce((sum, item) => sum + (parseInt(item.selisih || item.Selisih || 0)), 0);

    let htmlContent = `
        <html>
        <head>
            <title>${judul}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
                h2 { margin-bottom: 2px; }
                p { margin-top: 0; color: #555; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
                th { background-color: #059669; color: white; text-align: center; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .total-row { font-weight: bold; background-color: #f3f4f6; }
            </style>
        </head>
        <body>
            <h2>${judul}</h2>
            <p>Tanggal: ${todayStr}</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No.</th>
                        <th>PLU</th>
                        <th>Barcode</th>
                        <th>Nama Item</th>
                        <th style="width: 70px;">QTY Fisik</th>
                        <th style="width: 70px;">OH</th>
                        <th style="width: 70px;">Selisih</th>
                    </tr>
                </thead>
                <tbody>
    `;

    dataArray.forEach((item, index) => {
        let no = item.no || (index + 1);
        let plu = item.plu || item.PLU || "-";
        let barcode = item.barcode || item.Barcode || "-";
        let nama = item.namaItem || item.Nama_Item || item.nama || "-";
        let qty = item.qty ?? item.QTY ?? 0;
        let oh = item.oh ?? item.OH ?? 0;
        let selisih = item.selisih ?? item.Selisih ?? 0;

        htmlContent += `
            <tr>
                <td class="text-center">${no}</td>
                <td><b>${plu}</b></td>
                <td>${barcode}</td>
                <td>${nama}</td>
                <td class="text-center">${qty}</td>
                <td class="text-center">${oh}</td>
                <td class="text-center" style="${selisih !== 0 ? 'color: red; font-weight: bold;' : ''}">${selisih}</td>
            </tr>
        `;
    });

    htmlContent += `
                <tr class="total-row">
                    <td colspan="4" class="text-right">TOTAL KESELURUHAN:</td>
                    <td class="text-center">${totalQty}</td>
                    <td class="text-center">${totalOh}</td>
                    <td class="text-center">${totalSelisih}</td>
                </tr>
                </tbody>
            </table>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    let win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
}
