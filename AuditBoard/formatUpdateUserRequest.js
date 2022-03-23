const axios = require('axios');
let errorCallback;

function formatUpdateUserRequest(requestUrl, apiKey, requestBody) {
    let updateUserRequest = {
        method: "PUT",
        url: requestUrl,
        headers: {
            "Authorization": apiKey
        },
        body: {
            schemas: [
                "urn:ietf:params:scim:schemas:core:2.0:User"
            ],
            name:{}
        }
    }

    updateUserRequest.body.emails = [{"value": requestBody.email}];

    updateUserRequest.body.name.givenName = requestBody.givenName
    updateUserRequest.body.name.familyName = requestBody.familyName

    if(requestBody.userName){
        updateUserRequest.body.userName = requestBody.userName;
    }

    if(requestBody.title){
        updateUserRequest.body.title = requestBody.title;
    }

    if(requestBody.roleId){
        updateUserRequest.body.group = requestBody.roleId;
    }

    return (updateUserRequest);
}

module.exports = async (input, callback, error) => {
    let secrets = input.secrets;
    let request = input.request,
        requestBody = request.body,
        requestUrl = request.url;

    let apiKey = secrets["auth_Authorization"];

    errorCallback = error;

    try {
        let newRequest = formatUpdateUserRequest(requestUrl, apiKey, requestBody);

        callback(newRequest);
    } catch (err) {
        error(err);
    }
};

