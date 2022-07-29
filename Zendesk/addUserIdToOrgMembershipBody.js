module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        const url = request.url;
        const userId = url.split('/')[6];
        request.body.organization_membership.user_id = userId;
        callback(request);
    } catch (err) {
        error(`addUserIdToOrgMembershipBody pre request script failed: ${err}`);
    }
};