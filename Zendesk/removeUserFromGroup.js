const axios = require('axios');

const getUserId = async (email, auth, domain, error) => {
    try {
        const getUsersRequest = {
            method: 'GET',
            url: `https://${domain}/api/v2/users/search.json?query=type:user "${email}"`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        };

        const response = await axios(getUsersRequest);
        const users = response.data.users;
        const matchingUsers = users.filter(user => user.email.toLowerCase().trim() === email.toLowerCase().trim());

        if (matchingUsers.length > 1) {
            error(`More than 1 user was found with email ${email}`);
        } else if (matchingUsers.length === 0) {
            error(`No users found with email ${email}`);
        } else {
            return matchingUsers[0].id;
        }

    } catch (err) {
        error(`Failed to get User ID for user with email "${email}": ${err}`);
    }
};

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

const getGroupMembershipId = async(userId, groupId, auth, domain, error) => {
  try {
      let getGroupMembershipsRequest = {
          method: 'GET',
          url: `https://${domain}/api/v2/groups/${groupId}/memberships?page[size]=100`,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${auth}`
          }
      };

      let matchingGroupMembership;
      while (!matchingGroupMembership) {
          const response = await axios(getGroupMembershipsRequest);
          const groupMemberships = response.data.group_memberships;
          matchingGroupMembership = groupMemberships.find(membership => {
              if (membership.user_id === userId && membership.group_id === groupId) {
                  return membership;
              }
          });

          if (response.data.meta.has_more) {
              getGroupMembershipsRequest.url = response.data.links.next;
          }
      }
      if (!matchingGroupMembership) {
          error(`No matching group memberships found`);
      } else {
          return matchingGroupMembership.id;
      }
  }  catch (err) {
      error(`Failed to get Group Membership ID for user with ID ${userId} and group with ID "${groupId}": ${err}`);
  }
};

module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        let secrets = input.secrets;
        const auth = new Buffer.from(`${secrets.auth_username}:${secrets.auth_password}`).toString('base64');
        const userId = await getUserId(request.body.email, auth, secrets.domain, error);
        const groupId = await getGroupId(request.body.groupName, auth, secrets.domain, error);
        const groupMembershipId = await getGroupMembershipId(userId, groupId, auth, secrets.domain, error);
        request.url = request.url.replace('{userId}', userId);
        request.url = request.url.replace('{groupMembershipId}', groupMembershipId);
        request.body = {};
        callback(request);
    } catch (err) {
        error(`removeUserFromGroup pre request script failed: ${err}`);
    }
};
