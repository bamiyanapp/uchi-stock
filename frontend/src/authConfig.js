import { Amplify } from 'aws-amplify';

const authConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_AUTH_DOMAIN || '',
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [import.meta.env.VITE_REDIRECT_SIGN_IN || 'http://localhost:5173'],
          redirectSignOut: [import.meta.env.VITE_REDIRECT_SIGN_OUT || 'http://localhost:5173'],
          responseType: 'code',
          providers: ['Google']
        }
      }
    }
  }
};

export const configureAmplify = () => {
  if (authConfig.Auth.Cognito.userPoolId && authConfig.Auth.Cognito.userPoolClientId) {
    Amplify.configure(authConfig);
  } else {
    console.warn('Amplify is not configured. userPoolId or userPoolClientId is missing.');
  }
};
