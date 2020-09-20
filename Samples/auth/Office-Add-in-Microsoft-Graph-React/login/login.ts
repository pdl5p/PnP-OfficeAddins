/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as msal from 'msal';

(() => {
  // The initialize function must be run each time a new page is loaded
  Office.initialize = () => {

    const config: msal.Configuration = {
      auth: {
        clientId: '44e649e4-936d-4d3d-8d4e-cbb3bbaf8bfa',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: 'https://localhost:3000/login/login.html'
      },
      cache: {
        cacheLocation: 'localStorage', // needed to avoid "login required" error
        storeAuthStateInCookie: true   // recommended to avoid certain IE/Edge issues
      }
    };

    const userAgentApp: msal.UserAgentApplication = new msal.UserAgentApplication(config);

    const authCallback = (error: msal.AuthError, response: msal.AuthResponse) => {

      if (!error) {
        if (response.tokenType === 'id_token') {
         localStorage.setItem("loggedIn", "yes");
        }
        else {
          // The tokenType is access_token, so send success message and token.
          Office.context.ui.messageParent( JSON.stringify({ status: 'success', result : response.accessToken }) );
        }
      }
      else {
        const errorData: string = `errorMessage: ${error.errorCode}
                                   message: ${error.errorMessage}
                                   errorCode: ${error.stack}`;
        Office.context.ui.messageParent( JSON.stringify({ status: 'failure', result: errorData }));
      }
    };

    userAgentApp.handleRedirectCallback(authCallback);

    const request: msal.AuthenticationParameters = {
      scopes: ['user.read', 'files.read.all'],
    };

    if (localStorage.getItem("loggedIn") === "yes") {
      userAgentApp.acquireTokenRedirect(request);
    }
    else {
        // This will login the user and then the (response.tokenType === "id_token")
        // path in authCallback below will run, which sets localStorage.loggedIn to "yes"
        // and then the dialog is redirected back to this script, so the 
        // acquireTokenRedirect above runs.
        userAgentApp.loginRedirect(request);
    }
  };
})();
