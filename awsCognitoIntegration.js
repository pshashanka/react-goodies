import Amplify from 'aws-amplify';
import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';
import config from '../config/awsEnv';

// AWS SDK & AWS Amplity Configuration
const awsOauthConfig = {
  domain: config.AWS_COGNITO_CLIENT_DOMAIN_NAME,
  scope: config.AWS_COGNITO_IDP_OAUTH_CLAIMS,
  redirectSignIn: config.AWS_COGNITO_IDP_SIGNIN_URL,
  redirectSignOut: config.AWS_COGNITO_IDP_SIGNOUT_URL,
  responseType: config.AWS_COGNITO_IDP_GRANT_FLOW // 'code' or 'token'
};

const awsConfiguration = {
  Auth: {
    identityPoolId: config.AWS_COGNITO_IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
    region: config.AWS_REGION, // REQUIRED - Amazon Cognito Region
    userPoolId: config.AWS_COGNITO_USER_POOL_ID, // OPTIONAL - Amazon Cognito User Pool ID
    userPoolWebClientId: config.AWS_COGNITO_CLIENT_ID, // OPTIONAL - Amazon Cognito Web Client ID
    oauth: awsOauthConfig
  }
};

// --- exports -- //

export const awsInit = () => {
  AWS.config.region = config.AWS_REGION;
  Amplify.configure(awsConfiguration);
};

export const sessionSignIn = () => {
  const authConfig = Auth.configure();
  const { domain, redirectSignIn, responseType } = authConfig.oauth;

  const clientId = config.AWS_COGNITO_CLIENT_ID;
  const url = `https://${domain}/oauth2/authorize?identity_provider=${
    config.AWS_COGNITO_IDP_NAME
  }&redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;

  // Launch hosted UI
  window.location.assign(url);
};

export const sessionSignOut = () => {
  return new Promise((resolve, reject) => {
    Auth.signOut()
      .then(data => {
        resolve(data);
        // we have authenticated, lets navigate to /main route
        // history.push('/');
      })
      .catch(err => {
        reject(err);
        // error -- invoke authError which dispatches AUTH_ERROR
      });
  });
};

// Validates and Returns Users Session
export const getAWSUserProfile = () => {
  return Auth.currentUserInfo();
};

export const getCurrentSession = () => {
  return Auth.currentSession();
};

// Returns a promise to indicate whether user has a valid session
export const validateAWSUserSession = () => {
  return new Promise((resolve, reject) => {
    Auth.currentAuthenticatedUser()
      .then(currentAuthUser => {
        // grab the user session
        Auth.userSession(currentAuthUser)
          .then(session => {
            // finally invoke isValid() method on session to check if auth tokens are valid
            // if tokens have expired, lets call "logout"
            // otherwise, dispatch AUTH_USER success action and by-pass login screen
            if (session.isValid()) {
              resolve(session);
            } else {
              // fire user is unauthenticated
              const errorMessage = 'user session invalid. auth required';

              reject(errorMessage);
            }
          })
          .catch(err => {
            const errorMessage = JSON.stringify(err);

            reject(errorMessage);
          });
      })
      .catch(err => {
        const errorMessage = JSON.stringify(err);

        reject(errorMessage);
      });
  });
};
