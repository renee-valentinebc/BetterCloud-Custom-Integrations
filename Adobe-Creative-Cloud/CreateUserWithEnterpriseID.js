module.exports = async (input, callback, error) => {
    try {
        const request = input.request,
            requestBody = request.body,
            email = requestBody.email,
            firstName = requestBody.firstName,
            lastName = requestBody.lastName;
        request.body = [{
            "user" : email,
            "requestID": "action",
            "do" : [{
                "createEnterpriseID": {
                    "email": email,
                    "country": "US",
                    "firstname": firstName,
                    "lastname": lastName,
                    "option": "ignoreIfAlreadyExists"
                }
            }]
        }];
        callback(input.request);
    } catch (err) {
        error(`Error: Failed to Create Enterprise ID. ${err.message}`);
    }
};