const axios = require('axios');

const getCustomRoleId = async (customRoleName, auth, domain, error) => {
    try {
        const getCustomRolesRequest = {
            method: 'GET',
            url: `https://${domain}/api/v2/custom_roles.json`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        };

        const response = await axios(getCustomRolesRequest);
        const customRoles = response.data.custom_roles;
        const matchingRoles = customRoles.filter(role => role.name.toLowerCase().trim() === customRoleName.toLowerCase().trim());

        if (matchingRoles.length > 1) {
            error(`More than 1 role was found with name ${customRoleName}`);
        } else if (matchingRoles.length === 0) {
            error(`No roles found with name ${customRoleName}`);
        } else {
            return matchingRoles[0].id;
        }

    } catch (err) {
        error(`Failed to get Custom Role ID for role with name "${customRoleName}": ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        let secrets = input.secrets;
        const auth = new Buffer.from(`${secrets.auth_username}:${secrets.auth_password}`).toString('base64');
        const customRoleId = await getCustomRoleId(request.body.customRoleName, auth, secrets.domain, error);
        let newBody = {
            user: {
                custom_role_id: customRoleId
            }
        };
        request.body = newBody;
        callback(request);
    } catch (err) {
        error(`getCustomRoleId pre request script failed: ${err}`);
    }
};
