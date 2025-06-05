import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p>Loading...</p> 
    </div>
);


function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
     console.warn(`ProtectedRoute: User with role '${user?.role}' blocked from route requiring roles: ${allowedRoles.join(', ')}`);
     return <Navigate to="/" state={{ error: "Unauthorized access" }} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string), 
};

export default ProtectedRoute;