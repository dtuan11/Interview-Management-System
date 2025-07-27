import { jwtDecode } from "jwt-decode";

interface JwtPayLoad {
  userId: number;
  role: string[];
  sub: string;
}

const AuthService = {
  getUserRole: (): string => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayLoad;
        return decodedToken.role[0];
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
    return "";
  },
  getusername: (): string => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayLoad;
        return decodedToken.sub;
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
    return "";
  },

  getCurrentUserId: (): number | null => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayLoad;
        return decodedToken.userId;
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
    return null;
  },
};

export default AuthService;
