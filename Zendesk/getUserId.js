const axios = require('axios');

const getUserId = async (email, auth, domain, error) => {
    try {
        const getUsersRequest = {
            method: 'GET',
            url: `https://${domain}/api/v2/users/search.json?query=type:user "${email}"`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        };

        const response = await axios(getUsersRequest);
        const users = response.data.users;
        const matchingUsers = users.filter(user => user.email.toLowerCase().trim() === email.toLowerCase().trim());

        if (matchingUsers.length > 1) {
            error(`More than 1 user was found with email ${email}`);
        } else if (matchingUsers.length === 0) {
            error(`No users found with email ${email}`);
        } else {
            return matchingUsers[0].id;
        }

    } catch (err) {
        error(`Failed to get User ID for user with email "${email}": ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        let secrets = input.secrets;
        const auth = new Buffer.from(`${secrets.auth_username}:${secrets.auth_password}`).toString('base64');
        const userId = await getUserId(request.body.email, auth, secrets.domain, error);
        delete request.body.email;
        request.url = request.url.replace('{userId}', userId);
        callback(request);
    } catch (err) {
        error(`getUserId pre request script failed: ${err}`);
    }

};
