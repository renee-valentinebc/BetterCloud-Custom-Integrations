const axios = require('axios');
let secrets;

async function getSecondaryTeamIds(secondaryTeamNames, error) {
    try {
        const teams = await getTeams(error);
        let secondaryTeamIds = secondaryTeamNames.map((teamName) => {
            let teamId = teams[teamName];
            if (teamId !== undefined) {
                return teamId;
            } else {
                return error(`No team with team name ${teamName}`);
            }
        });

        return secondaryTeamIds;
    } catch (err) {
        error(`Failed to get Secondary Team Ids for secondary team names ${secondaryTeamNames}: ${err.message}`);
    }
}

function mapTeams(teams) {
    let teamMap = {};

    if (teams.length === 0) { return teamMap};

    teamMap = teams.reduce((map, team) => {
        map[team.name] = team.id;
        return map;
    }, teamMap);

    return teamMap;
}

async function getTeams(error) {
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
        const teams = response.data.results ? response.data.results : [];
        return mapTeams(teams);
    } catch (err) {
        error(`Failed to get teams: ${err.message}`);
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
        let matchingUserRoleId = null;
        while (!matchingUserRoleId) {
            const response = await axios(getUsersRequest);
            const users = response.data.results ? response.data.results : [];

            const matchingUsers = users.filter(user => user.email ? user.email.toLowerCase() === email.toLowerCase() : false);

            if (matchingUsers.length > 1) {
                return error(`Multiple users found for email ${email}`);
            } else if (matchingUsers.length === 0) {
                const nextPageURL = response.data.paging.next.link;
                if (nextPageURL) {
                    getUsersRequest.url = nextPageURL;
                } else {
                    return error(`No users found for email ${email}`);
                }
            } else {
                matchingUserRoleId = matchingUsers[0].roleId;
            }
        }
        return matchingUserRoleId;
    } catch (err) {
        error(`Failed to get User Role Id for email ${email}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        // Need to split the secondary team names as they come in as a comma separated string Ex: "team1,team2"
        const secondaryTeamNames = request.body.secondaryTeamNames.split(',');
        const secondaryTeamIds = await getSecondaryTeamIds(secondaryTeamNames, error);
        delete request.body.secondaryTeamNames;
        request.body.secondaryTeamIds = secondaryTeamIds;
        // Need to get roleId to include in the request body. If it is not included
        // the role will be removed from the user.
        const email = request.body.email;
        const roleId = await getUserRoleId(email, error)
        request.body.roleId = roleId ? roleId : null;
        callback(request);
    } catch (err) {
        error(`Pre-request script getSecondaryTeamIds failed: ${err.message}`);
    }
};
