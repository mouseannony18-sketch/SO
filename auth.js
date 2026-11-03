// =========================================================
// MODUL OTENTIKASI & SESI DENGAN NOTIFIKASI POPUP (auth.js)
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    // 1. Selalu tampilkan halaman login dulu secara default
    tampilkanHalamanLogin();

    // 2. Cek sesi ke server di latar belakang
    cekSesiKeServer();
});

async function cekSesiKeServer() {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    // Jika mode tamu atau tidak ada token tersimpan, langsung bersihkan status dan keluar
    if (isSkipped || !savedToken) {
        let statusEl = document.getElementById('statusLogin');
        if (statusEl) statusEl.innerText = "";
        return; 
    }

    let statusEl = document.getElementById('statusLogin');
    if (statusEl) statusEl.innerText = "Memeriksa sesi aktif...";

    try {
        let response = await fetch('/api/check-session', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + savedToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            let result = await response.json();
            let payloadData = result.payload || result;
            
            let empName = payloadData.employeName || payloadData.employeeName || localStorage.getItem('apo_user_name') || "Karyawan Alfamart";
            let strName = payloadData.storeName || localStorage.getItem('apo_store_name') || "Toko Alfamart";

            if (statusEl) statusEl.innerText = "";
            
            // Sesi Valid: Langsung masuk ke menu utama
            bukaMenuUtama(empName, strName);
        } else {
            // Sesi Habis / Unauthorized dari Server
            if (statusEl) statusEl.innerText = "";
            
            // Tampilkan popup informasi sesi habis
            tampilkanPesanSesiHabis("Sesi login Anda telah habis atau kedaluwarsa. Silakan login ulang.");
            
            paksaLogoutDanBersihkan();
        }
    } catch (err) {
        console.error("Gagal verifikasi token:", err);
        if (statusEl) statusEl.innerText = "";
        
        // Jika gagal koneksi/error
        tampilkanPesanSesiHabis("Koneksi bermasalah atau sesi berakhir. Silakan login ulang.");
        paksaLogoutDanBersihkan();
    }
}

// Helper untuk menampilkan popup pesan yang elegan
function tampilkanPesanSesiHabis(pesan) {
    if (typeof showModernAlert === 'function') {
        showModernAlert(pesan, "Informasi Sesi");
    } else {
        alert(pesan);
    }
}

// Fungsi Proses Login Utama (Ketik NIK & PIN)
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

        if (response.ok && (result.success || result.code === 200)) {
            let payloadData = result.payload || result;
            
            let tokenVal = payloadData.token || payloadData.refreshToken || result.token || "token_" + Date.now();
            let empName = payloadData.employeName || payloadData.employeeName || payloadData.userName || ("Karyawan " + nik);
            let strName = payloadData.storeName || payloadData.store_name || "Toko Alfamart";

            // Simpan NIK juga ke localStorage agar terekam di log visitor
            localStorage.setItem('apo_nik', nik);
            localStorage.setItem('apo_token', tokenVal);
            localStorage.setItem('apo_user_name', empName);
            localStorage.setItem('apo_store_name', strName);
            localStorage.removeItem('apo_skipped');

            if (statusEl) statusEl.innerText = "";
            bukaMenuUtama(empName, strName);
        } else {
            if (statusEl) statusEl.innerText = result.message || "Login Gagal: Periksa kembali NIK / PIN / OTP Anda.";
        }
    } catch (err) {
        console.error("Error login:", err);
        if (statusEl) statusEl.innerText = "Terjadi kesalahan jaringan.";
    }
}

// Opsi Masuk Sebagai Tamu
function lewatiLogin() {
    localStorage.setItem('apo_skipped', 'true');
    localStorage.setItem('apo_nik', 'Tamu');
    localStorage.removeItem('apo_token');
    localStorage.removeItem('apo_user_name');
    localStorage.removeItem('apo_store_name');
    
    bukaMenuUtama("Mode Tamu", "Akses Terbatas");
}

// Transisi Tampilan ke Menu Utama (Dilengkapi Sapaan & Kirim Log Visitor)
function bukaMenuUtama(empName, strName) {
    let loginCard = document.getElementById('loginCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');

    if (loginCard) loginCard.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.add('hidden');
    if (mainMenuCard) mainMenuCard.classList.remove('hidden');

    let nameEl = document.getElementById('userNameText');
    let storeEl = document.getElementById('storeNameText');
    let authBtn = document.getElementById('authBtn');

    // Logika Sapaan Waktu Otomatis Berdasarkan Jam Lokal HP
    let jam = new Date().getHours();
    let sapaan = "Halo";
    
    if (jam >= 4 && jam < 11) {
        sapaan = "🌅 Selamat Pagi";
    } else if (jam >= 11 && jam < 15) {
        sapaan = "☀️ Selamat Siang";
    } else if (jam >= 15 && jam < 18) {
        sapaan = "🌇 Selamat Sore";
    } else {
        sapaan = "🌙 Selamat Malam";
    }

    if (nameEl) {
        nameEl.innerHTML = `${sapaan}, <span style="font-weight: bold;">${empName}</span>`;
    }
    
    if (storeEl) {
        storeEl.innerText = strName;
    }

    if (authBtn) {
        authBtn.innerText = "Keluar";
        authBtn.className = "auth-action-btn logout-color";
    }

    // KIRIM LOG VISITOR OTOMATIS KE GOOGLE SPREADSHEET
    if (typeof kirimLogVisitor === 'function') {
        kirimLogVisitor(empName, strName);
    }
}

// Tampilkan Halaman Login
function tampilkanHalamanLogin() {
    let loginCard = document.getElementById('loginCard');
    let mainMenuCard = document.getElementById('mainMenuCard');
    let workspaceCard = document.getElementById('workspaceCard');

    if (loginCard) loginCard.classList.remove('hidden');
    if (mainMenuCard) mainMenuCard.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.add('hidden');
}

// Bersihkan Sesi (Logout)
function paksaLogoutDanBersihkan() {
    localStorage.removeItem('apo_token');
    localStorage.removeItem('apo_skipped');
    localStorage.removeItem('apo_nik');
    localStorage.removeItem('apo_user_name');
    localStorage.removeItem('apo_store_name');
    tampilkanHalamanLogin();
}

function logout() {
    tutupDropdownOtomatis();
    paksaLogoutDanBersihkan();
}
