const axios = require('axios');
let secrets;
let errorCallback;
let apiToken;

const getUserId = async (email) => {
    const request = {
        method: "GET",
        url: `https://api.contentful.com/organizations/${secrets.organizationId}/users?query=${email}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            'Authorization': `${apiToken}`
        }
    }

    try {
        const response = await axios(request);
        const users = response.data.items;
        if (users.length > 1) {
            errorCallback(`Multiple users exist for that email: ${email}`)
        }
        else if (users.length === 1) {
            return users[0].sys.id;
        }
        else {
            errorCallback(`No userId returned for that user's email: ${email}`);
        }
    } catch (err) {
        errorCallback(`Error finding user in that organization. Error: ${err}`);
    }
};

const getSpaceIdAndSpaceMembershipId = async (id, spaceName) => {
    const getMembershipFromSpace = {
        method: "GET",
        url: `https://api.contentful.com/organizations/${secrets.organizationId}/space_memberships?sys.space.name[eq]=${spaceName}&sys.user.sys.id[eq]=${id}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            'Authorization': `${apiToken}`
        }
    }

    try {
        const response = await axios(getMembershipFromSpace);
        const spaceMembership = response.data.items;
        let urlFillers = [spaceMembership[0].sys.space.sys.id, spaceMembership[0].sys.id]
        if (spaceMembership.length === 1) {
            return urlFillers;
        }
        else {
            errorCallback(`Indeterminate amount of space memberships found for this user's id: ${id}`)
        }
    } catch (err) {
        errorCallback(`Error finding spaceId and spaceMembershipId. Error: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    secrets = input.secrets;
    let request = input.request,
        requestBody = request.body,
        email = requestBody.email.toLowerCase().trim(),
        spaceName = requestBody.spaceName;
    let url = request.url;
    apiToken = secrets.auth_Authorization;
    errorCallback = error;
    try {
        const userId = await getUserId(email);
        const spaceIdAndSpaceMembershipId = await getSpaceIdAndSpaceMembershipId(userId, spaceName);
        const deleteUrlEndpoint = url.replace('{spaceId}', spaceIdAndSpaceMembershipId[0]).replace('{spaceMembershipId}', spaceIdAndSpaceMembershipId[1]);
        request.url = deleteUrlEndpoint;
        callback(request);
    } catch (err) {
        errorCallback(`getSpaceIdAndMemId pre-request failed: ${err}`);
    }
};
