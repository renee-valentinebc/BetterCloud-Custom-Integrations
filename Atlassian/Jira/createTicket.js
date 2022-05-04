/*
Project x
Issue type x
Summary x
Requesting team = customfield_11040 x String value
Reporter --- Need to ask if they use reporter or ServiceNow Reporter x
ServiceNow Reporter = customfield_15964 x String value
Labels (if available) x This will need to be added in as a comma separated list
Issue (if available to link to existing issue) --- REQUIRES CUSTOMER TO KNOW ISSUE KEY OR ID UP FRONT --- NEED TO KNOW WHAT TYPE OF LINK THEY'RE DOING

getProjectId
getReporterId
getIssueTypeId

Final Request Body:
{
    "fields": {
        "summary: "This is a summary.",

    },
    "project": {
        "id": "1000"
    },
   "issueType": {
        "id": "10000"
    },
    "reporter": {
        "id": "5b10a2844c20165700ede21g"
    },
    "labels": [
        "label1",
        "label2"
    ],
    "customfield_11040": "DevOps",
    "customfield_15964": "Person",
     "update":{
      "issuelinks":[
         {
            "add":{
               "type":{
                  "name":"Blocks",
                  "inward":"is blocked by",
                  "outward":"blocks"
               },
               "outwardIssue":{
                  "key":"TEST-1"
               }
            }
         }
      ]
   }
 }

Test payload:

{
"projectName": "BetterCloud Test Project",
"reporterEmail": "atlassian_bettercloud@condenast.com",
"issueTypeName": "Task",
"labels": "test,TEST-LABEL,Test-ticket",
"summary": "This is a test!",
"requestingTeam":"Other (not listed)",
"linkType": "Relates",
"linkedIssueKey": "BTP-1"
}

Dont know if we need servicenowreporter
*/
const axios = require('axios');
let requestHeaders;
let secrets;

const getProjectId = async (projectName, error) => {
    try {
        const getProjectsRequest = {
            method: 'GET',
            url: `https://${secrets.jiraDomain}/rest/api/3/project/search?query=${projectName}`,
            headers: requestHeaders
        }

        const response = await axios(getProjectsRequest);
        const projects = response.data.values ? response.data.values : [];
        const matchingProjects = projects.filter(project => project ? project.name.toLowerCase() === projectName.toLowerCase() : false);

        if (matchingProjects.length > 1) {
            return error(`Multiple projects found for project name ${projectName}`);
        } else if (matchingProjects.length === 0) {
            return error(`No projects found for project name ${projectName}`);
        }

        return matchingProjects[0].id;
    } catch (err) {
        return error(`Failed to get project ID: ${err.message}`);
    }
}

const getUserId = async (userEmail, error) => {
    try {
        const getUsersRequest = {
            method: 'GET',
            url: `https://${secrets.jiraDomain}/rest/api/3/user/search?query=${userEmail}`,
            headers: requestHeaders
        }

        const response = await axios(getUsersRequest);
        const users = response.data ? response.data : [];
        const matchingUsers = users.filter(user => user ? user.emailAddress.toLowerCase() === userEmail.toLowerCase() : false);

        if (matchingUsers.length > 1) {
            return error(`Multiple users found for user with email ${userEmail}`);
        } else if (matchingUsers.length === 0) {
            return error(`No users found for user with email ${userEmail}`);
        }

        return matchingUsers[0].accountId;
    } catch (err) {
        return error(`Failed to get user ID: ${err.message}`);
    }
};
const getIssueTypeId = async (issueTypeName, projectId, error) => {
    try {
        const getIssuesRequest = {
            method: 'GET',
            url: `https://${secrets.jiraDomain}/rest/api/3/issuetype/project?projectId=${projectId}`,
            headers: requestHeaders
        }

        const response = await axios(getIssuesRequest);
        const issueTypes = response.data ? response.data : [];
        const matchingIssueTypes = issueTypes.filter(issueType => issueType ? issueType.name.toLowerCase() === issueTypeName.toLowerCase() : false);

        if (matchingIssueTypes.length > 1) {
            return error(`Multiple issue types found with name ${issueTypeName} for project with ID ${projectId}`);
        } else if (matchingIssueTypes.length === 0) {
            return error(`No issue types found with name ${issueTypeName} for project with ID ${projectId}`);
        }

        return matchingIssueTypes[0].id;
    } catch (err) {
        return error(`Failed to get issue type ID: ${err.message}`);
    }
};

module.exports = async(input, callback, error) => {
    const request = input.request;

    const encodedAuthKey = new Buffer.from(`${input.secrets.auth_username}:${input.secrets.auth_password}`).toString('base64');
    requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedAuthKey}`
    }
    secrets = input.secrets;

    try {
        const projectId = await getProjectId(request.body.projectName, error);
        const reporterId = await getUserId(request.body.reporterEmail, error);
        const issueTypeId = await getIssueTypeId(request.body.issueTypeName, projectId, error);
        const labels = request.body.labels.split(",");

        let newRequestBody = {
            "fields": {
                "summary": request.body.summary,
                "project": {
                    "id": projectId
                },
                "issuetype": {
                    "id": issueTypeId
                },
                "reporter": {
                    "id": reporterId
                },
                "labels": labels,
                "customfield_11040": {
                    "value": request.body.requestingTeam
                }
            },
            "update": {
                "issuelinks":[
                    {
                        "add":{
                            "type":{
                                "name":request.body.linkType,
                            },
                            "outwardIssue":{
                                "key": request.body.linkedIssueKey
                            }
                        }
                    }
                ]
            }
        };

        request.body = newRequestBody;
        callback(request);
    } catch (err) {
        error(`Create Issue Pre Request Script failed: ${err.message}`);
    }
};