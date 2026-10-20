const crypto = require('crypto');

module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { barcode, token, storeCode, companyCode } = req.body;

        if (!token || !barcode) {
            return res.status(400).json({ success: false, message: "Token atau barcode tidak boleh kosong" });
        }

        const targetApiUrl = "https://apo-apps-gateway.alfagift.id/v2/order/product/scan";

        const payload = {
            productBarcode: barcode,
            storeCode: storeCode || "",
            companyCode: companyCode || "",
            storeDc: ""
        };

        const apiResponse = await fetch(targetApiUrl, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const resData = await apiResponse.json();

        if (apiResponse.ok) {
            // Mengambil data nama dan stok sistem dari payload respons API
            const productData = resData.payload || resData;
            
            return res.status(200).json({
                success: true,
                productName: productData.productName || productData.name || "Barang Scan",
                systemStock: productData.stock || productData.systemStock || productData.qtyStock || 0,
                raw: productData
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
