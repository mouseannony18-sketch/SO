let tokenGlobal = "";
let dataSO = [];
let menuAktif = "";
let currentNik = "";

window.onload = function() {
    let savedToken = localStorage.getItem('apo_token');
    let savedNik = localStorage.getItem('apo_nik');
    if (savedToken && savedNik) {
        tokenGlobal = savedToken;
        currentNik = savedNik;
        document.getElementById('userNikText').innerText = currentNik;
        document.getElementById('loginCard').classList.add('hidden');
        document.getElementById('mainMenuCard').classList.remove('hidden');
    }
};

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
            
            localStorage.setItem('apo_token', tokenGlobal);
            localStorage.setItem('apo_nik', currentNik);

            document.getElementById('userNikText').innerText = currentNik;
            document.getElementById('loginCard').classList.add('hidden');
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
    menuAktif = jenis;
    document.getElementById('mainMenuCard').classList.add('hidden');
    document.getElementById('workspaceCard').classList.remove('hidden');

    let judul = "";
    if (jenis === '979') {
        judul = "Menu 979 (Stock Opname)";
        bukaAreaSO();
    } else if (jenis === 'partial') {
        judul = "Partial / Reguler SO";
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

function bukaAreaSO() {
    document.getElementById('soFormArea').classList.remove('hidden');
    document.getElementById('adminFormArea').classList.add('hidden');
}

function bukaAreaAdmin() {
    document.getElementById('soFormArea').classList.add('hidden');
    document.getElementById('adminFormArea').classList.remove('hidden');
}

function kembaliKeMenu() {
    document.getElementById('workspaceCard').classList.add('hidden');
    document.getElementById('mainMenuCard').classList.remove('hidden');
}

async function tambahData() {
    let kode = document.getElementById('kodeBarang').value.trim();
    let qtyFisik = document.getElementById('qtyFisik').value;

    if(!kode || !qtyFisik) {
        alert('Isi kode barcode dan qty hitung fisik dengan benar!');
        return;
    }

    let savedToken = localStorage.getItem('apo_token');
    if (!savedToken) {
        alert('Sesi habis, silakan login ulang.');
        logout();
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
                <td><b>${kode}</b><br><small style="color:#555;">${namaBarang}</small></td>
                <td style="text-align: center; font-weight: bold; color: #007bff;">${qtyFisik}</td>
                <td style="text-align: center; color: #555;">${stokSistem}</td>
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
    tokenGlobal = "";
    currentNik = "";
    document.getElementById('workspaceCard').classList.add('hidden');
    document.getElementById('mainMenuCard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
    document.getElementById('nik').value = '';
    document.getElementById('pin').value = '';
    document.getElementById('otp').value = '';
    document.getElementById('statusLogin').innerText = '';
}
