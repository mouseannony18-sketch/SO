// =========================================================
// MODUL EKSPOR EXCEL & CETAK PDF (export.js)
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

        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<?mso-application progid="Excel.Sheet"?>\n' +
'<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
'xmlns:html="http://www.w3.org/TR/REC-html40">\n' +
'<Styles>\n' +
'<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/></Style>\n' +
'<Style ss:ID="TitleStyle"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#059669" ss:Pattern="Solid"/></Style>\n' +
'<Style ss:ID="SubtitleStyle"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Italic="1" ss:Color="#065f46"/><Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/></Style>\n' +
'<Style ss:ID="HeaderStyle"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#059669" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/></Borders></Style>\n' +
'<Style ss:ID="CellCenter"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>\n' +
'<Style ss:ID="CellRight"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>\n' +
'<Style ss:ID="CellLeft"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>\n' +
'<Style ss:ID="CellRed"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#DC2626"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>\n' +
'<Style ss:ID="TotalStyle"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#FDE047" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/></Borders></Style>\n' +
'<Style ss:ID="TotalLabelStyle"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#FDE047" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#000000"/></Borders></Style>\n' +
'</Styles>\n' +
'<Worksheet ss:Name="Rak_979">\n' +
'<Table>\n' +
'<Column ss:Width="45"/><Column ss:Width="90"/><Column ss:Width="130"/><Column ss:Width="300"/><Column ss:Width="80"/><Column ss:Width="70"/><Column ss:Width="70"/>\n' +
'<Row ss:Height="30"><Cell ss:MergeAcross="6" ss:StyleID="TitleStyle"><Data ss:Type="String">' + escapeXml(judul) + '</Data></Cell></Row>\n' +
'<Row ss:Height="22"><Cell ss:MergeAcross="6" ss:StyleID="SubtitleStyle"><Data ss:Type="String">' + todayStr + '</Data></Cell></Row>\n' +
'<Row ss:Height="10"/>\n' +
'<Row ss:Height="25">\n' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">No.</Data></Cell>\n' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">PLU</Data></Cell>\n' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Barcode</Data></Cell>\n' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Nama Item</Data></Cell>\n' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">QTY Fisik</Data></Cell>\n' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">OH</Data></Cell>\n' +
'<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Selisih</Data></Cell>\n' +
'</Row>\n';

        dataArray.forEach((item, index) => {
            let no = item.no || (index + 1);
            let plu = item.plu || item.PLU || "-";
            let barcode = item.barcode || item.Barcode || "-";
            let nama = item.namaItem || item.Nama_Item || item.nama || "-";
            let qty = parseInt(item.qty ?? item.QTY ?? 0);
            let oh = parseInt(item.oh ?? item.OH ?? 0);
            let selisih = parseInt(item.selisih ?? item.Selisih ?? 0);
            let selisihStyleTag = selisih !== 0 ? 'CellRed' : 'CellCenter';

            xmlContent += '<Row ss:Height="20">\n' +
                '<Cell ss:StyleID="CellCenter"><Data ss:Type="Number">' + no + '</Data></Cell>\n' +
                '<Cell ss:StyleID="CellRight"><Data ss:Type="String">' + escapeXml(String(plu)) + '</Data></Cell>\n' +
                '<Cell ss:StyleID="CellRight"><Data ss:Type="String">' + escapeXml(String(barcode)) + '</Data></Cell>\n' +
                '<Cell ss:StyleID="CellLeft"><Data ss:Type="String">' + escapeXml(String(nama)) + '</Data></Cell>\n' +
                '<Cell ss:StyleID="CellCenter"><Data ss:Type="Number">' + qty + '</Data></Cell>\n' +
                '<Cell ss:StyleID="CellCenter"><Data ss:Type="Number">' + oh + '</Data></Cell>\n' +
                '<Cell ss:StyleID="' + selisihStyleTag + '"><Data ss:Type="Number">' + selisih + '</Data></Cell>\n' +
                '</Row>\n';
        });

        xmlContent += '<Row ss:Height="24">\n' +
            '<Cell ss:MergeAcross="3" ss:StyleID="TotalLabelStyle"><Data ss:Type="String">TOTAL KESELURUHAN: </Data></Cell>\n' +
            '<Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">' + totalQty + '</Data></Cell>\n' +
            '<Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">' + totalOh + '</Data></Cell>\n' +
            '<Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">' + totalSelisih + '</Data></Cell>\n' +
            '</Row>\n' +
            '</Table></Worksheet></Workbook>';

        let blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
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
