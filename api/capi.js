const crypto = require('crypto');

module.exports = async function handler(req, res) {
    // Only allow POST requests for sending events
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { event_name, event_url, user_data } = req.body;
    
    // Meta CAPI Credentials
    const PIXEL_ID = '949207904646111';
    const ACCESS_TOKEN = 'EAANxZBmUZA95sBRe6ucrq4UQ6I0xZCOuKEiZB6W5ZAvbb0Sp78d6cb62UDLpZCel0HPB9Y6jIojLB6rfocuG4owTgKgeYyrZAn7RZBmK3vxbZByU4ciqvcwqcvRkIDuhUThTV7HUmUxm7JFWdELRhoupo9LrtDX4VDIZBYlDjbTUbuN79mMWqz6WL4p6NVOIX6bgZDZD';

    // Helper to securely hash user data (SHA-256) as required by Meta
    const hash = (val) => val ? crypto.createHash('sha256').update(val.toLowerCase().trim()).digest('hex') : undefined;

    // Formatting User Data payload for Meta
    const formattedUserData = {
        client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        client_user_agent: req.headers['user-agent'],
    };

    // Include hashed email, phone, and name if provided
    if (user_data) {
        if (user_data.email) formattedUserData.em = hash(user_data.email);
        if (user_data.phone) formattedUserData.ph = hash(user_data.phone.replace(/\D/g, ''));
        if (user_data.name) {
            const parts = user_data.name.split(' ');
            formattedUserData.fn = hash(parts[0]);
            if (parts.length > 1) formattedUserData.ln = hash(parts[parts.length - 1]);
        }
    }

    const payload = {
        data: [
            {
                event_name: event_name || 'Lead',
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: event_url || req.headers.referer || 'https://www.yourwebsite.com',
                action_source: 'website',
                user_data: formattedUserData,
            }
        ]
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        return res.status(200).json({ success: true, result });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
