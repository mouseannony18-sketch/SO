const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    try {
        const { nik, pin, otp } = JSON.parse(event.body);

        // Endpoint API Gateway yang sesuai
        const targetApiUrl = "https://apo-apps-gateway.alfagift.id/v1/auth/login";

        // Menggunakan format x-www-form-urlencoded sesuai spesifikasi endpoint
        const details = {
            nik: nik,
            pin: pin,
            otp: otp
        };
        
        let formBody = [];
        for (let property in details) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        const apiResponse = await fetch(targetApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody
        });

        const data = await apiResponse.json();

        if (apiResponse.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    token: data.token || data.access_token || "TOKEN_BERHASIL_DIDAPATKAN"
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
