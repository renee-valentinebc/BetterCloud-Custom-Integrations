const axios = require('axios');
let errorCallback;

const userAlreadyExists = async (baseUrl, apiKey, email) => {

    const getUserUrl = `${baseUrl}/Users?filter=email eq "${email}"`

    const getUserRequest = {
        method: 'GET',
        url: getUserUrl,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization':apiKey
        }
    };
    try {
        const response = await axios(getUserRequest);
        const users = response.data.Resources,
            matchingUser = users.find(user => user.email.toLowerCase() === email);
        if (matchingUser)
            errorCallback(`Error: User with email, ${email}, already exists`);

    } catch (err) {
        errorCallback(`Error checking for Insight user. Error: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    let request = input.request,
        requestBody = request.body,
        email = requestBody.email;

    let baseUrl = input.secrets["baseUrl"],
        apiKey = input.secrets["auth_Authorization"];

    errorCallback = error;

    try {
        await userAlreadyExists(baseUrl, apiKey, email);

        callback(input.request);
    } catch (err) {
        console.log(err);
        error(err);
    }
};