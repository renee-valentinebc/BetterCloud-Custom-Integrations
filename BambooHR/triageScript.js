const axios = require('axios');
let statusEmail = '';
let secrets;
let errorCallback;

/**
 * Executes an axios request to the BetterCloud /triggers endpoint with the data supplied from handleSingleEmployee().
 * @param {Object} employeeData
 * @param {String} url
 * @returns
 */

const executeBCTrigger = async(employee, url) => {
    try {
        const request = {
            url: url,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: employee

        }
        await axios(request);
    } catch (err) {
        errorCallback(err);
    }
}

/**
 * Returns the first changed field from the changedField Array from BambooHR
 * @param {Array} employeeChangedFields
 * @returns {String | Number}
 */

function classify(employeeChangedFields) {
    return employeeChangedFields[0];
}

/**
 * Conditionally sets the url and employee data and runs executeBCTrigger() with that data. Sets
 * the statusEmail.
 * @param {Object} employee
 */

const handleSingleEmployee = async (employee) => {
    try {
        let url;
        const changedField = classify(employee.changedFields);
        const workEmail = employee.fields.workEmail;
        const status = employee.fields.status;
        switch (changedField) {
            case "workEmail":
                if (workEmail !== null && status === "Active") {
                    url = secrets.onboardingTrigger;
                    statusEmail += `User created in BambooHR and work email was set. Employee data: ${JSON.stringify(employee.fields)}\n`;
                }
                break;
            case "department":
                if (workEmail !== null) {
                    url = secrets.departmentChangeTrigger;
                    statusEmail += `User's department changed in BambooHR. Employee data: ${JSON.stringify(employee.fields)}\n`
                }
                statusEmail += `Department changed, but Work Email is not set. Perhaps this is a new user? BetterCloud workflow will not run. Employee data: ${JSON.stringify(employee.fields)}\n`;
                break;
            case "jobTitle":
                if (workEmail !== null) {
                    url = secrets.jobTitleChangeTrigger;
                    statusEmail += `User's Job Title changed in BambooHR. Employee data: ${JSON.stringify(employee.fields)}\n`
                }
                statusEmail += `Job Title changed, but Work Email is not set. Perhaps this is a new user? BetterCloud workflow will not run. Employee data: ${JSON.stringify(employee.fields)}\n`;
                break;
            case 91:
                if (workEmail !== null) {
                    url = secrets.managerChangeTrigger;
                    statusEmail += `User's manager changed in BambooHR. Employee data: ${JSON.stringify(employee.fields)}\n`
                }
                statusEmail += `Manager changed, but Work Email is not set. Perhaps this is a new user? BetterCloud workflow will not run. Employee data: ${JSON.stringify(employee.fields)}\n`;
                break;
            case "status":
                if (employee.fields["status"] === "Inactive" && employee.fields["employmentStatus"] === "Terminated") {
                    url = secrets.offboardingTrigger;
                    statusEmail += `User terminated in BambooHR. Employee data: ${JSON.stringify(employee.fields)}\n`;
                } else {
                    statusEmail += `Employment Status changed, but they are not Terminated. Perhaps this is a new user? BetterCloud workflow will not run. Employee data: ${JSON.stringify(employee.fields)}\n`;
                }
                break;
            default:
                statusEmail += `No applicable changed fields. No workflow will run. Employee data: ${JSON.stringify(employee.fields)}\n`;
                break;
        }
        if (url !== undefined) {
            await executeBCTrigger(employee, url);
        }
    } catch (err) {
        errorCallback(err);
    }
}

/**
 * Returns a request object for the Send Email action
 * @param {String} statusEmail
 * @returns {Object}
 */

function formatSendEmailRequest(statusEmail) {
    return {
        "29ab12e1-02cb-452f-82a5-9c433a07884c": secrets.bcAdminEmail, //recipient
        "ec00cb05-0482-4d83-95b1-98e2f71a2058": "BambooHR Webhook Triggered", //subject
        "d6bcd3b5-656f-453e-a5f1-9f8734b11088": statusEmail, //body
        "b6bea60c-8dc9-4bd9-a950-d5f8aa2c6a60": secrets.bettercloudIntegrationId
    }
}

/**
 * Driver function. Has access to:
 *  - Action Inputs: request body, request url, request headers
 *  - Secrets: environment variables, shared auth
 *
 *  callback is called at the end of function with request object
 *  error is called when an error occurs
 * @param {Object} input
 * @param {Function} callback
 * @param {Function} error
 */

module.exports = async (input, callback, error) => {
    try {
        secrets = input.secrets;
        errorCallback = error;
        const handledEmployeePromises = [],
            incomingPayload = JSON.parse(input.request),
            employees = incomingPayload.employees;
        employees.forEach(employee => handledEmployeePromises.push(handleSingleEmployee(employee)));
        await Promise.all(handledEmployeePromises);
        const sendEmailRequest = formatSendEmailRequest(statusEmail);
        callback(sendEmailRequest)
    } catch (err) {
        errorCallback(err);
    }
};
