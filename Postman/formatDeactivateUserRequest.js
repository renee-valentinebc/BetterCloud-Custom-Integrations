function formatDeactivateUserRequest() {
    return {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [{
            "op": "replace",
            "value": {
                "active": false
            }
        }]
    }
}

module.exports = function (input, callback) {
    const request = input.request;
    request.body = formatDeactivateUserRequest();
    callback(request);
};