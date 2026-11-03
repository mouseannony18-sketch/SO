// =========================================================
// SCRIPT UTAMA APLIKASI SO RAHIL (script.js)
// =========================================================

// =========================================================
// 1. KAMUS PENDETEKSI MODEL PERANGKAT SPESIFIK DARI USER AGENT
// =========================================================
function parseDeviceName(ua) {
    if (!ua || ua === '-') return "Android Phone";

    if (ua.includes("LM-V600") || ua.includes("LM-V60") || ua.includes("LGV")) return "LG V60 ThinQ";
    if (ua.includes("LM-G900")) return "LG Velvet";
    if (ua.includes("LM-")) return "LG Smartphone";

    if (ua.includes("SM-A546")) return "Samsung Galaxy A54";
    if (ua.includes("SM-A536")) return "Samsung Galaxy A53";
    if (ua.includes("SM-A346")) return "Samsung Galaxy A34";
    if (ua.includes("SM-S918")) return "Samsung S23 Ultra";
    if (ua.includes("SM-S928")) return "Samsung S24 Ultra";
    if (ua.includes("SM-")) {
        const match = ua.match(/SM-[A-Z0-9]+/i);
        return match ? `Samsung (${match[0]})` : "Samsung Galaxy";
    }

    if (ua.includes("Redmi") || ua.includes("POCO") || ua.includes("Mi ") || ua.includes("2201116")) {
        const match = ua.match(/(Redmi[^\s;]+|POCO[^\s;]+|Mi\s[^\s;]+)/i);
        return match ? match[0] : "Xiaomi / Redmi";
    }

    if (ua.includes("CPH") || ua.includes("OPPO")) {
        const match = ua.match(/CPH[0-9]+/i);
        return match ? `OPPO (${match[0]})` : "OPPO Smartphone";
    }

    if (ua.includes("V2") || ua.includes("vivo")) {
        const match = ua.match(/V2[0-9]+/i);
        return match ? `Vivo (${match[0]})` : "Vivo Smartphone";
    }

    if (ua.includes("RMX") || ua.includes("Realme")) {
        const match = ua.match(/RMX[0-9]+/i);
        return match ? `Realme (${match[0]})` : "Realme Smartphone";
    }

    if (ua.includes("Infinix")) return "Infinix Smartphone";
    if (ua.includes("TECNO")) return "Tecno Smartphone";

    if (ua.includes("iPhone")) return "Apple iPhone";
    if (ua.includes("iPad")) return "Apple iPad";
    if (ua.includes("Windows NT")) return "Windows PC";
    if (ua.includes("Macintosh")) return "MacBook / Mac";

    return "Android Phone";
}

// =========================================================
// 2. FITUR PENCATATAN LOG VISITOR OTOMATIS
// =========================================================
async function kirimLogVisitor(namaUser, namaToko) {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwTh0cshA3ao1XVHkFX6T9d-ti9hRYFFYra-y_diHoaxs8VXCRDSN05O07P3KT2l5G8/exec";

    let ua = navigator.userAgent;
    let deviceInfo = parseDeviceName(ua);

    // Coba tingkatkan akurasi via Client Hints modern jika didukung browser
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const uaData = await navigator.userAgentData.getHighEntropyValues(["model"]);
            if (uaData.model) {
                deviceInfo = uaData.model;
                if (deviceInfo === "LM-V600") deviceInfo = "LG V60 ThinQ";
            }
        } catch(e) {}
    }

    let logData = {
        nik: localStorage.getItem('apo_nik') || "Tamu",
        nama: namaUser,
        toko: namaToko,
        deviceInfo: deviceInfo, // Model perangkat spesifik terkirim ke kolom Perangkat
        lat: "-",
        long: "-",
        userAgent: ua
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                logData.lat = position.coords.latitude;
                logData.long = position.coords.longitude;
                kirimDataKeServer(WEB_APP_URL, logData);
            },
            function(error) {
                kirimDataKeServer(WEB_APP_URL, logData);
            },
            { timeout: 5000 }
        );
    } else {
        kirimDataKeServer(WEB_APP_URL, logData);
    }
}

