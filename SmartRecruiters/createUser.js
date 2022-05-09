const axios = require('axios');
let secrets;
let errorCallback;
const postSmartRecruitersAccessToken = async () => {
    const requestAccessToken = {
        method: "POST",
        url: `https://api.smartrecruiters.com/identity/oauth/token`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `grant_type=client_credentials&client_id=${secrets.clientID}&client_secret=${secrets.clientSecret}`
    };
    try {
        const response = await axios(requestAccessToken);
        const accessToken = response.data.access_token;
        if (accessToken)
            return accessToken;
        else
            errorCallback(`Access token could not be created with the clientId and clientSecret combination given ${secrets.clientSecret} & ${secrets.clientID}.`);
    } catch (err) {
        errorCallback(`Error creating access token from Smart Recruiters. Error: ${err}`);
    }
};



module.exports = async (input, callback, error) => {
    secrets = input.secrets;
    let randomstring = "A!" + Math.random().toString(36).slice(-6);

    let request = input.request,
        requestBody = request.body,
        email = requestBody.email,
        firstName = requestBody.firstName,
        lastName = requestBody.lastName;
    errorCallback = error;
    try {
        const accessToken = await postSmartRecruitersAccessToken();
        input.request.headers = {
            "Authorization": `Bearer ${accessToken}`
        }
        input.request.body = {
            "email": `${email}`,
            "firstName": `${firstName}`,
            "lastName": `${lastName}`,
            "systemRole": {
            "id": "EMPLOYEE"
            },
            "ssoIdentifier": `${email.split("@")[0].toString()}`,
            "ssoLoginMode": "SSO",
            "password": `${randomstring}`
        };
        callback(request);
    } catch (err) {
        errorCallback(err);
    }
};