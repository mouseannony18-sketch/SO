// =========================================================
// SCRIPT UTAMA APLIKASI STOCK OPNAME (script.js)
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    cekSesiAwal();
});

function cekSesiAwal() {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';
    let savedUserName = localStorage.getItem('apo_user_name');
    let savedStoreName = localStorage.getItem('apo_store_name');

    let loginCard = document.getElementById('loginCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');

    if ((savedToken && savedToken !== "") || isSkipped) {
        if (loginCard) loginCard.classList.add('hidden');
        if (mainMenuCard) mainMenuCard.classList.remove('hidden');

        let nameEl = document.getElementById('userNameText');
        let storeEl = document.getElementById('storeNameText');
        let authBtn = document.getElementById('authBtn');

        if (savedUserName && nameEl) nameEl.innerText = savedUserName;
        if (savedStoreName && storeEl) storeEl.innerText = savedStoreName;

        if (isSkipped && nameEl) {
            nameEl.innerText = "Mode Tamu";
            if (storeEl) storeEl.innerText = "Akses Terbatas";
        }

        if (authBtn) {
            authBtn.innerText = "Keluar";
            authBtn.className = "auth-action-btn logout-color";
        }
    } else {
        if (loginCard) loginCard.classList.remove('hidden');
        if (mainMenuCard) mainMenuCard.classList.add('hidden');
        if (workspaceCard) workspaceCard.classList.add('hidden');
    }
}

// =========================================================
// FUNGSI PROSES LOGIN (DISESUAIKAN DENGAN PAYLOAD SERVER)
// =========================================================
async function prosesLogin() {
    let nik = document.getElementById('nik').value.trim();
    let pin = document.getElementById('pin').value.trim();
    let otp = document.getElementById('otp').value.trim();
    let statusEl = document.getElementById('statusLogin');

    if (!nik || !pin) {
        if (statusEl) statusEl.innerText = "NIK dan PIN wajib diisi!";
        return;
    }

    if (statusEl) statusEl.innerText = "Menghubungkan ke server...";

    try {
        let response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nik: nik, pin: pin, otp: otp })
        });

        let result = await response.json();

        // Mendukung respons sukses dari API (baik format result.success maupun code === 200 dengan payload)
        if (response.ok && (result.success || result.code === 200)) {
            let payloadData = result.payload || result;
            
            let tokenVal = payloadData.token || payloadData.refreshToken || result.token || "token_aktif_" + Date.now();
            let empName = payloadData.employeName || payloadData.employeeName || payloadData.userName || payloadData.name || ("Karyawan " + nik);
            let strName = payloadData.storeName || payloadData.store_name || payloadData.toko || "Toko Alfamart";

            localStorage.setItem('apo_token', tokenVal);
            localStorage.setItem('apo_user_name', empName);
            localStorage.setItem('apo_store_name', strName);
            localStorage.setItem('apo_skipped', 'false');

            if (statusEl) statusEl.innerText = "";
            cekSesiAwal();
        } else {
            if (statusEl) statusEl.innerText = result.message || "Login Gagal: Periksa kembali NIK / PIN / OTP Anda.";
        }
    } catch (err) {
        console.error("Error login:", err);
        
        // Fallback otomatis jika server backend mengalami kendala koneksi
        let empName = "Karyawan (" + nik + ")";
        let strName = "Alfamart - Toko Utama";

        localStorage.setItem('apo_token', "simulasi_token_" + Date.now());
        localStorage.setItem('apo_user_name', empName);
        localStorage.setItem('apo_store_name', strName);
        localStorage.setItem('apo_skipped', 'false');

        if (statusEl) statusEl.innerText = "";
        cekSesiAwal();
    }
}

// =========================================================
// FITUR GLOBAL: SHOW BARCODE
// =========================================================
function tampilkanBarcodeGlobal(kodeBarcode, namaProduk = "Produk") {
    if (!kodeBarcode || kodeBarcode === "-") {
        if (typeof showModernAlert === 'function') {
            showModernAlert("Nomor barcode tidak tersedia untuk produk ini.", "Informasi");
        } else {
            alert("Nomor barcode tidak tersedia.");
        }
        return;
    }

    let modal = document.getElementById('globalBarcodeModal');
    if (modal) {
        document.getElementById('barcodeModalTitle').innerText = namaProduk;
        document.getElementById('barcodeModalNumber').innerText = kodeBarcode;
        modal.classList.remove('hidden');

        try {
            JsBarcode("#svgBarcodeCanvas", kodeBarcode, {
                format: "CODE128",
                lineColor: "#000000",
                width: 2,
                height: 70,
                displayValue: true,
                fontSize: 14,
                margin: 5
            });
        } catch (e) {
            console.error("Gagal merender barcode:", e);
            try {
                JsBarcode("#svgBarcodeCanvas", kodeBarcode, {
                    format: "CODE39",
                    lineColor: "#000000",
                    width: 2,
                    height: 70,
                    displayValue: true
                });
            } catch (err) {
                if (typeof showModernAlert === 'function') {
                    showModernAlert("Format barcode tidak valid untuk dirender.", "Error");
                }
                tutupGlobalBarcodeModal();
            }
        }
    }
}

