module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        let newBody = {
            user: {
                custom_role_id: null
            }
        };
        request.body = newBody;
        callback(request);
    } catch (err) {
        error(`formatUnassignCustomRole pre request script failed: ${err}`);
    }
};
