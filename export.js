// =========================================================
// MODUL EKSPOR EXCEL & CETAK PDF BERBASIS HTML (export.js)
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

        let htmlTable = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .title { background-color: #059669; color: #FFFFFF; font-size: 14px; font-weight: bold; text-align: center; vertical-align: middle; height: 35px; }
                    .subtitle { background-color: #D1FAE5; color: #065F46; font-size: 11px; font-style: italic; text-align: center; vertical-align: middle; height: 25px; }
                    .th-header { background-color: #059669; color: #FFFFFF; font-size: 11px; font-weight: bold; text-align: center; vertical-align: middle; border: 1px solid #000000; height: 28px; }
                    .td-center { text-align: center; vertical-align: middle; border: 1px solid #D1D5DB; font-size: 10px; height: 22px; }
                    .td-right { text-align: right; vertical-align: middle; border: 1px solid #D1D5DB; font-size: 10px; height: 22px; mso-number-format:"\@"; }
                    .td-left { text-align: left; vertical-align: middle; border: 1px solid #D1D5DB; font-size: 10px; height: 22px; }
                    .td-red { text-align: center; vertical-align: middle; border: 1px solid #D1D5DB; font-size: 10px; font-weight: bold; color: #DC2626; height: 22px; }
                    .total-label { background-color: #FDE047; font-weight: bold; font-size: 11px; text-align: right; vertical-align: middle; border-top: 2px solid #000000; border-bottom: 2px solid #000000; border-left: 1px solid #000000; height: 28px; }
                    .total-val { background-color: #FDE047; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle; border-top: 2px solid #000000; border-bottom: 2px solid #000000; border-right: 1px solid #000000; border-left: 1px solid #000000; height: 28px; }
                </style>
            </head>
            <body>
                <table>
                    <tr><td colspan="7" class="title">${escapeHtml(judul)}</td></tr>
                    <tr><td colspan="7" class="subtitle">${todayStr}</td></tr>
                    <tr><td colspan="7"></td></tr>
                    <tr>
                        <td class="th-header" style="width: 45px;">No.</td>
                        <td class="th-header" style="width: 90px;">PLU</td>
                        <td class="th-header" style="width: 130px;">Barcode</td>
                        <td class="th-header" style="width: 300px;">Nama Item</td>
                        <td class="th-header" style="width: 80px;">QTY Fisik</td>
                        <td class="th-header" style="width: 70px;">OH</td>
                        <td class="th-header" style="width: 70px;">Selisih</td>
                    </tr>
        `;

        dataArray.forEach((item, index) => {
            let no = item.no || (index + 1);
            let plu = item.plu || item.PLU || "-";
            let barcode = item.barcode || item.Barcode || "-";
            let nama = item.namaItem || item.Nama_Item || item.nama || "-";
            let qty = parseInt(item.qty ?? item.QTY ?? 0);
            let oh = parseInt(item.oh ?? item.OH ?? 0);
            let selisih = parseInt(item.selisih ?? item.Selisih ?? 0);
            let selisihClass = selisih !== 0 ? 'td-red' : 'td-center';

            htmlTable += `
                <tr>
                    <td class="td-center">${no}</td>
                    <td class="td-right">${escapeHtml(String(plu))}</td>
                    <td class="td-right">${escapeHtml(String(barcode))}</td>
                    <td class="td-left">${escapeHtml(String(nama))}</td>
                    <td class="td-center">${qty}</td>
                    <td class="td-center">${oh}</td>
                    <td class="${selisihClass}">${selisih}</td>
                </tr>
            `;
        });

        htmlTable += `
                    <tr>
                        <td colspan="4" class="total-label">TOTAL KESELURUHAN:</td>
                        <td class="total-val">${totalQty}</td>
                        <td class="total-val">${totalOh}</td>
                        <td class="total-val">${totalSelisih}</td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        let blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8' });
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = (judul ? judul.replace(/[^a-zA-Z0-9]/g, "_") : "Laporan_SO") + ".xls";
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

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

function escapeHtml(unsafe) {
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
