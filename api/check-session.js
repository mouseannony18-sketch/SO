// api/check-session.js
export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Ambil token dari header request frontend
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    try {
        // Vercel backend yang menembak ke gateway Alfagift (Bebas CORS karena dari server ke server)
        const response = await fetch('https://apo-apps-gateway.alfagift.id/v1/auth/info', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, payload: data.payload || data });
        } else {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
