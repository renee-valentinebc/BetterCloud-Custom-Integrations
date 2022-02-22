const axios = require('axios');

const getUserId = async (userEmail, authKey, error) => {
    try {
        const getUsersRequest = {
            method: 'GET',
            url: `https://api.alertmedia.com/api/users?email=${userEmail}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authKey}`
            }
        }

        const response = await axios(getUsersRequest);
        const users = response.data ? response.data : [];
        const matchingUsers = users.filter(user => user ? user.email.toLowerCase() === userEmail.toLowerCase() : false);

        if (matchingUsers.length > 1) {
            return error(`Multiple users found for user with email ${userEmail}`);
        } else if (matchingUsers.length === 0) {
            return error(`No users found for user with email ${userEmail}`);
        }

        return matchingUsers[0].id;
    } catch (err) {
        return error(`Failed to get user ID: ${err.message}`);
    }
}

module.exports = async (input, callback, error) => {
    const request = input.request;
    const encodedAuthKey = new Buffer.from(`${input.secrets.auth_username}:${input.secrets.auth_password}`).toString('base64');

    try {
        const userId = await getUserId(request.body.email, encodedAuthKey, error);
        request.url = request.url.replace('{userId}', userId);
        callback(request);
    } catch (err) {
        error(`Get User ID Pre request script failed: ${err.message}`);
    }
};
