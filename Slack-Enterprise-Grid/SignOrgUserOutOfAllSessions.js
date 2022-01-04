const axios = require('axios');
let secrets;
let errorCallback;

const getSlackUserId = async (formattedSlackEmail) => {
    const getSlackUserIdRequest = {
        method: "GET",
        url: `https://api.slack.com/scim/v1/Users?filter=email eq ${formattedSlackEmail}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await axios(getSlackUserIdRequest);
        if (response.status === 200 && response.statusText === "OK") {
            const users = response.data.Resources ? response.data.Resources : []
            if (users.length === 1) {
                console.log(`Found Slack ID ${users[0].id} for user ${formattedSlackEmail}`);
                return users[0].id;
            } else if (users.length > 1) {
                errorCallback(`Multiple Slack users found with username ${formattedSlackEmail}.`);
            } else errorCallback(`No Slack users found with username ${formattedSlackEmail}.`);
        } else {
            errorCallback(`Error occured. Error Code ${response.status}: ${response.statusText}`);
        }
    } catch (err) {
        errorCallback(`Error occurred. Error: ${err}`);
    }
}

function formatResetUserSessionRequest(slackId) {
    return {
        method: 'POST',
        url: `https://slack.com/api/admin.users.session.reset`,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${secrets.auth_Authorization}`
        },
        body: {
            "schemas": [
                "urn:scim:schemas:core:1.0",
                "urn:scim:schemas:extension:enterprise:1.0"
            ],
            "user_id": slackId
        },
    };
}

module.exports = async (input, callback, error) => {
    secrets = input.secrets;
    errorCallback = error;
    const request = input.request,
        requestBody = request.body,
        formattedSlackEmail = requestBody.email ? requestBody.email.toLowerCase() : null;

    try {
        const slackId = await getSlackUserId(formattedSlackEmail);
        const resetUserSessionRequest = formatResetUserSessionRequest(slackId);
        callback(resetUserSessionRequest);
    } catch (err) {
        errorCallback(`Error occurred: ${err}`);
    }
};