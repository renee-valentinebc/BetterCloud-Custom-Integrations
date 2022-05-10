module.exports = function(input, callback, error) {
    try {
        const {request} = input;

        const userEmail = request.body.userEmail;
        request.url = request.url.replace('{userEmail}', userEmail);
    } catch (e){
        error(`Error replacing {userEmail} in URL. Error: ${e}`);
    }
    callback(request);
};