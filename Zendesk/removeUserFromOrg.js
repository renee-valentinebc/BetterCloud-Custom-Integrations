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


const getOrganizationMembershipId = async(userId, organizationId, auth, domain, error) => {
  try {
      let getOrganizationMemberships = {
          method: 'GET',
          url: `https://${domain}/api/v2/organizations/${organizationId}/organization_memberships?page[size]=100`,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${auth}`
          }
      };

      let matchingOrgMemberships;
      while (!matchingOrgMemberships) {
          const response = await axios(getOrganizationMemberships);
          const orgMemberships = response.data.organization_memberships;
          matchingOrgMemberships = orgMemberships.find(membership => {
              if (membership.user_id === userId && membership.organization_id === organizationId) {
                  return membership;
              }
          });

          if (response.data.meta.has_more) {
              getOrganizationMemberships.url = response.data.links.next;
          }
      }
      if (!matchingOrgMemberships) {
          error(`No matching org memberships found`);
      } else {
          return matchingOrgMemberships.id;
      }
  }  catch (err) {
      error(`Failed to get Org Membership ID for user with ID ${userId} and organization with ID "${organizationId}": ${err}`);
  }
};

module.exports = async (input, callback, error) => {
    try {
        let request = input.request;
        let secrets = input.secrets;
        const auth = new Buffer.from(`${secrets.auth_username}:${secrets.auth_password}`).toString('base64');
        const userId = await getUserId(request.body.email, auth, secrets.domain, error);
        const organizationId = await getOrganizationId(request.body.organizationName, auth, secrets.domain, error);
        const organizationMembershipId = await getOrganizationMembershipId(userId, organizationId, auth, secrets.domain, error);
        request.url = request.url.replace('{userId}', userId);
        request.url = request.url.replace('{organizationMembershipId}', organizationMembershipId);
        request.body = {};
        callback(request);
    } catch (err) {
        error(`removeUserFromOrganization pre request script failed: ${err}`);
    }
};
