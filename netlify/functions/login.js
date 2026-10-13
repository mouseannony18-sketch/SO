const fetch = require('node-fetch');
const crypto = require('crypto');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    try {
        const { nik, pin, otp, userAgent, deviceModel } = JSON.parse(event.body);

        const targetApiUrl = "https://apo-apps-gateway.alfagift.id/v1/auth/login";

        // Membuat deviceid unik konsisten berdasarkan NIK
        const deviceId = crypto.createHash('md5').update(nik).digest('hex');

        // Menggunakan User-Agent dan Device Model asli dari perangkat pengguna
        const clientUserAgent = userAgent || "okhttp/5.3.2";
        const clientDeviceModel = deviceModel || "Android-Mobile";

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "appversion": "4090003",
            "deviceid": deviceId,
            "platformtype": "Android",
            "devicemodel": clientDeviceModel, // Merek/tipe HP asli pengguna
            "user-agent": clientUserAgent
        };

        const details = {
            nik: nik,
            pin: pin,
            otp: otp,
            isValidate: "true",
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
            headers: headers,
            body: formBody
        });

        const resData = await apiResponse.json();

        if (apiResponse.ok && resData.code === 200) {
            const token = resData.payload?.token || resData.token;

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    token: token || "TOKEN_BERHASIL"
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: resData.message || "Server menolak login"
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
