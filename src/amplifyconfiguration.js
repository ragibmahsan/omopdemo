const amplifyConfig = {
    Auth: {
        Cognito: {
            region: 'us-east-1', // replace with your region
            userPoolId: 'us-east-1_dltWEy7Li', // replace with your User Pool ID
            userPoolClientId: '50depkvskmj5fk6o0ah3jq9sk2', // replace with your App Client ID
            clientSecret: 'h4uqt7d3pdusm6eoan3kooms374npav1aiapj7krr79n2oej20b'
        }
    },
};

export default amplifyConfig;
