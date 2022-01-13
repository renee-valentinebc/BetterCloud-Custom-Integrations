module.exports = async (input, callback, error) => {
    try {
        const request = input.request,
            requestBody = request.body,
            email = requestBody.email
        request.body = [{
            "user" : email,
            "requestID": "action",
            "do": [{
            "removeFromOrg": {
                "deleteAccount": false
            }
        }]
    }];
        callback(input.request);
    } catch (err) {
        error(`Error: Failed to add user. ${err.message}`);
    }
};