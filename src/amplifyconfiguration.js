const amplifyConfig = {
    Auth: {
        Cognito: {
            region: 'us-east-1', // replace with your region
            userPoolId: 'us-east-1_dltWEy7Li', // replace with your User Pool ID
            userPoolClientId: '7eejh0sndhb6s9dqmq5uos15l8', // replace with your App Client ID
            identityPoolId: 'us-east-1:27acef8c-f49c-44f8-8d4f-482000470bb4'
        }
    },
};

export default amplifyConfig;