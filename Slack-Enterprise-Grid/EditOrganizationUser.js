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

function formatEditOrgUserRequest(slackId, managerSlackId, requestBody) {
    let editOrgUserRequest = {
        method: "PATCH",
        url: `https://api.slack.com/scim/v1/Users/${slackId}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${secrets.auth_Authorization}`,
            'Content-Type': 'application/json'
        },
        body: {
            "schemas": [
                "urn:scim:schemas:core:1.0",
                "urn:scim:schemas:extension:enterprise:1.0"
            ]
        }
    };
    requestBody.userName ? editOrgUserRequest.body.userName = requestBody.userName : undefined;
    if (requestBody.firstName || requestBody.lastName) {
        let name = {};
        requestBody.firstName ? name.givenName = requestBody.firstName : undefined;
        requestBody.lastName ? name.familyName = requestBody.lastName : undefined;
        editOrgUserRequest.name = name;
    }
    requestBody.displayName ? editOrgUserRequest.body.displayName = requestBody.displayName : undefined;
    if (requestBody.newEmail) {
        editOrgUserRequest.body.emails = [
            {
                "value": requestBody.newEmail,
                "type": "work",
                "primary": true
            }
        ]
    }
    requestBody.title ? editOrgUserRequest.body.title = requestBody.title : undefined;
    if (requestBody.role) {
        editOrgUserRequest.body.roles = [
            {
                "value": requestBody.role,
                "primary": true
            }
        ]
    }
    if (requestBody.employeeNumber || requestBody.costCenter || requestBody.organization ||
        requestBody.division || requestBody.department || managerSlackId) {
        editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"] = {};
        requestBody.employeeNumber ? editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"].employeeNumber = requestBody.employeeNumber : undefined;
        requestBody.costCenter ? editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"].costCenter = requestBody.costCenter : undefined;
        requestBody.organization ? editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"].organization = requestBody.organization : undefined;
        requestBody.division ? editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"].division = requestBody.division : undefined;
        requestBody.department ? editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"].department = requestBody.department : undefined;
        if (managerSlackId) {
            editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"].manager = {};
            editOrgUserRequest.body["urn:scim:schemas:extension:enterprise:1.0"].manager.managerId = managerSlackId;
        }
    }
    return editOrgUserRequest;
}

module.exports = async (input, callback, error) =>{
    secrets = input.secrets;
    errorCallback = error;
    const request = input.request,
        requestBody = request.body,
        formattedSlackEmail = requestBody.currentEmail ? requestBody.currentEmail.toLowerCase() : null;

    try {
        const userSlackId = await getSlackUserId(formattedSlackEmail);
        let managerSlackId = requestBody.managerEmail ? await getSlackUserId(requestBody.managerEmail) : undefined;
        const editOrgUserRequest = formatEditOrgUserRequest(userSlackId, managerSlackId, requestBody);
        console.log(JSON.stringify(editOrgUserRequest));
        callback(editOrgUserRequest);
    } catch (err) {
        errorCallback(`Error occurred: ${err}`);
    }
};