function kirimDataKeServer(url, data) {
    fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).catch(err => console.error("Gagal mengirim log visitor:", err));
}

// =========================================================
// 3. FITUR PANEL ADMIN: LOG VISITOR & PROTEKSI PIN RAHASIA
// =========================================================
const PIN_RAHASIA_ADMIN = "998877"; // PIN default admin (dapat diubah sesuai keinginan)

let counterKlikLogo = 0;
let timerKlikLogo = null;

// Fungsi Klik Rahasia pada Logo Alfamart (1x klik = kembali ke menu, 5x klik cepat = buka modal PIN admin)
function handleLogoClickSecret() {
    counterKlikLogo++;
    if (timerKlikLogo) clearTimeout(timerKlikLogo);
    
    if (counterKlikLogo >= 5) {
        counterKlikLogo = 0;
        bukaModalPinAdmin();
        return;
    }
    
    timerKlikLogo = setTimeout(() => {
        counterKlikLogo = 0;
        if (typeof kembaliKeMenu === 'function') {
            kembaliKeMenu();
        }
    }, 400);
}

function bukaModalPinAdmin() {
    let modal = document.getElementById('pinAdminModal');
    let input = document.getElementById('inputPinAdmin');
    if (modal) {
        if (input) input.value = "";
        modal.classList.remove('hidden');
        if (input) input.focus();
    }
}

function tutupPinAdminModal() {
    let modal = document.getElementById('pinAdminModal');
    if (modal) modal.classList.add('hidden');
}

function verifikasiPinAdmin() {
    let inputPin = document.getElementById('inputPinAdmin').value.trim();
    if (inputPin === PIN_RAHASIA_ADMIN) {
        tutupPinAdminModal();
        bukaAdminLogModal();
    } else {
        alert("PIN Admin Salah!");
    }
}

function bukaAdminLogModal() {
    let modal = document.getElementById('adminLogModal');
    if (modal) {
        modal.classList.remove('hidden');
        muatLogVisitorAdmin();
    }
}

function tutupAdminLogModal() {
    let modal = document.getElementById('adminLogModal');
    if (modal) modal.classList.add('hidden');
}

function muatLogVisitorAdmin() {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwTh0cshA3ao1XVHkFX6T9d-ti9hRYFFYra-y_diHoaxs8VXCRDSN05O07P3KT2l5G8/exec";
    let tbody = document.getElementById('tabelLogBody');
    let totalText = document.getElementById('totalLogText');
    
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Memuat data dari Google Spreadsheet...</td></tr>`;

    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Belum ada data log visitor.</td></tr>`;
                if (totalText) totalText.innerText = "Total: 0 Log Pengunjung";
                return;
            }

            if (totalText) totalText.innerText = `Total: ${data.length} Log Pengunjung`;
            let htmlRows = "";

            // Urutkan dari data terbaru di atas
            data.reverse().forEach(row => {
                let waku = row["Timestamp"] || "-";
                let nik = row["NIK/ID"] || "-";
                let nama = row["Nama"] || "-";
                let toko = row["Toko"] || "-";
                
                // Menangkap data perangkat
                let device = row["Perangkat"] || row["Perangkat / Device"] || row["deviceInfo"] || "-";
                let ua = row["User Agent"] || "";

                // Jika di spreadsheet masih tercatat generik, lakukan parsing ulang dari User Agent
                if ((device === "Android Phone" || device === "-") && ua) {
                    device = parseDeviceName(ua);
                }

                let lat = row["GPS Lat"] || "-";
                let long = row["GPS Long"] || "-";

                let gpsInfo = (lat !== "-" && long !== "-") 
                    ? `<a href="https://maps.google.com/?q=${lat},${long}" target="_blank" style="color: #38bdf8; text-decoration: underline;">📍 ${lat}, ${long}</a>` 
                    : "-";

                htmlRows += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 8px; white-space: nowrap;">${waku}</td>
                        <td style="padding: 8px;">${nik}</td>
                        <td style="padding: 8px;">${nama}</td>
                        <td style="padding: 8px;">${toko}</td>
                        <td style="padding: 8px;">${device}</td>
                        <td style="padding: 8px; white-space: nowrap;">${gpsInfo}</td>
                    </tr>
                `;
            });

            if (tbody) tbody.innerHTML = htmlRows;
        })
        .catch(err => {
            console.error("Gagal mengambil log admin:", err);
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #ef4444;">Gagal memuat data dari server. Periksa koneksi Anda.</td></tr>`;
        });
}

