// =========================================================
// SCRIPT NAVIGASI & FITUR UTAMA (script.js)
// =========================================================

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
// NAVIGASI MENU OPERASIONAL
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
        // Menu Rak Bebas / Customize tetap seperti semula
        if (typeof loadMenuRakBebas === 'function') loadMenuRakBebas();
    } else if (menuType === 'partial') {
        let soArea = document.getElementById('soFormArea');
        if (soArea) soArea.classList.remove('hidden');
        setupWorkspaceHeader("SO Reguler / Partial", "Input manual & pemindaian", true);
    } else if (menuType === 'admin') {
        // Menu Admin Inventory digantikan dengan SO Rak Bebas by GS
        if (typeof loadMenuRakBebasGs === 'function') loadMenuRakBebasGs();
    }
}

function kembaliKeMenu() {
    tutupDropdownOtomatis();
    let workspaceCard = document.getElementById('workspaceCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let menu979Container = document.getElementById('menu979Container');
    let menuBebasContainer = document.getElementById('menuBebasContainer');
    let menuBebasGsContainer = document.getElementById('menuBebasGsContainer'); // Kontainer GS
    let soFormArea = document.getElementById('soFormArea');
    let adminFormArea = document.getElementById('adminFormArea');

    if (workspaceCard) workspaceCard.classList.add('hidden');
    if (mainMenuCard) mainMenuCard.classList.remove('hidden');
    if (menu979Container) menu979Container.classList.add('hidden');
    if (menuBebasContainer) menuBebasContainer.classList.add('hidden');
    if (menuBebasGsContainer) menuBebasGsContainer.classList.add('hidden'); // Sembunyikan GS
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
    // Memanggil fungsi logout yang ada di auth.js
    if (typeof logout === 'function') {
        logout();
    }
}

// =========================================================
// TOGGLE THEME & FULLSCREEN
// =========================================================
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
