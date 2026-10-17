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
        let themeBtn = document.querySelector('.theme-toggle-btn');
        if (themeBtn) themeBtn.innerText = '☀️';
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
    let themeBtn = document.querySelector('.theme-toggle-btn');
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        if (themeBtn) themeBtn.innerText = '☀️';
        localStorage.setItem('apo_theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        if (themeBtn) themeBtn.innerText = '🌙';
        localStorage.setItem('apo_theme', 'dark');
    }
}

function updateAuthButtonState(isValid) {
    let authBtn = document.getElementById('authBtn');
    if (!authBtn) return;
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
        judul = "Menu Rak 979 (Rawan Hilang)";
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
    let titleEl = document.getElementById('judulMenuAktif');
    if (titleEl) titleEl.innerText = judul;
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
    let soArea = document.getElementById('soFormArea');
    let adminArea = document.getElementById('adminFormArea');
    if (soArea) soArea.classList.remove('hidden');
    if (adminArea) adminArea.classList.add('hidden');
}

function bukaAreaAdmin() {
    let soArea = document.getElementById('soFormArea');
    let adminArea = document.getElementById('adminFormArea');
    if (soArea) soArea.classList.add('hidden');
    if (adminArea) adminArea.classList.remove('hidden');
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

// =========================================================
// FUNGSI UNIVERSAL EKSPOR EXCEL & PDF DENGAN FORMAT TINGKAT LANJUT
// =========================================================
function exportUniversalReport(judulLaporan, dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return alert('Belum ada data untuk diunduh atau dicetak!');
    }

    let pilihan = confirm(`Unduh Laporan [${judulLaporan}]?\n\n[OK] = Download Excel (.xls)\n[Cancel] = Cetak / Simpan ke PDF`);

    if (pilihan) {
        downloadExcelCustomGlobal(judulLaporan, dataArray);
    } else {
        cetakPDFGlobal(judulLaporan, dataArray);
    }
}

function downloadExcelCustomGlobal(judul, dataArray) {
    try {
        let todayStr = "Tanggal: " + new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        let totalQty = dataArray.reduce((sum, item) => sum + (parseInt(item.qty || item.QTY || 0)), 0);
        let totalOh = dataArray.reduce((sum, item) => sum + (parseInt(item.oh || item.OH || 0)), 0);
        let totalSelisih = dataArray.reduce((sum, item) => sum + (parseInt(item.selisih || item.Selisih || 0)), 0);

        let htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .title { font-size: 14px; font-weight: bold; text-align: center; background-color: #059669; color: #ffffff; height: 35px; vertical-align: middle; }
                    .subtitle { font-size: 11px; font-style: italic; background-color: #D1FAE5; color: #065f46; height: 25px; vertical-align: middle; text-align: center; }
                    th { background-color: #059669; color: #ffffff; font-weight: bold; text-align: center; border: 0.5pt solid #000000; padding: 6px; font-size: 11px; }
                    td { border: 0.5pt solid #D1D5DB; padding: 5px; font-size: 10px; vertical-align: middle; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .text-left { text-align: left; }
                    .text-red { color: #DC2626; font-weight: bold; text-align: center; }
                    .total-cell { background-color: #FDE047; font-weight: bold; border: 1pt solid #000000; text-align: center; }
                    .total-label { background-color: #FDE047; font-weight: bold; border: 1pt solid #000000; text-align: right; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td colspan="7" class="title">${escapeHtml(judul)}</td>
                    </tr>
                    <tr>
                        <td colspan="7" class="subtitle">${todayStr}</td>
                    </tr>
                    <tr><td colspan="7"></td></tr>
                    <tr>
                        <th>No.</th>
                        <th>PLU</th>
                        <th>Barcode</th>
                        <th>Nama Item</th>
                        <th>QTY Fisik</th>
                        <th>OH</th>
                        <th>Selisih</th>
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
            let selisihClass = selisih !== 0 ? 'text-red' : 'text-center';

            htmlContent += `
                <tr>
                    <td class="text-center">${no}</td>
                    <td class="text-right">${escapeHtml(String(plu))}</td>
                    <td class="text-right">${escapeHtml(String(barcode))}</td>
                    <td class="text-left">${escapeHtml(String(nama))}</td>
                    <td class="text-center">${qty}</td>
                    <td class="text-center">${oh}</td>
                    <td class="${selisihClass}">${selisih}</td>
                </tr>
            `;
        });

        htmlContent += `
                    <tr>
                        <td colspan="4" class="total-label">TOTAL KESELURUHAN:</td>
                        <td class="total-cell">${totalQty}</td>
                        <td class="total-cell">${totalOh}</td>
                        <td class="total-cell">${totalSelisih}</td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        let bytes = new TextEncoder().encode(htmlContent);
        let binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
        let base64Content = btoa(binString);

        let uri = 'data:application/vnd.ms-excel;base64,';
        let excelFile = uri + base64Content;

        let downloadLink = document.createElement("a");
        downloadLink.href = excelFile;
        downloadLink.download = (judul ? judul.replace(/[^a-zA-Z0-9]/g, "_") : "Laporan_SO") + ".xls";
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

    } catch (err) {
        console.error("Gagal export Excel:", err);
        alert("Terjadi kesalahan saat mengunduh Excel: " + err.message);
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
                body { font-family: Arial, sans-serif; padding: 20px; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                h2 { margin-bottom: 2px; text-align: center; background-color: #059669; color: white; padding: 10px; }
                p { margin-top: 0; color: #333; font-size: 13px; text-align: center; margin-bottom: 15px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                th, td { border: 1px solid #333; padding: 6px 8px; }
                th { background-color: #059669 !important; color: white !important; text-align: center; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .total-row { font-weight: bold; background-color: #FDE047 !important; }
                .text-red { color: #dc2626; font-weight: bold; }
            </style>
        </head>
        <body>
            <h2>${judul}</h2>
            <p>Tanggal: ${todayStr}</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No.</th>
                        <th style="width: 90px;">PLU</th>
                        <th style="width: 120px;">Barcode</th>
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
