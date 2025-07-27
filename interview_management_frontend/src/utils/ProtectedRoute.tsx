import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayLoad {
  userId: number;
  role: string[];
  sub: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decodedToken = jwtDecode(token) as JwtPayLoad;
    const userRole = decodedToken.role[0];

    if (allowedRoles.includes(userRole)) {
      return <>{children}</>;
    } else {
      return <Navigate to="/404-not-found" replace />;
    }
  } catch (error) {
    console.error("Invalid token", error);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