// =========================================================
// 4. FITUR GLOBAL: SHOW BARCODE
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
// 5. NAVIGASI MENU OPERASIONAL
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
        if (typeof loadMenuSoReguler === 'function') {
            loadMenuSoReguler();
        } else {
            alert("Modul soReguler.js belum dimuat dengan benar!");
        }
    }
}

function kembaliKeMenu() {
    tutupDropdownOtomatis();
    let workspaceCard = document.getElementById('workspaceCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let menu979Container = document.getElementById('menu979Container');
    let menuBebasContainer = document.getElementById('menuBebasContainer');
    let menuBebasGsContainer = document.getElementById('menuBebasGsContainer');
    let soFormArea = document.getElementById('soFormArea');
    let adminFormArea = document.getElementById('adminFormArea');

    if (workspaceCard) workspaceCard.classList.add('hidden');
    if (mainMenuCard) mainMenuCard.classList.remove('hidden');
    if (menu979Container) menu979Container.classList.add('hidden');
    if (menuBebasContainer) menuBebasContainer.classList.add('hidden');
    if (menuBebasGsContainer) menuBebasGsContainer.classList.add('hidden');
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
    if (typeof logout === 'function') {
        logout();
    }
}

// =========================================================
// 6. TOGGLE THEME & FULLSCREEN
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

// =========================================================
// VALIDASI & PEMICU IZIN LOKASI INTERAKTIF
// =========================================================
let isLocationGranted = false;

window.addEventListener('DOMContentLoaded', () => {
    cekDanMintaLokasiAwal();
});

function cekDanMintaLokasiAwal() {
    const blockedOverlay = document.getElementById('locationBlockedOverlay');

    if (!("geolocation" in navigator)) {
        alert("Perangkat Anda tidak mendukung fitur lokasi GPS.");
        if (blockedOverlay) blockedOverlay.classList.remove('hidden');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            isLocationGranted = true;
            if (blockedOverlay) blockedOverlay.classList.add('hidden');
            
            // Catat log pengunjung otomatis saat lokasi berhasil diizinkan
            if (typeof kirimLogVisitor === 'function') {
                let namaUser = localStorage.getItem('apo_nama') || "Karyawan Alfamart";
                let namaToko = localStorage.getItem('apo_toko') || "Toko Alfamart";
                kirimLogVisitor(namaUser, namaToko);
            }
        },
        (error) => {
            isLocationGranted = false;
            if (blockedOverlay) blockedOverlay.classList.remove('hidden');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// Fungsi yang dipicu saat tombol "Aktifkan Lokasi Sekarang" diklik oleh user
function mintaUlangIzinLokasi() {
    const blockedOverlay = document.getElementById('locationBlockedOverlay');

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                isLocationGranted = true;
                if (blockedOverlay) blockedOverlay.classList.add('hidden');
                
                // Kirim log visitor dan muat ulang agar aplikasi siap digunakan
                if (typeof kirimLogVisitor === 'function') {
                    let namaUser = localStorage.getItem('apo_nama') || "Karyawan Alfamart";
                    let namaToko = localStorage.getItem('apo_toko') || "Toko Alfamart";
                    kirimLogVisitor(namaUser, namaToko);
                }
                window.location.reload();
            },
            (error) => {
                alert("Izin lokasi masih ditolak. Silakan ketuk 'Izinkan' saat kotak dialog browser muncul.");
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }
}
