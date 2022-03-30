const axios = require('axios');
let secrets;

async function getPrimaryTeamId(primaryTeamName, error) {
    const getTeamsRequest = {
        method: 'GET',
        url: `https://api.hubapi.com/settings/v3/users/teams`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${secrets.auth_Authorization}`
        }
    };

    try {
        const response = await axios(getTeamsRequest);
        const primaryTeams = response.data.results ? response.data.results : [];
        const matchingPrimaryTeams = primaryTeams.filter(team => team.name.toLowerCase() === primaryTeamName.toLowerCase());

        if (matchingPrimaryTeams.length > 1) {
            return error(`Multiple teams found for primary team name ${primaryTeamName}`);
        } else if (matchingPrimaryTeams.length === 0) {
            return error(`No teams found for primary team name ${primaryTeamName}`);
        } else {
            return matchingPrimaryTeams[0].id;
        }
    } catch (err) {
        error(`Failed to get Primary Team Id for primary team name ${primaryTeamName}: ${err.message}`);
    }
}

async function getUserRoleId(email, error) {
    const getUsersRequest = {
        method: 'GET',
        url: `https://api.hubapi.com/settings/v3/users`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${secrets.auth_Authorization}`
        }
    };

    try {
        const response = await axios(getUsersRequest);
        const users = response.data.results ? response.data.results : [];
        const matchingUsers = users.filter(user => user.email.toLowerCase() === email.toLowerCase());

        if (matchingUsers.length > 1) {
            return error(`Multiple users found for email ${email}`);
        } else if (matchingUsers.length === 0) {
            return error(`No users found for email ${email}`);
        } else {
            return matchingUsers[0].roleId;
        }
    } catch (err) {
        error(`Failed to get User Role Id for email ${email}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        const primaryTeamName = request.body.primaryTeamName;
        const email = request.body.email;
        const primaryTeamId = await getPrimaryTeamId(primaryTeamName, error);
        // Need to get roleId to include in the request body. If it is not included
        // the role will be removed from the user.
        const roleId = await getUserRoleId(email, error);
        delete request.body.primaryTeamName;
        request.body.primaryTeamId = primaryTeamId;
        request.body.roleId = roleId ? roleId : null;
        callback(request);
    } catch (err) {
        error(`Pre-request script getPrimaryTeamId failed: ${err.message}`);
    }
};
