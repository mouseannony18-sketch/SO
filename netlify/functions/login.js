const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    try {
        const { nik, pin, otp } = JSON.parse(event.body);

        const targetApiUrl = "https://apo-apps-gateway.alfagift.id/v1/auth/login";

        // Menambahkan parameter lengkap sesuai kebutuhan payload sistem
        const details = {
            nik: nik,
            pin: pin,
            otp: otp,
            isValidate: "false",
            isGPSActive: "true"
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

        // Mengembalikan respons asli dari server untuk diagnosa jika masih gagal
        if (apiResponse.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    token: data.token || data.access_token || data.data?.token || "TOKEN_BERHASIL"
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: data.message || data.error || "Autentikasi ditolak oleh server"
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
