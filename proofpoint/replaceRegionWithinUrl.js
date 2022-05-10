module.exports = function(input, callback, error) {
    try {
        const {request} = input;

        const region = request.body.region;
        request.url = request.url.replace('{region}', region);

        delete request.body.region;
    } catch (e) {
        error(`Error inserting region into URL. Error: ${e}`);
    }

    callback(request);
};