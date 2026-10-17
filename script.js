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

    if ((savedToken && savedNik) || isSkipped) {
        tokenGlobal = savedToken || "";
        currentNik = savedNik || "Tamu";
        isSessionValid = savedToken ? true : false;
        
        document.getElementById('userNameText').innerText = savedName || (isSkipped ? "Mode Tamu (Tanpa Login)" : "Karyawan Alfamart");
        document.getElementById('storeNameText').innerText = savedStore || "Sinkronisasi Server: 0 (Null)";

        updateAuthButtonState(isSessionValid);

        document.getElementById('loginCard').classList.add('hidden');
        document.getElementById('workspaceCard').classList.add('hidden');
        document.getElementById('mainMenuCard').classList.remove('hidden');
    } else {
        isSessionValid = false;
        updateAuthButtonState(false);
        showLoginScreen();
    }
};

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
    // Pastikan modal tertutup dan hanya halaman login yang muncul
    document.getElementById('sessionModal').classList.add('hidden');
    document.getElementById('workspaceCard').classList.add('hidden');
    document.getElementById('mainMenuCard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
}

function lewatiLogin() {
    localStorage.setItem('apo_skipped', 'true');
    isSessionValid = false;
    
    document.getElementById('userNameText').innerText = "Mode Tamu (Tanpa Login)";
    document.getElementById('storeNameText').innerText = "Sinkronisasi Server: 0 (Null)";
    
    updateAuthButtonState(false);

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

    status.innerText = "Mendeteksi perangkat & menghubungi server...";

    let userAgentAsli = navigator.userAgent;
    let deviceModelAsli = "Android Device";
    let match = userAgentAsli.match(/\(([^)]+)\)/);
    if (match && match[1]) {
        let parts = match[1].split(';');
        for (let part of parts) {
            part = part.trim();
            if (part.includes('Build/') || part.length > 3 && !part.startsWith('Android') && !part.startsWith('iPhone') && !part.startsWith('Linux')) {
                deviceModelAsli = part.split(' Build/')[0].trim();
                break;
            }
        }
    }

    try {
        let response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nik, 
                pin, 
                otp, 
                userAgent: userAgentAsli, 
                deviceModel: deviceModelAsli 
            })
        });

        let result = await response.json();

        if(response.ok && result.success) {
            tokenGlobal = result.token;
            currentNik = nik;
            let employeeName = result.employeeName;
            let storeName = result.storeName;
            
            localStorage.setItem('apo_token', tokenGlobal);
            localStorage.setItem('apo_nik', currentNik);
            localStorage.setItem('apo_name', employeeName);
            localStorage.setItem('apo_store', storeName);
            localStorage.removeItem('apo_skipped');

            isSessionValid = true;
            updateAuthButtonState(true);

            document.getElementById('userNameText').innerText = employeeName;
            document.getElementById('storeNameText').innerText = storeName;

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
    document.getElementById('mainMenuCard').classList.add('hidden');
    document.getElementById('workspaceCard').classList.remove('hidden');

    let judul = "";
    if (jenis === '979') {
        judul = "Menu Rak 979 (Stock Opname)";
        bukaAreaSO();
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

function kembalikeMenu() {
    document.getElementById('workspaceCard').classList.add('hidden');
    document.getElementById('mainMenuCard').classList.remove('hidden');
}

// Alias agar tidak salah panggil
function kembaliKeMenu() {
    document.getElementById('workspaceCard').classList.add('hidden');
    document.getElementById('mainMenuCard').classList.remove('hidden');
}

async function tambahData() {
    let savedToken = localStorage.getItem('apo_token');
    let isSkipped = localStorage.getItem('apo_skipped') === 'true';

    let kode = document.getElementById('kodeBarang').value.trim();
    let qtyFisik = document.getElementById('qtyFisik').value;

    if(!kode || !qtyFisik) {
        alert('Isi kode barcode dan qty hitung fisik dengan benar!');
        return;
    }

    if (!savedToken || isSkipped) {
        dataSO.push({ 
            Menu: menuAktif,
            Barcode: kode, 
            Deskripsi: "Item Manual (Tanpa Sinkronisasi)", 
            Qty_Hitung: qtyFisik, 
            Stok_Sistem: 0 
        });

        let tbody = document.querySelector('#tabelSO tbody');
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${kode}</b><br><small style="color:var(--text-muted);">Tanpa Login (Null)</small></td>
            <td style="text-align: center; font-weight: bold; color: #3b82f6;">${qtyFisik}</td>
            <td style="text-align: center; color: var(--text-muted);">0</td>
        `;
        tbody.appendChild(tr);

        document.getElementById('kodeBarang').value = '';
        document.getElementById('qtyFisik').value = '';
        document.getElementById('kodeBarang').focus();
        return;
    }

    let btnTambah = event.target;
    let originalText = btnTambah.innerText;
    btnTambah.innerText = "Memeriksa...";
    btnTambah.disabled = true;

    try {
        let response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                barcode: kode, 
                token: savedToken 
            })
        });

        let result = await response.json();

        if (response.status === 401 || (result && result.message && result.message.toLowerCase().includes('token'))) {
            localStorage.removeItem('apo_token');
            isSessionValid = false;
            updateAuthButtonState(false);
            document.getElementById('sessionModal').classList.remove('hidden');
            return;
        }

        if (response.ok && result.success) {
            let namaBarang = result.productName;
            let stokSistem = result.systemStock;
            
            dataSO.push({ 
                Menu: menuAktif,
                Barcode: kode, 
                Deskripsi: namaBarang, 
                Qty_Hitung: qtyFisik, 
                Stok_Sistem: stokSistem 
            });

            let tbody = document.querySelector('#tabelSO tbody');
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${kode}</b><br><small style="color:var(--text-muted);">${namaBarang}</small></td>
                <td style="text-align: center; font-weight: bold; color: #3b82f6;">${qtyFisik}</td>
                <td style="text-align: center; color: var(--text-muted);">${stokSistem}</td>
            `;
            tbody.appendChild(tr);

            document.getElementById('kodeBarang').value = '';
            document.getElementById('qtyFisik').value = '';
            document.getElementById('kodeBarang').focus();
        } else {
            alert("Gagal memuat barang: " + (result.message || "Barang tidak ditemukan"));
        }

    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan jaringan saat memindai barang.");
    } finally {
        btnTambah.innerText = originalText;
        btnTambah.disabled = false;
    }
}

function simpanItemAdmin() {
    let barcode = document.getElementById('admBarcode').value.trim();
    let nama = document.getElementById('admNama').value.trim();
    let ket = document.getElementById('admKet').value.trim();

    if(!barcode || !nama) {
        alert('Barcode dan Nama Barang wajib diisi!');
        return;
    }

    alert(`Sukses! Item baru [${barcode}] - ${nama} berhasil didaftarkan ke sistem.`);
    document.getElementById('admBarcode').value = '';
    document.getElementById('admNama').value = '';
    document.getElementById('admKet').value = '';
}

function exportExcel() {
    if(dataSO.length === 0) return alert('Belum ada data!');
    let ws = XLSX.utils.json_to_sheet(dataSO);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockOpname_" + menuAktif);
    XLSX.writeFile(wb, `StockOpname_${menuAktif}_Hasil.xlsx`);
}

function logout() {
    localStorage.removeItem('apo_token');
    localStorage.removeItem('apo_nik');
    localStorage.removeItem('apo_name');
    localStorage.removeItem('apo_store');
    localStorage.removeItem('apo_skipped');
    
    tokenGlobal = "";
    currentNik = "";
    isSessionValid = false;
    
    updateAuthButtonState(false);
    showLoginScreen();
    
    document.getElementById('nik').value = '';
    document.getElementById('pin').value = '';
    document.getElementById('otp').value = '';
    document.getElementById('statusLogin').innerText = '';
}