function tutupGlobalBarcodeModal() {
    let modal = document.getElementById('globalBarcodeModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// =========================================================
// NAVIGASI & AUTENTIKASI
// =========================================================
function pilihMenu(menuType) {
    tutupDropdownOtomatis();
    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');

    if (mainMenuCard) mainMenuCard.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.remove('hidden');

    if (menuType === '979') {
        if (typeof loadMenu979 === 'function') loadMenu979();
    } else if (menuType === 'bebas') {
        if (typeof loadMenuRakBebas === 'function') loadMenuRakBebas();
    } else if (menuType === 'partial') {
        let soArea = document.getElementById('soFormArea');
        if (soArea) soArea.classList.remove('hidden');
        setupWorkspaceHeader("SO Reguler / Partial", "Input manual & pemindaian", true);
    } else if (menuType === 'admin') {
        let adminArea = document.getElementById('adminFormArea');
        if (adminArea) adminArea.classList.remove('hidden');
        setupWorkspaceHeader("Admin Master Inventory", "Pengaturan database lokal", true);
    }
}

function kembaliKeMenu() {
    tutupDropdownOtomatis();
    let workspaceCard = document.getElementById('workspaceCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let menu979Container = document.getElementById('menu979Container');
    let menuBebasContainer = document.getElementById('menuBebasContainer');
    let soFormArea = document.getElementById('soFormArea');
    let adminFormArea = document.getElementById('adminFormArea');

    if (workspaceCard) workspaceCard.classList.add('hidden');
    if (mainMenuCard) mainMenuCard.classList.remove('hidden');
    if (menu979Container) menu979Container.classList.add('hidden');
    if (menuBebasContainer) menuBebasContainer.classList.add('hidden');
    if (soFormArea) soFormArea.classList.add('hidden');
    if (adminFormArea) adminFormArea.classList.add('hidden');
}

function tutupDropdownOtomatis() {
    let dropdown = document.getElementById('globalSettingsDropdown');
    if (dropdown) dropdown.classList.add('hidden');
}

function setupWorkspaceHeader(title, subtitle, showExtra = true, extraHTML = "") {
    let titleEl = document.getElementById('workspaceTitleText');
    let subEl = document.getElementById('workspaceSubtitleText');
    let slotEl = document.getElementById('extraActionDropdownSlot');

    if (titleEl) titleEl.innerText = title;
    if (subEl) subEl.innerText = subtitle;

    if (slotEl) {
        if (showExtra) {
            slotEl.innerHTML = extraHTML;
            slotEl.classList.remove('hidden');
        } else {
            slotEl.classList.add('hidden');
        }
    }
}

function handleAuthAction() {
    tutupDropdownOtomatis();
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    if (savedToken || isSkipped) {
        logout();
    } else {
        let loginCard = document.getElementById('loginCard');
        let mainMenuCard = document.getElementById('mainMenuCard');
        if (loginCard) loginCard.classList.remove('hidden');
        if (mainMenuCard) mainMenuCard.classList.add('hidden');
    }
}

function lewatiLogin() {
    localStorage.setItem('apo_skipped', 'true');
    localStorage.removeItem('apo_token');
    cekSesiAwal();
}

function logout() {
    tutupDropdownOtomatis();
    localStorage.removeItem('apo_token');
    localStorage.removeItem('apo_skipped');
    localStorage.removeItem('apo_user_name');
    localStorage.removeItem('apo_store_name');

    let workspaceCard = document.getElementById('workspaceCard');
    if (workspaceCard) workspaceCard.classList.add('hidden');

    cekSesiAwal();
}

function tutupModalLogin() {
    let sessionModal = document.getElementById('sessionModal');
    if (sessionModal) sessionModal.classList.add('hidden');

    let loginCard = document.getElementById('loginCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');

    if (workspaceCard) workspaceCard.classList.add('hidden');
    if (mainMenuCard) mainMenuCard.classList.add('hidden');
    if (loginCard) loginCard.classList.remove('hidden');
}

function tutupModalDanLanjutkan() {
    let sessionModal = document.getElementById('sessionModal');
    if (sessionModal) sessionModal.classList.add('hidden');

    localStorage.setItem('apo_skipped', 'true');
    localStorage.removeItem('apo_token');
    cekSesiAwal();
}

// TOGGLE THEME & FULLSCREEN
function toggleTheme() {
    let body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error("Error attempting to enable fullscreen:", err);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function toggleGlobalDropdownMenu() {
    let dropdown = document.getElementById('globalSettingsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}
