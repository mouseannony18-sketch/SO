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

        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>' +
'<?mso-application progid="Excel.Sheet"?>' +
'<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
'xmlns:html="http://www.w3.org/TR/REC-html40">' +
'<Styles>' +
'<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/></Style>' +
'<Style ss:ID="TitleStyle"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#059669" ss:Pattern="Solid"/></Style>' +
'<Style ss:ID="SubtitleStyle"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Italic="1" ss:Color="#065f46"/><Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/></Style>' +
'<Style ss:ID="HeaderStyle"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#059669" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/></Borders></Style>' +
'<Style ss:ID="CellCenter"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>' +
'<Style ss:ID="CellRight"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>' +
'<Style ss:ID="CellLeft"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>' +
'<Style ss:ID="CellRed"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#DC2626"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>' +
'<Style ss:ID="TotalStyle"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#FDE047" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/></Borders></Style>' +
'<Style ss:ID="TotalLabelStyle"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#FDE047" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/></Borders></Style>' +
'</Styles>' +
'<Worksheet ss:Name="Rak_979">' +
'<Table>' +
'<Column ss:Width="40"/><Column ss:Width="90"/><Column ss:Width="130"/><Column ss:Width="280"/><Column ss:Width="80"/><Column ss:Width="80"/><Column ss:Width="70"/>' +
'<Row ss:Height="30"><Cell ss:MergeAcross="6" ss:StyleID="TitleStyle"><Data ss:Type="String">' + escapeXml(judul) + '</Data></Cell></Row>' +
'<Row ss:Height="22"><Cell ss:MergeAcross="6" ss:StyleID="SubtitleStyle"><Data ss:Type="String"> ' + todayStr + '</Data></Cell></Row>' +
'<Row ss:Height="10"/>' +
'<Row ss:Height="25">' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">No.</Data></Cell>' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">PLU</Data></Cell>' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Barcode</Data></Cell>' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Nama Item</Data></Cell>' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">QTY Fisik</Data></Cell>' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">OH</Data></Cell>' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Selisih</Data></Cell>' +
'</Row>';

        dataArray.forEach((item, index) => {
            let no = item.no || (index + 1);
            let plu = item.plu || item.PLU || "-";
            let barcode = item.barcode || item.Barcode || "-";
            let nama = item.namaItem || item.Nama_Item || item.nama || "-";
            let qty = item.qty ?? item.QTY ?? 0;
            let oh = item.oh ?? item.OH ?? 0;
            let selisih = item.selisih ?? item.Selisih ?? 0;
            let selisihStyleTag = selisih !== 0 ? 'CellRed' : 'CellCenter';

            xmlContent += '<Row ss:Height="20">' +
                '<Cell ss:StyleID="CellCenter"><Data ss:Type="Number">' + no + '</Data></Cell>' +
                '<Cell ss:StyleID="CellRight"><Data ss:Type="String">' + escapeXml(String(plu)) + '</Data></Cell>' +
                '<Cell ss:StyleID="CellRight"><Data ss:Type="String">' + escapeXml(String(barcode)) + '</Data></Cell>' +
                '<Cell ss:StyleID="CellLeft"><Data ss:Type="String">' + escapeXml(String(nama)) + '</Data></Cell>' +
                '<Cell ss:StyleID="CellCenter"><Data ss:Type="Number">' + qty + '</Data></Cell>' +
                '<Cell ss:StyleID="CellCenter"><Data ss:Type="Number">' + oh + '</Data></Cell>' +
                '<Cell ss:StyleID="' + selisihStyleTag + '"><Data ss:Type="Number">' + selisih + '</Data></Cell>' +
                '</Row>';
        });

        xmlContent += '<Row ss:Height="24">' +
            '<Cell ss:MergeAcross="3" ss:StyleID="TotalLabelStyle"><Data ss:Type="String">TOTAL KESELURUHAN: </Data></Cell>' +
            '<Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">' + totalQty + '</Data></Cell>' +
            '<Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">' + totalOh + '</Data></Cell>' +
            '<Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">' + totalSelisih + '</Data></Cell>' +
            '</Row>' +
            '</Table></Worksheet></Workbook>';

        let bytes = new TextEncoder().encode(xmlContent);
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

function escapeXml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe).replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
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
