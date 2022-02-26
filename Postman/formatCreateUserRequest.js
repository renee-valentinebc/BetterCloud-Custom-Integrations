let secrets;

function formatCreateUserRequestBody(postmanUserParams) {
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

module.exports = function (input, callback) {
    secrets = input.secrets;
    const request = input.request,
        requestBody = request.body,
        postmanUserParams = {
            userName: requestBody.email,
            lastName: requestBody.lastName,
            firstName: requestBody.firstName
        };
    request.body = formatCreateUserRequestBody(postmanUserParams);
    callback(request);
};
