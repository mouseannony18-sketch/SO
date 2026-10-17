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
        
        let userNameEl = document.getElementById('userNameText');
        let storeNameEl = document.getElementById('storeNameText');
        if (userNameEl) userNameEl.innerText = savedName || (isSkipped ? "Mode Tamu (Tanpa Login)" : "Karyawan Alfamart");
        if (storeNameEl) storeNameEl.innerText = savedStore || "Toko Alfamart";

        updateAuthButtonState(isSessionValid);

        let loginCard = document.getElementById('loginCard');
        let sessionModal = document.getElementById('sessionModal');
        let workspaceCard = document.getElementById('workspaceCard');
        let mainMenuCard = document.getElementById('mainMenuCard');

        if (loginCard) loginCard.classList.add('hidden');
        if (sessionModal) sessionModal.classList.add('hidden');

        if (isPageRefreshed && activeMenu === '979' && typeof loadMenu979 === 'function') {
            if (mainMenuCard) mainMenuCard.classList.add('hidden');
            if (workspaceCard) workspaceCard.classList.remove('hidden');
            loadMenu979();
        } else {
            localStorage.removeItem('apo_active_menu');
            if (workspaceCard) workspaceCard.classList.add('hidden');
            if (mainMenuCard) mainMenuCard.classList.remove('hidden');
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
    let sessionModal = document.getElementById('sessionModal');
    let workspaceCard = document.getElementById('workspaceCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let loginCard = document.getElementById('loginCard');

    if (sessionModal) sessionModal.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.add('hidden');
    if (mainMenuCard) mainMenuCard.classList.add('hidden');
    if (loginCard) loginCard.classList.remove('hidden');
}

function lewatiLogin() {
    localStorage.setItem('apo_skipped', 'true');
    localStorage.removeItem('apo_token');
    localStorage.removeItem('apo_nik');
    localStorage.removeItem('apo_name');
    localStorage.removeItem('apo_store');
    isSessionValid = false;
    
    let userNameEl = document.getElementById('userNameText');
    let storeNameEl = document.getElementById('storeNameText');
    if (userNameEl) userNameEl.innerText = "Mode Tamu (Tanpa Login)";
    if (storeNameEl) storeNameEl.innerText = "Toko Alfamart";
    
    updateAuthButtonState(false);

    let sessionModal = document.getElementById('sessionModal');
    let loginCard = document.getElementById('loginCard');
    let workspaceCard = document.getElementById('workspaceCard');
    let mainMenuCard = document.getElementById('mainMenuCard');

    if (sessionModal) sessionModal.classList.add('hidden');
    if (loginCard) loginCard.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.add('hidden');
    if (mainMenuCard) mainMenuCard.classList.remove('hidden');
}

async function prosesLogin() {
    let nik = document.getElementById('nik').value.trim();
    let pin = document.getElementById('pin').value;
    let otp = document.getElementById('otp').value;
    let status = document.getElementById('statusLogin');

    if(!nik || !pin || !otp) {
        if (status) status.innerText = "Semua kolom harus diisi!";
        return;
    }

    if (status) status.innerText = "Menghubungi server...";

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

            let userNameEl = document.getElementById('userNameText');
            let storeNameEl = document.getElementById('storeNameText');
            if (userNameEl) userNameEl.innerText = employeeName;
            if (storeNameEl) storeNameEl.innerText = storeName;

            let sessionModal = document.getElementById('sessionModal');
            let loginCard = document.getElementById('loginCard');
            let workspaceCard = document.getElementById('workspaceCard');
            let mainMenuCard = document.getElementById('mainMenuCard');

            if (sessionModal) sessionModal.classList.add('hidden');
            if (loginCard) loginCard.classList.add('hidden');
            if (workspaceCard) workspaceCard.classList.add('hidden');
            if (mainMenuCard) mainMenuCard.classList.remove('hidden');
        } else {
            if (status) status.innerText = "Gagal: " + (result.message || "Autentikasi ditolak");
        }
    } catch (error) {
        if (status) status.innerText = "Terjadi kesalahan jaringan.";
        console.error(error);
    }
}

function pilihMenu(jenis) {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (!savedToken && !isSkipped) {
        isSessionValid = false;
        updateAuthButtonState(false);
        let sessionModal = document.getElementById('sessionModal');
        if (sessionModal) sessionModal.classList.remove('hidden');
        return;
    }

    menuAktif = jenis;
    localStorage.setItem('apo_active_menu', jenis);
    history.pushState({ menu: jenis }, "", "#" + jenis);

    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');

    if (mainMenuCard) mainMenuCard.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.remove('hidden');

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
    let sessionModal = document.getElementById('sessionModal');
    if (sessionModal) sessionModal.classList.add('hidden');
    showLoginScreen();
}

function tutupModalDanLanjutkan() {
    let sessionModal = document.getElementById('sessionModal');
    if (sessionModal) sessionModal.classList.add('hidden');
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
// FUNGSI UNIVERSAL EKSPOR EXCEL (.xlsx) & PDF DENGAN STYLING
// =========================================================
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
    try {
        let XLSXLib = window.XLSX;
        if (!XLSXLib) {
            alert("Pustaka Excel belum siap. Silakan muat ulang halaman.");
            return;
        }

        let todayStr = "Tanggal: " + new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        let ws_data = [
            [judul],
            [todayStr],
            [],
            ["No.", "PLU", "Barcode", "Nama Item", "QTY Fisik", "OH", "Selisih"]
        ];

        let totalQty = 0;
        let totalOh = 0;
        let totalSelisih = 0;

        dataArray.forEach((item, index) => {
            let no = item.no || (index + 1);
            let plu = item.plu || item.PLU || "-";
            let barcode = item.barcode || item.Barcode || "-";
            let nama = item.namaItem || item.Nama_Item || item.nama || "-";
            let qty = parseInt(item.qty ?? item.QTY ?? 0);
            let oh = parseInt(item.oh ?? item.OH ?? 0);
            let selisih = parseInt(item.selisih ?? item.Selisih ?? 0);

            totalQty += qty;
            totalOh += oh;
            totalSelisih += selisih;

            ws_data.push([no, plu, barcode, nama, qty, oh, selisih]);
        });

        ws_data.push(["TOTAL KESELURUHAN:", "", "", "", totalQty, totalOh, totalSelisih]);

        let ws = XLSXLib.utils.aoa_to_sheet(ws_data);

        let totalRowIdx = ws_data.length - 1;
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Judul Utama
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Tanggal
            { s: { r: totalRowIdx, c: 0 }, e: { r: totalRowIdx, c: 3 } } // Total Keseluruhan
        ];

        let wb = XLSXLib.utils.book_new();
        XLSXLib.utils.book_append_sheet(wb, ws, "Rak_979");

        let fileName = (judul ? judul.replace(/[^a-zA-Z0-9]/g, "_") : "Laporan_SO") + ".xlsx";
        XLSXLib.writeFile(wb, fileName);

    } catch (err) {
        console.error("Gagal export Excel:", err);
        alert("Terjadi kesalahan saat mengunduh Excel: " + err.message);
    }
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

// Fungsi dummy pendukung form SO Reguler & Admin
function tambahData() {
    alert("Fitur SO Reguler aktif.");
}
function simpanItemAdmin() {
    alert("Item admin disimpan.");
}
