const axios = require('axios');
let secrets;
let authKey;

async function getUserId(email, error) {
    try {
        const getUsersRequest = {
            method: 'GET',
            url: `https://api.harvestapp.com/v2/users`,
            headers: {
                'Authorization': `${authKey}`,
                'Harvest-Account-Id': `${secrets.accountId}`
            }
        };
        let matchingUserId = null;
        while (!matchingUserId) {
            const response = await axios(getUsersRequest);
            const users = response.data.users ? response.data.users : [];

            const matchingUsers = users.filter(user => user.email ? user.email.toLowerCase() === email.toLowerCase() : false);

            if (matchingUsers.length > 1) {
                return error(`Multiple users found for email ${email}`);
            } else if (matchingUsers.length === 0) {
                const nextPageURL = response.data.links.next;
                if (nextPageURL) {
                    getUsersRequest.url = nextPageURL;
                } else {
                    return error(`No users found for email ${email}`);
                }
            } else {
                matchingUserId = matchingUsers[0].id;
            }
        }
        return matchingUserId;
    } catch (err) {
        error(`Failed to get user Id for email ${email}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        authKey = secrets.auth_Authorization;
        const request = input.request;
        const email = request.body.currentEmail.toLowerCase();
        let userId = await getUserId(email, error);
        request.url = request.url.replace('{userId}', userId);
        callback(request);
    } catch (err) {
        error(`Pre-request script getUserId failed: ${err.message}`);
    }
};
