const axios = require('axios');
let secrets;

async function getRoleId(roleName, error) {
    const getRolesRequest = {
        method: 'GET',
        url: `https://api.hubapi.com/settings/v3/users/roles`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${secrets.auth_Authorization}`
        }
    };

    try {
        const response = await axios(getRolesRequest);
        const roles = response.data.results ? response.data.results : [];
        const matchingRoles = roles.filter(role => role.name.toLowerCase() === roleName.toLowerCase());

        if (matchingRoles.length > 1) {
            return error(`Multiple roles found for role name ${roleName}`);
        } else if (matchingRoles.length === 0) {
            return error(`No roles found for role name ${roleName}`);
        } else {
            return matchingRoles[0].id;
        }
    } catch (err) {
        error(`Failed to get Role Id for role name ${roleName}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        const roleName = request.body.roleName;
        const roleId = await getRoleId(roleName, error);
        delete request.body.roleName;
        request.body.roleId = roleId;
        callback(request);
    } catch (err) {
        error(`Pre-request script getRoleId failed: ${err.message}`);
    }
};
