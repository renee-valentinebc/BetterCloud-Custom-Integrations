const axios = require('axios');
let errorCallback;

const getAuditBoardUser = async (requestUrl, apiKey) => {
    let getUserDetailsRequest = {
        method:'GET',
        url: requestUrl,
        headers:{
            "Authorization":apiKey
        }
    }
    try{
        const response_getUser = await axios(getUserDetailsRequest);
        if(response_getUser){
            return response_getUser.data;
        }else{
            errorCallback("No user provided in response to user request.")
        }
    }catch (err){
        errorCallback(`Error occurred getting user with id, ${userId}. Error: ${err}`)
    }
}

module.exports = async (input, callback, error) => {
    let secrets = input.secrets;
    let request = input.request,
        requestBody = request.body,
        requestUrl = request.url;

    let apiKey = secrets["auth_Authorization"];

    errorCallback = error;
    try {
        if(requestBody.familyName === null || requestBody.givenName === null){

            const userProfile = await getAuditBoardUser(requestUrl, apiKey);

            if(requestBody.familyName === null){
                requestBody.familyName = userProfile.name.familyName;
            }
            if(requestBody.givenName === null){
                requestBody.givenName = userProfile.name.givenName;
            }

            request.body = requestBody;
        }

        callback(request);
    } catch (err) {
        error(err);
    }
};

