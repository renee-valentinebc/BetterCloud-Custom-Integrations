const axios = require('axios');
let secrets;
let errorCallback;

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
            console.log(`Found Slack Workspace ID: ${matchingWorkspaces[0].id}`);
            return matchingWorkspaces[0].id;
        } else if (matchingWorkspaces.length > 1) {
            errorCallback(`More than one workspace found with name ${formattedWorkspaceName}`);
        } else errorCallback(`No workspace found with name ${formattedWorkspaceName}`);
    } catch (err) {
        errorCallback(`Error occurred: ${err}`);
    }
}

const getSlackChannelId = async (formattedChannelName, workspaceId) => {
    const getChannelRequest = {
        method: "POST",
        url: 'https://slack.com/api/admin.conversations.search',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        },
        data: {
            "query": formattedChannelName,
            "team_ids": [workspaceId]
        }
    };
    try {
        const response = await axios(getChannelRequest);
        if (response.data.ok === true) {
            const conversations = response.data.conversations,
                matchingConversations = conversations.filter(conversation => conversation.name ? conversation.name.toLowerCase() === formattedChannelName : false);
            if (matchingConversations.length === 1) {
                console.log(`Found Slack Channel ID: ${matchingConversations[0].id}`);
                return matchingConversations[0].id;
            } else if (matchingConversations.length > 1) {
                errorCallback(`More than one channel found with name ${formattedChannelName}`);
            } else errorCallback(`No channel found with name ${formattedChannelName}`);
        } else errorCallback(`Error retrieving Channel ID. Error: ${err}`);
    } catch (err) {
        errorCallback(`Error retrieving Channel ID. Error: ${JSON.stringify(err)}`);
    }
};

function formatArchiveChannelRequest(channelId) {
    return {
        method: "POST",
        url: "https://slack.com/api/admin.conversations.archive",
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        },
        body: {
            channel_id: channelId
        }
    }
}

module.exports = async (input, callback, error) =>{
    secrets = input.secrets;
    errorCallback = error;
    const request = input.request,
        requestBody = request.body,
        formattedSlackWorkspaceName = requestBody.workspaceName ? requestBody.workspaceName.toLowerCase() : null,
        formattedSlackChannelName = requestBody.channelName ? requestBody.channelName.toLowerCase() : null;

    try {
        const workspaceId = await getSlackWorkspaceId(formattedSlackWorkspaceName);
        const channelId = await getSlackChannelId(formattedSlackChannelName, workspaceId);
        const archiveChannelRequest = formatArchiveChannelRequest(channelId);
        callback(archiveChannelRequest);
    } catch (err) {
        errorCallback(`Error occurred: ${err}`);
    }
};