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

function downloadExcelCustomGlobal(judul, dataArray) {
    let todayStr = "Tanggal: " + new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let totalQty = dataArray.reduce((sum, item) => sum + (parseInt(item.qty || item.QTY || 0)), 0);
    let totalOh = dataArray.reduce((sum, item) => sum + (parseInt(item.oh || item.OH || 0)), 0);
    let totalSelisih = dataArray.reduce((sum, item) => sum + (parseInt(item.selisih || item.Selisih || 0)), 0);

    // Membuat dokumen berbasis HTML yang didukung penuh oleh Excel / Google Sheets untuk styling warna & border
    let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
                th, td { border: 0.5pt solid #9ca3af; padding: 6px 8px; font-size: 11pt; }
                .title { background-color: #059669; color: #ffffff; font-weight: bold; font-size: 14pt; text-align: center; vertical-align: middle; height: 35px; }
                .subtitle { background-color: #D1FAE5; color: #065f46; font-style: italic; font-size: 10pt; height: 22px; vertical-align: middle; }
                .header-th { background-color: #059669; color: #ffffff; font-weight: bold; text-align: center; vertical-align: middle; height: 28px; }
                .total-tr { background-color: #FDE047; font-weight: bold; border-top: 1.5pt solid #000; border-bottom: 1.5pt solid #000; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .text-red { color: #dc2626; font-weight: bold; }
            </style>
        </head>
        <body>
            <table>
                <tr>
                    <td colspan="7" class="title">${judul}</td>
                </tr>
                <tr>
                    <td colspan="7" class="subtitle">${todayStr}</td>
                </tr>
                <tr><td colspan="7" style="border:none; height:10px;"></td></tr>
                <tr>
                    <th class="header-th" style="width: 40px;">No.</th>
                    <th class="header-th" style="width: 90px;">PLU</th>
                    <th class="header-th" style="width: 130px;">Barcode</th>
                    <th class="header-th" style="width: 280px;">Nama Item</th>
                    <th class="header-th" style="width: 90px;">QTY Fisik</th>
                    <th class="header-th" style="width: 90px;">OH</th>
                    <th class="header-th" style="width: 80px;">Selisih</th>
                </tr>
    `;

    dataArray.forEach((item, index) => {
        let no = item.no || (index + 1);
        let plu = item.plu || item.PLU || "-";
        let barcode = item.barcode || item.Barcode || "-";
        let nama = item.namaItem || item.Nama_Item || item.nama || "-";
        let qty = item.qty ?? item.QTY ?? 0;
        let oh = item.oh ?? item.OH ?? 0;
        let selisih = item.selisih ?? item.Selisih ?? 0;

        let selisihStyle = selisih !== 0 ? 'text-red' : '';

        htmlContent += `
                <tr>
                    <td class="text-center">${no}</td>
                    <td class="text-right">${plu}</td>
                    <td class="text-right">${barcode}</td>
                    <td class="text-left">${nama}</td>
                    <td class="text-center">${qty}</td>
                    <td class="text-center">${oh}</td>
                    <td class="text-center ${selisihStyle}">${selisih}</td>
                </tr>
        `;
    });

    htmlContent += `
                <tr class="total-tr">
                    <td colspan="4" class="text-right">TOTAL KESELURUHAN:</td>
                    <td class="text-center">${totalQty}</td>
                    <td class="text-center">${totalOh}</td>
                    <td class="text-center">${totalSelisih}</td>
                </tr>
            </table>
        </body>
        </html>
    `;

    // Mengunduh file sebagai format spreadsheet (.xls / .xlsx) yang langsung dikenali styling-nya
    let blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = judul.replace(/[^a-zA-Z0-9]/g, "_") + ".xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
