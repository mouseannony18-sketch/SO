const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    try {
        const { nik, pin, otp, userAgent, deviceModel } = JSON.parse(event.body);

        const targetApiUrl = "https://apo-apps-gateway.alfagift.id/v1/auth/login";

        // Menggunakan user-agent okhttp standar seperti di script Python yang terbukti sukses
        const clientUserAgent = userAgent || "okhttp/5.3.2";
        const clientDeviceModel = deviceModel || "Termux-Python-Client";

        // Membuat device id statis berbasis NIK agar konsisten
        const crypto = require('crypto');
        const dynamicDeviceId = crypto.createHash('sha1').update(nik + "alfagift_salt").digest('hex');

        // Headers dibuat persis seperti script Python yang sukses
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "appversion": "4090003",
            "deviceid": dynamicDeviceId,
            "platformtype": "Android",
            "devicemodel": clientDeviceModel,
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
                    message: resData.message || "Autentikasi ditolak oleh server"
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
