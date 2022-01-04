const axios = require('axios');
let secrets;
let errorCallback;

const getSlackUserId = async (formattedSlackEmail) => {
    const getSlackUserIdRequest = {
        method: "GET",
        url: `https://api.slack.com/scim/v1/Users?filter=email eq ${formattedSlackEmail}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await axios(getSlackUserIdRequest);
        if (response.status === 200 && response.statusText === "OK") {
            const users = response.data.Resources ? response.data.Resources : []
            if (users.length === 1) {
                console.log(`Found Slack ID ${users[0].id} for user ${formattedSlackEmail}`);
                return users[0].id;
            } else if (users.length > 1) {
                errorCallback(`Multiple Slack users found with username ${formattedSlackEmail}.`);
            } else errorCallback(`No Slack users found with username ${formattedSlackEmail}.`);
        } else {
            errorCallback(`Error occured. Error Code ${response.status}: ${response.statusText}`);
        }
    } catch (err) {
        errorCallback(`Error occurred. Error: ${err}`);
    }
}

const getSlackWorkspaceId = async (formattedWorkspaceName) => {
    const getWorkspaceRequest = {
        method: "POST",
        url: `https://slack.com/api/admin.teams.list`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(getWorkspaceRequest);
        const workspaces = response.data.teams,
            matchingWorkspaces = workspaces.filter(workspace => workspace.name ? workspace.name.toLowerCase() === formattedWorkspaceName : false);
        if (matchingWorkspaces.length === 1) {
            return matchingWorkspaces[0].id;
        } else if (matchingWorkspaces.length > 1) {
            errorCallback(`More than one workspace found with name ${formattedWorkspaceName}`);
        } else errorCallback(`No workspace found with name ${formattedWorkspaceName}`);
    } catch (err) {
        errorCallback(`Error occurred: ${err}`);
    }
}

function formatAssignUserToWorkspaceRequest(userId, workspaceId) {
    return {
        method: "POST",
        url: `https://slack.com/api/admin.users.assign`,
        headers: {
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: {
            "user_id": userId,
            "team_id": workspaceId
        }
    }
}

module.exports = async (input, callback, error) => {
    secrets = input.secrets;
    errorCallback = error;
    const request = input.request,
        requestBody = request.body,
        formattedSlackEmail = requestBody.email ? requestBody.email.toLowerCase() : null,
        formattedSlackWorkspaceName = requestBody.workspaceName ? requestBody.workspaceName.toLowerCase() : null;

    try {
        const userId = await getSlackUserId(formattedSlackEmail);
        const workspaceId = await getSlackWorkspaceId(formattedSlackWorkspaceName);
        const assignUserToWorkspaceRequest = formatAssignUserToWorkspaceRequest(userId, workspaceId);
        callback(assignUserToWorkspaceRequest);
    } catch (err) {
        errorCallback(`Error occurred: ${err}`);
    }
};