const axios = require('axios');
let errorCallback;

const getAuditBoardUserId = async (baseUrl, apiKey, email) => {

    let getUserUrl = `${baseUrl}/Users?filter=email eq "${email}"`

    const getUserRequest = {
        method: 'GET',
        url: getUserUrl,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization":apiKey
        }
    };
    try {
        const response = await axios(getUserRequest);
        const users = response.data.Resources,
            matchingUserArray = users.filter(user => user.email.toLowerCase() === email);

        if(matchingUserArray.length === 1) {
            return matchingUserArray[0].id;
        } else {
            matchingUserArray.length > 1 ?
                errorCallback(`Multiple account found with email ${email}.`) :
                errorCallback(`No accounts found with email ${email}.`);
        }

    } catch (err) {
        errorCallback(`Error finding Insight users. Error: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    let secrets = input.secrets;
    let request = input.request,
        requestBody = request.body,
        email = requestBody.email.toLowerCase().trim();

    let apiKey = secrets["auth_Authorization"],
        baseUrl = secrets["baseUrl"];

    errorCallback = error;

    try {
        const userId = await getAuditBoardUserId(baseUrl, apiKey, email);
        request.url = request.url.replace('{userId}', userId);

        callback(request);
    } catch (err) {
        error(err);
    }
};

