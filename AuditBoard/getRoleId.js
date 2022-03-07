const axios = require("axios");
let errorCallback;

const getAuditBoardRoleId = async (baseUrl, apiKey, roleName) => {
    const getUserRequest = {
        method: "GET",
        url: baseUrl + "/Groups",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization':apiKey
        }
    };
    try {
        const response = await axios(getUserRequest);
        const groups = response.data.Resources,
            matchingRoleId = groups.find(group => group.displayName === roleName);
        if (matchingRoleId)
            return matchingRoleId.id;
        else
            errorCallback(`No group found with display name ${roleName}.`);
    } catch (err) {
        console.log(err);
        errorCallback(`Error finding group with display name ${roleName}. Error: ${err}`);
    }
};

module.exports = async (input, callback, error) => {
    let secrets = input.secrets;
    let request = input.request,
        requestBody = request.body;

    let baseUrl = secrets["baseUrl"],
        apiKey = secrets["auth_Authorization"];

    errorCallback = error;

    try {
        if(requestBody.roleName) {
            requestBody.roleId = await getAuditBoardRoleId(baseUrl, apiKey, requestBody.roleName);
            delete requestBody.roleName;

            request.body = requestBody;
        }

        callback(request);
    } catch (err) {
        error(err);
    }
};