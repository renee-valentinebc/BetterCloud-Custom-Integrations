let secrets;

module.exports = async (input, callback, error) => {
    try {
        const request = input.request;
        secrets = input.secrets;
        request.headers.Authorization = `Bearer ${secrets.adminAPIKey}`;

        callback(request);
    } catch (err) {
        error(`Pre-request script "Inject Admin API Key" failed: ${err.message}`);
    }
};