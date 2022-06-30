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

const getSlackChannelId = async (formattedChannelName) => {
    const getChannelRequest = {
        method: "POST",
        url: 'https://slack.com/api/admin.conversations.search',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        },
        data: {
            "query": formattedChannelName
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

function formatAddUserToChannelRequest(userId, channelId) {
    return {
        method: "POST",
        url: "https://slack.com/api/admin.conversations.invite",
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        },
        body: {
            user_ids: [userId],
            channel_id: channelId
        }
    }
}

module.exports = async (input, callback, error) =>{
    secrets = input.secrets;
    errorCallback = error;
    const request = input.request,
        requestBody = request.body,
        formattedSlackEmail = requestBody.email ? requestBody.email.toLowerCase() : null,
        formattedSlackChannelName = requestBody.channelName ? requestBody.channelName.toLowerCase() : null;

    try {
        const userId = await getSlackUserId(formattedSlackEmail);
        const channelId = await getSlackChannelId(formattedSlackChannelName);
        const addUserToChannelRequest = formatAddUserToChannelRequest(userId, channelId);
        callback(addUserToChannelRequest);
    } catch (err) {
        errorCallback(`Error occurred: ${err}`);
    }
};