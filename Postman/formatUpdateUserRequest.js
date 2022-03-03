const axios = require('axios');
let secrets;

async function getUserData(email, error) {
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
        return matchingUser ? matchingUser : error(`Indeterminate amount of users found for email ${email}`);
    } catch (err) {
        error(`Failed to get User Data for email ${email}: ${err.message}`);
    }
}

function formatUpdateUserRequest(postmanUserParams) {
    return {
        "schemas": [
            "urn:ietf:params:scim:schemas:core:2.0:User"
        ],
        "userName": postmanUserParams.userName,
        "name": {
            "givenName": postmanUserParams.firstName,
            "familyName": postmanUserParams.lastName
        },
        "active": true
    }
}


module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        const { email, firstName, lastName } = request.body;
        const userData = await getUserData(email, error);
        const postmanUserParams = {
            userName: email,
            firstName: firstName ? firstName : userData.name.givenName,
            lastName: lastName ? lastName : userData.name.familyName
        };
        request.body = formatUpdateUserRequest(postmanUserParams);
        callback(request);
    } catch (err) {
        error(`Pre-request script formatUpdateUserRequest failed: ${err.message}`);
    }
};
