module.exports = async (input, callback, error) => {
    const request = input.request;
    try {
        // BetterCloud sends null values when fields are left blank, which means that Alert Media will null
        // out any fields that a user did not fill out in the action form field
        // Therefore, we have to build up a new request body with fields that were filled out
        let newBody = {};

        for (const property in request.body) {
            if (request.body[property]) {
                newBody[property] = request.body[property];
            }
        }
        // The newEmail property will only exist in newBody if a new email value was input into the initial payload
        // We replace the email property with the new email value and then remove that key-value pair from newBody
        if (newBody.newEmail) {
            newBody.email = newBody.newEmail;
            delete newBody.newEmail;
        }
        request.body = newBody;
        callback(request);
    } catch (err) {
        error(`Build New Request Body Pre Request for Edit User Action failed: ${err.message}`);
    }
}