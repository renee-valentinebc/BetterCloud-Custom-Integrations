const axios = require('axios');
let secrets;

async function getUserId(email, error) {
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
        let matchingUserId = null;
        while (!matchingUserId) {
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
                matchingUserId = matchingUsers[0].id;
            }
        }
        return matchingUserId;
    } catch (err) {
        error(`Failed to get User Id for email ${email}: ${err.message}`);
    }
}

module.exports = async(input, callback, error) => {
    try {
        secrets = input.secrets;
        const request = input.request;
        const email = request.body.email;
        const userId = await getUserId(email, error);
        request.url = request.url.replace('{userId}', userId);
        delete request.body.email;
        callback(request);
    } catch (err) {
        error(`Pre-request script getUserId failed: ${err.message}`);
    }
};


/*
const axios = require('axios');
let secrets;

async function getUserId(email, error) {
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
           return matchingUsers[0].id;
       }
   } catch (err) {
       error(`Failed to get User Id for email ${email}: ${err.message}`);
   }
}

module.exports = async(input, callback, error) => {
   try {
       secrets = input.secrets;
       const request = input.request;
       const email = request.body.email;
       const userId = await getUserId(email, error);
       request.url = request.url.replace('{userId}', userId);
       delete request.body.email;
       callback(request);
   } catch (err) {
       error(`Pre-request script getUserId failed: ${err.message}`);
   }
};

 */