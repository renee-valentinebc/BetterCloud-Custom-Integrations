const axios = require('axios');
let secrets;

async function getUserId(email, error) {
    const getUsersRequest = {
        method: 'GET',
        url: `https://api.getpostman.com/scim/v2/Users?filter=userName eq '${email}'`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${secrets.auth_Authorization}`
        }
    };

    try {
        const response = await axios(getUsersRequest);
        const users = response.data.Resources ? response.data.Resources : [];

        if (users.length > 1) {
            return error(`Multiple users found for email ${email}`);
        }

        const matchingUser = users.find(user => user.userName ? user.userName.toLowerCase() === email.toLowerCase() : false);
        return matchingUser ? matchingUser.id : error(`Indeterminate amount of users found for email ${email}`);
    } catch (err) {
        error(`Failed to get User Id for email ${email}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        const email = request.body.email;
        const userId = await getUserId(email, error);
        request.url = request.url.replace('{userId}', userId);
        callback(request);
    } catch (err) {
        error(`Pre-request script getUserId failed: ${err.message}`);
    }
};
