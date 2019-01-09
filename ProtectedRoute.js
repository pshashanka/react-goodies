import React from 'react';
import { Route, Redirect } from 'react-router';

const ProtectedRoute = ({ component: ReactComponent, ...rest }) => {
  const state = rest.store ? rest.store.getState() : false;
  const authStatus =
    state && state.validatedSession
      ? state.validatedSession.authenticated
      : false;

  if (rest.public) {
    return <Route {...rest} component={ReactComponent} />;
  }

  // otherwise - private
  const referrer =
    rest.history && rest.history.location
      ? rest.history.location.pathname
      : '/home';
  return (
    <Route
      {...rest}
      render={props =>
        typeof authStatus === 'undefined' || authStatus === false ? (
          <Redirect
            to={`/?TARGET=${referrer}`}
            authenticated={authStatus}
            public={true}
          />
        ) : (
          <ReactComponent {...props} authenticated={authStatus} />
        )
      }
    />
  );
};

export default ProtectedRoute;
