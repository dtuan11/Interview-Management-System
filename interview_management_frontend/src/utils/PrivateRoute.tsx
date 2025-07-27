import { Navigate } from "react-router-dom";
import UserService from "../services/user";

const ProtectedRoutes = ({ element }: { element: JSX.Element }) => {
  const isLogin = UserService.checkLogin();
  return isLogin ? element : <Navigate to="/login" />;
};

export default ProtectedRoutes;

