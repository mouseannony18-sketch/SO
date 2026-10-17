// =========================================================
// MODUL EKSPOR EXCEL STYLING & CETAK PDF (export.js)
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

        ws_data.push(["TOTAL KESELURUHAN:", "", "", "", totalQty, totalOh, totalSelisih]);

        let ws = XLSXLib.utils.aoa_to_sheet(ws_data);

        // Mengatur lebar kolom agar rapi di HP
        ws['!cols'] = [
            { wch: 6 },   // No.
            { wch: 12 },  // PLU
            { wch: 16 },  // Barcode
            { wch: 35 },  // Nama Item
            { wch: 10 },  // QTY Fisik
            { wch: 8 },   // OH
            { wch: 10 }   // Selisih
        ];

        let totalRowIdx = ws_data.length - 1;
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, 
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, 
            { s: { r: totalRowIdx, c: 0 }, e: { r: totalRowIdx, c: 3 } } 
        ];

        // Definisi Styling Border & Warna untuk Sel
        let borderThin = {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        };

        // Menerapkan styling ke setiap sel secara dinamis
        for (let cellAddress in ws) {
            if (cellAddress.startsWith('!')) continue;
            let cell = ws[cellAddress];
            let coords = XLSXLib.utils.decode_cell(cellAddress);
            let r = coords.r;
            let c = coords.c;

            if (!cell.s) cell.s = {};
            cell.s.border = borderThin;

            // Baris Judul Utama (Baris 0)
            if (r === 0) {
                cell.s.fill = { fgColor: { rgb: "059669" } }; // Hijau Alfamart
                cell.s.font = { bold: true, color: { rgb: "FFFFFF" }, sz: 12 };
                cell.s.alignment = { horizontal: "center", vertical: "center" };
            } 
            // Baris Subtitle Tanggal (Baris 1)
            else if (r === 1) {
                cell.s.fill = { fgColor: { rgb: "D1FAE5" } }; // Hijau muda
                cell.s.font = { italic: true, color: { rgb: "065F46" }, sz: 10 };
                cell.s.alignment = { horizontal: "center", vertical: "center" };
            } 
            // Baris Header Kolom (Baris 3)
            else if (r === 3) {
                cell.s.fill = { fgColor: { rgb: "059669" } }; // Hijau header
                cell.s.font = { bold: true, color: { rgb: "FFFFFF" }, sz: 10 };
                cell.s.alignment = { horizontal: "center", vertical: "center" };
            } 
            // Baris Total Keseluruhan (Baris Terakhir)
            else if (r === totalRowIdx) {
                cell.s.fill = { fgColor: { rgb: "FDE047" } }; // Kuning terang
                cell.s.font = { bold: true, color: { rgb: "000000" }, sz: 10 };
                if (c >= 4) {
                    cell.s.alignment = { horizontal: "center", vertical: "center" };
                } else {
                    cell.s.alignment = { horizontal: "right", vertical: "center" };
                }
            } 
            // Baris Data Tabel
            else if (r > 3) {
                cell.s.font = { sz: 10 };
                // Kolom No (0), QTY (4), OH (5), Selisih (6) rata tengah
                if (c === 0 || c === 4 || c === 5 || c === 6) {
                    cell.s.alignment = { horizontal: "center", vertical: "center" };
                } 
                // Kolom PLU (1) dan Barcode (2) rata kanan / center
                else if (c === 1 || c === 2) {
                    cell.s.alignment = { horizontal: "center", vertical: "center" };
                    cell.t = 's'; // Pastikan terbaca teks agar barcode tidak terpotong
                } 
                // Kolom Nama Item (3) rata kiri
                else {
                    cell.s.alignment = { horizontal: "left", vertical: "center" };
                }

                // Warna merah teks jika ada selisih stok
                if (c === 6 && typeof cell.v === 'number' && cell.v !== 0) {
                    cell.s.font.color = { rgb: "DC2626" };
                    cell.s.font.bold = true;
                }
            }
        }

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
