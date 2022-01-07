module.exports = async(input, callback, error) => {
    try {
        const request = input.request;
        request.body.Email = request.body.newEmail ? request.body.newEmail : request.body.Email;
        delete request.body.newEmail;
        callback(request);
    } catch (err) {
        error(`Pre-request script injectNewEmail failed: ${err.message}`);
    }
};