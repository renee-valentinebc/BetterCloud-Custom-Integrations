const axios = require('axios');
let secrets;

async function getUserData(email, error) {
    const getUsersRequest = {
        method: 'GET',
        url: `https://api.litmos.com/v1.svc/users?source=bettercloud&format=json&search=${email}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'apikey': `${secrets.auth_apikey}`
        }
    };

    try {
        const response = await axios(getUsersRequest);
        const users = response.data ? response.data : [];

        if (users.length > 1) {
            return error(`Multiple users found for email ${email}`);
        }

        const matchingUser = users.find(user => user.Email || user.UserName ? user.Email.toLowerCase() === email.toLowerCase() || user.UserName === email.toLowerCase() : false);
        return matchingUser ? matchingUser : error(`Indeterminate amount of users found for email ${email}`);
    } catch (err) {
        error(`Failed to get user data for email ${email}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        const userEmail = request.body.Email;
        const userData = await getUserData(userEmail, error);
        request.url = request.url.replace('{userId}', userData.Id);

        for (let key in userData) {
            request.body[key] = request.body[key] && request.body[key] !== null ? request.body[key] : userData[key];
        }

        callback(request);
    } catch (err) {
        error(`Pre-request script injectUserData failed: ${err.message}`);
    }
};
