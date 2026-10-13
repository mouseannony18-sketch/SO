const fetch = require('node-fetch'); // Atau gunakan native fetch jika Node.js versi baru

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    try {
        const { nik, pin, otp } = JSON.parse(event.body);

        // URL Endpoint API server perusahaan Anda yang sebenarnya
        const targetApiUrl = "https://api.contohserver.com/v1/login"; 

        // Server Netlify yang melakukan request (Tidak terkena CORS oleh server tujuan)
        const apiResponse = await fetch(targetApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nik, pin, otp })
        });

        const data = await apiResponse.json();

        if (apiResponse.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    token: data.token || "CONTOH_TOKEN_DARI_API_12345"
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: data.message || "Gagal dari server tujuan"
                })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.toString() })
        };
    }
};
