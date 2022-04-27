const axios = require('axios');

const getAccessToken = async (secrets, error) => {
    try {
        const params = {
            'grant_type': 'password',
            'client_id': secrets.clientId,
            'client_secret': secrets.clientSecret,
            'username': secrets.username,
            'password': `${secrets.password}${secrets.securityToken}`
        };

        const bodyFormData = Object.entries(params).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');

        const getTokenRequest = {
            method: "POST",
            url: `https://${secrets.domain}.my.salesforce.com/services/oauth2/token`,
            data: bodyFormData,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }

        const response = await axios(getTokenRequest);
        return response.data.access_token;
    } catch (err) {
        error(`Error retrieving access token: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        const token = await getAccessToken(input.secrets, error);
        request.headers["Authorization"] = `Bearer ${token}`;
        callback(request);
    } catch (err) {
        error(`Get Access Token Pre Request script failed: ${err}`);
    }
};



