// =========================================================
// MODUL EKSPOR EXCEL MURNI SHEETJS & CETAK PDF (export.js)
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
            alert("Pustaka xlsx.min.js belum dimuat dengan benar!");
            return;
        }

        let todayStr = "Tanggal: " + new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        // Menyusun baris data array (AOA) untuk SheetJS
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

            ws_data.push([no, String(plu), String(barcode), nama, qty, oh, selisih]);
        });

        // Baris Total Keseluruhan di bagian bawah
        ws_data.push(["TOTAL KESELURUHAN:", "", "", "", totalQty, totalOh, totalSelisih]);

        let ws = XLSXLib.utils.aoa_to_sheet(ws_data);

        // Mengatur lebar kolom agar rapi di HP
        ws['!cols'] = [
            { wch: 6 },   // No.
            { wch: 10 },  // PLU
            { wch: 15 },  // Barcode
            { wch: 35 },  // Nama Item
            { wch: 10 },  // QTY Fisik
            { wch: 8 },   // OH
            { wch: 10 }   // Selisih
        ];

        let totalRowIdx = ws_data.length - 1;
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Judul utama digabung
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Tanggal digabung
            { s: { r: totalRowIdx, c: 0 }, e: { r: totalRowIdx, c: 3 } } // Label total digabung
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
