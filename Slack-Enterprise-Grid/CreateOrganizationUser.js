let secrets;

function formatCreateOrgUserRequest(slackUserParams) {
    return {
        method: 'POST',
        url: `https://api.slack.com/scim/v1/Users`,
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
            "userName": slackUserParams.userName,
            "name": {
                "familyName": slackUserParams.lastName,
                "givenName": slackUserParams.firstName
            },
            "displayName": slackUserParams.displayName,
            "emails": [
                {
                    "value": slackUserParams.email,
                    "type": "work",
                    "primary": true
                }
            ]
        }
    }
}

module.exports = function(input, callback) {
    secrets = input.secrets;
    const request = input.request,
        requestBody = request.body,
        slackUserParams = {
            userName: requestBody.userName,
            lastName: requestBody.lastName,
            firstName: requestBody.firstName,
            displayName: requestBody.displayName,
            email: requestBody.email
        },
        createSlackOrgUserRequest = formatCreateOrgUserRequest(slackUserParams);
    callback(createSlackOrgUserRequest);
};