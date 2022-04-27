const axios = require('axios');
let secrets;

async function getUserId(email, token, error) {
    const getUsersRequest = {
        method: 'GET',
        url: `https://${secrets.domain}.my.salesforce.com/services/data/v54.0/query?q=SELECT+Id,email+FROM+User+WHERE+email='${email}'`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        }
    };

    try {
        const response = await axios(getUsersRequest);
        const users = response.data.records ? response.data.records : [];

        if (users.length > 1) {
            return error(`Multiple users found for email ${email}`);
        }

        const matchingUser = users.find(user => user.Email ? user.Email.toLowerCase() === email.toLowerCase() : false);
        return matchingUser ? matchingUser.Id : error(`Indeterminate amount of users found for email ${email}`);
    } catch (err) {
        error(`Failed to get User Id for email ${email}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        const email = request.body.Email;
        const userId = await getUserId(email, input.request.headers.Authorization, error);
        request.url = request.url.replace('{userId}', userId);
        callback(request);
    } catch (err) {
        error(`Pre-request script getUserId failed: ${err.message}`);
    }
};
