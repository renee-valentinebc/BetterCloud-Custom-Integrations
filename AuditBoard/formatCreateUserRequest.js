const axios = require('axios');
let errorCallback;

function formatCreateOrgUserRequest(baseUrl, apiKey, requestBody) {
    const formattedRequest = {
        method: 'POST',
        url: baseUrl + "/Users",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": apiKey
        },
        body: {
            "schemas": [
                "urn:ietf:params:scim:schemas:core:2.0:User"
            ],
            "emails": [
                {
                    "value": requestBody.email,
                    "type": "work",
                    "primary": true
                }
            ],
            "name": {
                "givenName": requestBody.givenName,
                "familyName": requestBody.familyName
            },
            "title":requestBody.title
        }
    }
    if(requestBody.userName){
        formattedRequest.body.userName = requestBody.userName;
    }
    if(requestBody.roleId){
        formattedRequest.body.roles = [{
            "value": requestBody.roleId,
            "primary": true
        }];
    }
    return(formattedRequest);
}

module.exports = async (input, callback, error) => {
    let request = input.request,
        requestBody = request.body;

    let baseUrl = input.secrets["baseUrl"],
        apiKey = input.secrets["auth_Authorization"];

    errorCallback = error;

    try {

        input.request = formatCreateOrgUserRequest(baseUrl, apiKey, requestBody);
        callback(input.request);

    } catch (err) {
        error(err);
    }
};