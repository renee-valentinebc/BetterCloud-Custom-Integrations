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

const getUserId = async (email, accessToken) => {
    const getUserIdRequest = {
        method: "GET",
        url: `https://api.smartrecruiters.com/user-api/v201804/users?q=${email}`, // 1st pre
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    };
    try {
        const response = await axios(getUserIdRequest);
        const users = response.data.content;
        const matchingUser = users.filter(user => user.email.toLowerCase() === email.toLowerCase());
            return matchingUser[0].id;
    } catch (err) {
        errorCallback(`Error finding user. Error: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    secrets = input.secrets;
    let request = input.request,
        requestBody = request.body,
        email = requestBody.email,
        emailAddress = email.substring(0, email.indexOf("@"));
    errorCallback = error;
    try {
        const accessToken = await postSmartRecruitersAccessToken();
        const userId = await getUserId(email, accessToken)
        request.url = request.url.replace('{id}', userId);
        request.headers = {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json-patch+json"
        };
        request.body = [
            {
                "op": "add",
                "path": "/ssoIdentifier",
                "value": emailAddress // firstName.lastName
            }
        ];
        callback(request);
    } catch (err) {
        errorCallback(err);
    }
};