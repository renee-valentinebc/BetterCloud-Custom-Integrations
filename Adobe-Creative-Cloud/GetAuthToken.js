const axios = require('axios');
const jwt = require('jsonwebtoken');
let secrets;
let errorCallback;

const getToken = async () => {
    try {
        const date = new Date(),
            privateKey = `-----BEGIN PRIVATE KEY-----\n${(secrets.test).replace('\n', '')}\n-----END PRIVATE KEY-----`,
            jwt_url = `https://ims-na1.adobelogin.com/ims/exchange/jwt`,
            jwtPayload = {
                exp: Math.ceil(date.setHours(date.getHours() + 1) / 1000),
                iss: secrets.orgId,
                sub: secrets.technicalAccountId,
                aud: `https://ims-na1.adobelogin.com/c/${secrets.clientId}`,
                "https://ims-na1.adobelogin.com/s/ent_user_sdk": true,
                "https://ims-na1.adobelogin.com/s/ent_adobeio_sdk": true
            },
            signOptions = {algorithm: 'RS256'},
            token = jwt.sign(jwtPayload, privateKey, signOptions),
            postData = `client_id=${encodeURIComponent(secrets.clientId)}&client_secret=${encodeURIComponent(secrets.clientSecret)}&jwt_token=${encodeURIComponent(token)}`,
            axios_jwt_request = {
                method: 'post',
                url: jwt_url,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: postData
            };
        const response = await axios(axios_jwt_request);
        const json_jwt_response = response.data;
        return json_jwt_response.access_token ? json_jwt_response.access_token : errorCallback('noToken');
    } catch (err) {
        errorCallback(`Error: ${err.message}`);
    }
};


module.exports = async (input, callback, error) => {
    try {
        errorCallback = error;
        secrets = input.secrets;

        const accessToken = await getToken(error);
        input.request.headers = {
            "X-Api-Key": secrets.clientId,
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        callback(input.request);
    } catch (err) {
        error(`Error: ${err.message}`);
    }
};

var run = module.exports;

input = {
    payload: 'IDFK',
    environment: null,
    secrets: JSON.parse('{"orgId": "83553C535FF88CFF0A495F91@AdobeOrg", "clientId": "a6261d355b65449d91041ffb4c4dfd92", "clientSecret": "dbd372a9-879a-4f54-ba4b-0e301fd88e48", "technicalAccountId": "38B56E82603D186D0A495F8D@techacct.adobe.com", "publicKey": "8e7158d19db701b46618ac14f715cbf5fdc2b797", "privateKey":"MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCT459NkHCRM1O442bcjzeA8BYIldLEpK3aRfB9wHl9rOeUZi4m5xb902waOod46gu8SmvdHDdf+DInj0w8xJaQQU/0aww4kLuXXOMLKv0CzgAQrKe3xBj6ZluFBICYE1M9GWgRMiUQ80iiaiWw7l/RaJC3MrGHgzwSbzK3vuBYBb9pmYfhu7/6jB2E26RIZxhA3pp5ApaHKrrwzyCo9JL1ugfkGZoJL4QE/K40/9VE875wIcxAWh3X/RdJUJd/7YNgVo/u9jbucJoGm8tRn+oP+LT/wW8y9qudp6eHf4Zfuvj9C6joETWWmaPJ6xm8I1Jn8vTKamkhUAoRLvk+/MTvAgMBAAECggEAIbqhY4xU0Bj3uExM8nLLguG+9LhO+MBiUkzvO48BZnNf4c2oKwE7kip9FkJREXe3s3r5vNUpn/64WaNqDNX9TOtIdANSJziDQFNUCQEF8XTQOP1Xxya3V6yupNjRB14o9t9rh7h7EbGa2EgDTqYfPmBt2Qp7yN9afQ3VcGjdO9XC9+muxtFt6A4lbeLMfcXt01RL02owwuzDeDCDrGZjSNAk75zl/CJaLQ0hGTSJoDxYKqwyW3FLucfm0cDmmceYRd+mzGnB/8aOuMcaYLM1h+8/2sPJgkN33qo52FKHfg9J9E+RZdkooP67oi+Dn6pRqbU/XSrVtE8cpMCvJhDzMQKBgQDH0NoZ48LDJwHCj0zDEzghh6d79HOF/2zGm9fFpXaLk4UbZjxliJTyXhH3hae2lA4aTSPysynbqqPCpwqrC4xzT/nQ38YOt4q7XQMkKrMwCwRu8P1DS+fbIEfXvQ0bnYour0JTSl3mZfSTQLguoer6zMzmrCV8i1PLYTOU4A82BwKBgQC9ePuaTwPRE0Cu2Pxvk4NFSA3OSCsJ7y5jOzCqWSTwSvDQM6NA60QfbIZqDVyPCDZAfY3Nox4D4l9dwF7SDMpk3qS0Bz+q0TRNwsJWfIQtqN12wAEoHdkeUDmx6V9KBLdgGuSFMC4AE7GS5G7QvZjmTyyLjPV0y8AuP2ZAEMH/2QKBgQCw+GzymSKaLSYF510ZOSBxse/IfQ0EFOGGVeiZCJ8hp5owVjAPzRP+RQqsqxeLQT3sVX4NKllcUJmRgNiV/Th7uM2NDWQhDLY2k36AvcDOQDPA/neQ7t1+2exHSw0c9D66ckbP9gGMWahv8tYtlwLC9jhT5QuebtfcPU6uAHP4aQKBgFwMjbeO0ZzeTJtlYWZXdPvQoJxp5TbjU1b0J5Vqz45J6ipMG/DrG2Jk1/xn12LJq4mzNZQEvg1HCevDDI3hluZgYAXyS5USI+XvS3i274Q7OLR7XVR/A789XHo5lYihN/Fhv0mReZeh+bASeF/C7KhfKJX3ejwuzIPrWyKewZEpAoGAPWr8fPknTZkF4AC5fC204TDWK7AvbXd7hwjDEFmZQY8wWNbrToU+V8SoLX7qaD1QRzrrwNDiZ4lMVc7KvbwPZKbuV6M4zHJiCnt16Ae7YGqAZSxF2bx+2MnN8gEN2UTMUZXvVzLpc8kl8Yt5ROPkDY77L8fVwAPRR6xUX2n6S+A="}'),
    request: JSON.parse('{"url": "https://us3.api.insight.rapid7.com/account/api/1/users/730917c6-599e-4214-883d-02c21d7ecce1/products/{productToken}", "method": "PATCH", "headers": {"Content-Type": "application/json", "Authorization": "Bearer token"}, "body": {"productCode": "oPs"}}')
};

callback = function (webhookRequest) {
    const axios = require('axios');


    let axiosRequest = {
        method: webhookRequest.method,
        url: webhookRequest.url,
        headers: webhookRequest.headers,
        data: webhookRequest.body
    };

    axios(axiosRequest).then(response => {
        console.log("Webhook Response: " + JSON.stringify(response.data));
    }).catch(err => console.log(err))
};

error = function (name) {
    console.log("Failed: " + name);
};

run(input, callback, error);