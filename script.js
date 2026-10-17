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

window.onpopstate = function(event) {
    let workspaceCard = document.getElementById('workspaceCard');
    let mainMenuCard = document.getElementById('mainMenuCard');

    if (workspaceCard && !workspaceCard.classList.contains('hidden')) {
        localStorage.removeItem('apo_active_menu');
        workspaceCard.classList.add('hidden');
        if (mainMenuCard) mainMenuCard.classList.remove('hidden');
    }
};

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

    if (jenis === '979') {
        if (typeof loadMenu979 === 'function') {
            loadMenu979();
        }
    } else if (jenis === 'partial') {
        setupWorkspaceHeader("SO Reguler / Partial", "Mode input reguler");
        bukaAreaSO();
    } else if (jenis === 'bebas') {
        setupWorkspaceHeader("Rak Bebas / Customize", "Mode input bebas");
        bukaAreaSO();
    } else if (jenis === 'admin') {
        let passwordAdmin = prompt("Masukkan PIN/Sandi khusus Admin:");
        if (passwordAdmin === "admin123") {
            setupWorkspaceHeader("Tambah Item Inventory (Admin)", "Manajemen data master");
            bukaAreaAdmin();
        } else {
            alert("Akses ditolak! Sandi admin salah.");
            kembaliKeMenu();
            return;
        }
    }
}

function setupWorkspaceHeader(judul, subtitle, showSyncButton = false, customActionHTML = "") {
    let titleEl = document.getElementById('workspaceTitleText');
    let subtitleEl = document.getElementById('workspaceSubtitleText');
    let extraSlot = document.getElementById('extraActionDropdownSlot');

    if (titleEl) titleEl.innerText = judul;
    if (subtitleEl) subtitleEl.innerText = subtitle;

    if (extraSlot) {
        let htmlContent = "";
        if (showSyncButton) {
            htmlContent += `<button onclick="if(typeof sinkronisasiStokServer === 'function') sinkronisasiStokServer(true);">🔄 Sync Server</button>`;
        }
        if (typeof exportExcel979 === 'function' && (judul.includes("979") || judul.includes("Rak"))) {
            htmlContent += `<button onclick="exportExcel979()">📥 Download / Cetak</button>`;
        }
        htmlContent += customActionHTML;
        extraSlot.innerHTML = htmlContent;
    }
}

function toggleGlobalDropdownMenu() {
    let dropdown = document.getElementById('globalSettingsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

window.addEventListener('click', function(event) {
    if (!event.target.matches('.settings-box-btn') && !event.target.closest('.settings-box-btn')) {
        let dropdown = document.getElementById('globalSettingsDropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    }
});

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
    let menu979Container = document.getElementById('menu979Container');
    if (soArea) soArea.classList.remove('hidden');
    if (adminArea) adminArea.classList.add('hidden');
    if (menu979Container) menu979Container.classList.add('hidden');
}

function bukaAreaAdmin() {
    let soArea = document.getElementById('soFormArea');
    let adminArea = document.getElementById('adminFormArea');
    let menu979Container = document.getElementById('menu979Container');
    if (soArea) soArea.classList.add('hidden');
    if (adminArea) adminArea.classList.remove('hidden');
    if (menu979Container) menu979Container.classList.add('hidden');
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

function tambahData() {
    alert("Fitur SO Reguler aktif.");
}
function simpanItemAdmin() {
    alert("Item admin disimpan.");
}
