const axios = require('axios');

const getOrganizationId = async (organizationName, auth, domain, error) => {
    try {
        let getOrganizationsRequest = {
            method: 'GET',
            url: `https://${domain}/api/v2/organizations?page[size]=100`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        };
        let matchingOrganization;
        while (!matchingOrganization) {
            const response = await axios(getOrganizationsRequest);
            const organizations = response.data.organizations;
            matchingOrganization = organizations.find(organization => organization.name.toLowerCase().trim() === organizationName.toLowerCase().trim());

            if (response.data.meta.has_more) {
                getOrganizationsRequest.url = response.data.links.next;
            }
        }
        if (!matchingOrganization) {
            error(`No organizations found with name ${organizationName}`);
        } else {
            return matchingOrganization.id;
        }
    } catch (err) {
        error(`Failed to get Organization ID for organization with name "${organizationName}": ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        let secrets = input.secrets;
        const auth = new Buffer.from(`${secrets.auth_username}:${secrets.auth_password}`).toString('base64');
        const organizationId = await getOrganizationId(request.body.organizationName, auth, secrets.domain, error);
        const newBody = {
            organization_membership: {
                organization_id: organizationId
            }
        };
        request.body = newBody;
        callback(request);
    } catch (err) {
        error(`getOrganizationId pre request script failed: ${err}`);
    }

};
