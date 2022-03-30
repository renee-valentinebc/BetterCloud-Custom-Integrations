const axios = require('axios');
let secrets;
let errorCallback;
let apiToken;

const getUserId = async (email) => {
    const request = {
        method: "GET",
        url: `https://api.contentful.com/organizations/${secrets.organizationId}/users?email[match]=${email}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            'Authorization': `${apiToken}`
        }
    };

    try {
        const response = await axios(request);
        const users = response.data.items.filter(user => user.email === email);
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

const getUserOrgMemberships = async (id) => {
    const request = {
        method: "GET",
        url: `https://api.contentful.com/organizations/${secrets.organizationId}/organization_memberships?sys.user.sys.id[eq]=${id}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            'Authorization': `${apiToken}`
        }
    };

    try {
        const response = await axios(request);
        const orgMembership = response.data.items;
        const matchingOrgMembership = orgMembership[0];
        if (orgMembership.length > 1) {
            errorCallback(`Multiple org memberships returned for user's email: ${email}`)
        }
        else if (matchingOrgMembership) {
            return matchingOrgMembership.sys.id;
        }
        else {
            errorCallback(`No organizationMembershipId returned for that user's email: ${email}`);
        }
    } catch (err) {
        errorCallback(`Error finding user in that organization. Error: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    secrets = input.secrets;
    let request = input.request;
    let email = request.body.email;
    let url = request.url;
    apiToken = secrets.auth_Authorization;
    errorCallback = error;
    try {
        const userId = await getUserId(email);
        const orgMembershipId = await getUserOrgMemberships(userId)
        const deleteUrlEndpoint = url.replace('{organizationMembershipId}', orgMembershipId);
        request.url = deleteUrlEndpoint;
        callback(request);
    } catch (err) {
        errorCallback(err);
    }
};