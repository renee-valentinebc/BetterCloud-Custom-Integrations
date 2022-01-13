module.exports = async (input, callback, error) => {
    try {
        const request = input.request,
            requestBody = request.body,
            email = requestBody.email,
            groupName = requestBody.groupName
        request.body = [{
            "user" : email,
            "requestID": "action",
            "do" : [{
                "add": {
                    "group": [
                        groupName
                    ]
                }
            }]
        }];
        callback(input.request);
    } catch (err) {
        error(`Error: Failed to add user to group. ${err.message}`);
    }
};