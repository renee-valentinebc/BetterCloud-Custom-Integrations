module.exports = async (input, callback, error) => {
    try {
        const request = input.request,
            requestBody = request.body,
            email = requestBody.email
        request.body = [{
            "user" : email,
            "requestID": "action",
            "do" : [{
                "remove": "all"
            }]
        }];
        callback(input.request);
    } catch (err) {
        error(`Error: Failed to Remove User From All Groups. ${err.message}`);
    }
};