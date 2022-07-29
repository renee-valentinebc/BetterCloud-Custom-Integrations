const axios = require('axios');

const getGroupId = async (groupName, auth, domain, error) => {
    try {
        let getGroupsRequest = {
            method: 'GET',
            url: `https://${domain}/api/v2/groups?page[size]=100`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        };
        let matchingGroup;
        while (!matchingGroup) {
            const response = await axios(getGroupsRequest);
            const groups = response.data.groups;
            matchingGroup = groups.find(group => group.name.toLowerCase().trim() === groupName.toLowerCase().trim());

            if (response.data.meta.has_more) {
                getGroupsRequest.url = response.data.links.next;
            }
        }
        if (!matchingGroup) {
            error(`No groups found with name ${groupName}`);
        } else {
            return matchingGroup.id;
        }
    } catch (err) {
        error(`Failed to get Group ID for group with name "${groupName}": ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        let secrets = input.secrets;
        const auth = new Buffer.from(`${secrets.auth_username}:${secrets.auth_password}`).toString('base64');
        const groupId = await getGroupId(request.body.groupName, auth, secrets.domain, error);
        const newBody = {
            group_membership: {
                group_id: groupId
            }
        };
        request.body = newBody;
        callback(request);
    } catch (err) {
        error(`getGroupId pre request script failed: ${err}`);
    }

};
