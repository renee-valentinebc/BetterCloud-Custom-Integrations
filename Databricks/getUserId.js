const axios = require('axios');
let secrets;
let errorCallback;
let apiToken;

const getUserId = async (nameOfUser) => {
    const request = {
        method: "GET",
        url: `${secrets.domain}/2.0/preview/scim/v2/Users?filter=userName+eq+${nameOfUser}`,
        headers: {
            'Accept': 'application/scim+json',
            'Content-Type': 'application/scim+json',
            'Authorization': `${apiToken}`
        }
    };

    try {
        const response = await axios(request);
        const users = response.data.Resources.filter(user => user.userName === nameOfUser);
        if (users.length > 1) {
            errorCallback(`Multiple users exist for that username: ${nameOfUser}`)
        }
        else if (users.length === 1) {
            return users[0].id;
        }
        else {
            errorCallback(`No userId returned for that user's email: ${nameOfUser}`);
        }
    } catch (err) {
        errorCallback(`Error finding user in that organization. Error: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    secrets = input.secrets;
    let request = input.request;
    let name = request.body.nameOfUser;
    let url = request.url;
    apiToken = secrets.auth_Authorization;
    errorCallback = error;
    try {
        const userId = await getUserId(name);
        const deleteUrlEndpoint = url.replace('{id}', userId);
        request.url = deleteUrlEndpoint;
        callback(request);
    } catch (err) {
        errorCallback(err);
    }
};
