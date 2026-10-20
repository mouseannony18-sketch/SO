// =========================================================
// BACKEND PROXY GOOGLE SPREADSHEET (api/spreadsheet.js)
// =========================================================

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { spreadsheetId, sheetName, action } = req.body;

    if (!spreadsheetId) {
        return res.status(400).json({ success: false, message: 'Spreadsheet ID wajib diisi!' });
    }

    try {
        // Mengambil data CSV berdasarkan nama sheet tertentu
        let targetSheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${targetSheetParam}`;

        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error("Gagal mengambil data dari Google Spreadsheet. Pastikan akses link disetel ke 'Anyone with the link can view'.");
        }

        const csvText = await response.text();

        return res.status(200).json({
            success: true,
            csvData: csvText
        });

    } catch (error) {
        console.error("Error Spreadsheet API:", error);
        return res.status(500).json({ success: false, message: error.message || "Terjadi kesalahan saat memproses spreadsheet." });
    }
}
