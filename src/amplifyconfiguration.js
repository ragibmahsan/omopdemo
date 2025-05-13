const amplifyConfig = {
    Auth: {
        Cognito: {
            region: 'us-east-1', // replace with your region
            userPoolId: 'us-east-1_dltWEy7Li', // replace with your User Pool ID
            userPoolClientId: '50depkvskmj5fk6o0ah3jq9sk2', // replace with your App Client ID
        }
    },
};

export default amplifyConfig;
