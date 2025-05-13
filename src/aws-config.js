// src/aws-config.js
export const awsConfig = {
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
      sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN // Optional, if using temporary credentials
    },
    // Add these for debugging
    logger: console,
    retryMode: "standard"
};