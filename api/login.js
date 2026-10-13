const fetch = require('node-fetch');
const crypto = require('crypto');

module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { nik, pin, otp, userAgent, deviceModel } = req.body;

        const targetApiUrl = "https://apo-apps-gateway.alfagift.id/v1/auth/login";

        const clientUserAgent = userAgent || "okhttp/5.3.2";
        const clientDeviceModel = deviceModel || "Android-Device";
        const dynamicDeviceId = crypto.createHash('sha1').update(nik + "alfagift_salt").digest('hex');

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
            return res.status(200).json({
                success: true,
                token: token || "TOKEN_BERHASIL"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: resData.message || "Autentikasi ditolak oleh server"
            });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.toString() });
    }
};
