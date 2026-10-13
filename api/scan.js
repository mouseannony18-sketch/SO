module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { barcode, token, storeCode, companyCode } = req.body;

        if (!token || !barcode) {
            return res.status(400).json({ success: false, message: "Token atau barcode tidak boleh kosong" });
        }

        // Endpoint target untuk scan/cek produk
        const targetApiUrl = "https://apo-apps-gateway.alfagift.id/v2/order/product/scan";

        // Payload yang dikirim ke server pusat
        const payload = {
            productBarcode: barcode,
            storeCode: storeCode || "",
            companyCode: companyCode || "",
            storeDc: ""
        };

        const apiResponse = await fetch(targetApiUrl, {
            method: 'PUT', // Menyesuaikan metode endpoint scan
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const resData = await apiResponse.json();

        if (apiResponse.ok) {
            return res.status(200).json({
                success: true,
                data: resData
            });
        } else {
            return res.status(400).json({
                success: false,
                message: resData.message || "Gagal mengambil data produk"
            });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error: " + error.toString() });
    }
};
