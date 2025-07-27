import axiosInstance from "./axios";
import { Ilogin } from "../model";
import { UserModel } from "../component/usermanagement/UserMode";
import swal from "sweetalert";
import { JwtPayLoad } from "../component/Header";
import { jwtDecode } from "jwt-decode";

interface ILogin {
  username: string;
  password: string;
}

interface ResponseDTO {
  code: number;
  message: string;
}

const login = async (dataReq: ILogin): Promise<{ success: boolean, message: string, response?: any }> => {
  try {
    const response = await axiosInstance.post("api/account/login", dataReq);

    // Check for successful response
    if (response.status === 200 && response.data) {
      const responseData = response.data;

      if (responseData.code === 200) {
        return {
          success: true,
          message: "Logged in successfully",
          response: responseData,
        };
      } else {
        // Handle specific error codes from the backend
        return {
          success: false,
          message: responseData.message || "An unexpected error occurred.",
        };
      }
    } else {
      // Handle cases where response code is not 200
      return {
        success: false,
        message: "Unexpected error occurred.",
      };
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData: ResponseDTO = error.response.data;

      // Handle specific backend error codes
      if (errorData.code === 19) {
        return { success: false, message: errorData.message || "User account is inactive." };
      } else if (errorData.code === 400) {
        return { success: false, message: errorData.message || "Invalid username/password." };
      } else {
        return { success: false, message: errorData.message || "An unexpected error occurred." };
      }
    }

    // Fallback for network or server errors
    return {
      success: false,
      message: "Can't connect to server, please try again later.",
    };
  }
};

const fetchUserList = async (
  currentPage: number,
  searchInput: string,
  searchRole: string
): Promise<{ users: UserModel[]; totalPages: number; error?: string }> => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      users: [],
      totalPages: 0,
      error: "No token found, please log in again.",
    };
  }

  try {
    const params: any = {
      page: currentPage - 1,
      size: 10,
      keyword: searchInput || "",
      role: searchRole || "",
    };

    const response = await axiosInstance.get("/api/user/search", { params });
    const usersData = response.data.users || [];
    const totalPages = response.data.totalPages || 0;

    return { users: usersData, totalPages: totalPages };
  } catch (err: any) {
    window.location.href = "/404-not-found";
    return { users: [], totalPages: 0, error: "Error fetching users" };
  }
};

export const checkEmailHasAlready = async (email: string): Promise<boolean> => {
  const encodedEmail = encodeURIComponent(email);
  const url = `/api/user/is-exists-email?email=${encodedEmail}`;
  try {
    const response = await axiosInstance.get(url);
    return response.data === true;
  } catch (error:any) {
    if(error.response.status ==500){
      throw new Error(
        error.response.data.message ||
          "An error occurred while checking email"
      );
    }
    return false;
  }
};

export const checkPhoneNumberExists = async (
  phoneNumber: string
): Promise<boolean> => {
  const url = `/api/user/is-exists-phone-number?phoneNumber=${phoneNumber}`;
  try {
    const response = await axiosInstance.get(url);
   // console.log("Phone check response:", response.data);
    return response.data === true;
  } catch (error:any) {
    if(error.response.status ==500){
      throw new Error(
        error.response.data.message ||
          "An error occurred while checking phone number"
      );
    }
   // console.error("Error checking phone number:", error);
    return false;
  }
};

export const checkIsEighteenYearsOld = async (
  dob: string
): Promise<boolean> => {
  const birthDate = new Date(dob);
  const currentDate = new Date();
  const age = currentDate.getFullYear() - birthDate.getFullYear();

  if (age < 18 || age > 60) {
    return false;
  }
  return true;
};

const createUser = async (userData: any): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await axiosInstance.post(`/api/user/create`, userData);
    if (response.status === 200) {
      const responseData = response.data;
      if (responseData.code === 4) {
        return { success: true, message: responseData.message };
      } else {
        return { success: false, message: responseData.message };
      }
    } else {
      return { success: false, message: 'Unexpected error occurred' };
    }
  } catch (error:any) {
    return { success: false, message: error.response ? error.response.data.message : 'Network error' };
  }
};
const isAuthentication = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    swal("Please login first", {
      icon: "error",
    });
    return false;
  }
  return true;
};
const checkLogin = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return true;
  }
  return false;
};
const isAdminOnly = () => {
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") {
    return false;
  }
  return true;
};

const logoutApi = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found. Please log in.");
  }

  try {
    const response = await axiosInstance.post(`/api/account/logout`, null);
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
   // console.error('Logout failed: ', error);
    throw new Error('Logout failed.');
  }
};
const getUserByUserID = async (userId: number) => {
  try {
    const response = await axiosInstance.get(`/api/user/${userId}`);
    return response.data.data;
  } catch (error) {
   // console.error("Error fetching user:", error);
    throw error;
  }
};

const checkExpiredToken = async (token: any) => {
  if (!token) {
    return false;
  }

  try {
    const response = await axiosInstance.get(
      `/api/account/check-token?token=${token}`
    );

    if (response.status === 200) {
      return true;
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      // swal("An error occurred while checking the token", {
      //   icon: "error",
      // });
    }
    return false;
  }
};

const updateisActivebyUserId = async (userId: number) => {
  try {
    const response = await axiosInstance.put(
      `/api/user/update-active/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

const UpdateUserByUserId = async (userId: number, userData: any) => {
  try {
    const response = await axiosInstance.put(
      `/api/user/update/${userId}`,
      userData
    );
   // console.log("Success:", response.data);
   if (response.data.code === 200) {
    return response.data;
} else if (response.data.code === 1) {
    throw new Error("This email has already existed!!");
} else if (response.data.code === 2) {
    throw new Error("This phone number has already existed!!");
} else {
    throw new Error("An unknown error occurred");
}
  } catch (error: any) {
    if (error.response && error.response.data) {
      console.error("Error fetching User:", error.response.data.message);
      throw new Error(
          error.response.data.message ||
          "An error occurred while edit  user."
      );
  } else {
      console.error("Error fetching User:", error.message);
      throw new Error(
          "An error occurred while edit offer."
      );
  }
  }
};
const sendEmailForgot = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      `/api/account/forgot-password?email=${email}`
    );

    // Check the response code
    if (response.data.code === 7) {
      return response.data;
    } else if (response.data.code === 5) {
      throw new Error("The email address doesn’t exist. Please try again.");
    }
   else if (response.data.code === 8888) {
    throw new Error("Send Email Fail");
  } else {
      throw new Error("An unknown error occurred");
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      //console.error("Error fetching user:", error.response.data.message);
      throw new Error(
        error.response.data.message ||
          " "
      );
    } else {
      //console.error("Error fetching user:", error.message);
      throw new Error(
        "An error occurred while sending the forgot password email."
      );
    }
  }
};
const resetPassword = async (
  email: string,
  newPassword: string,
  token: string
) => {
  try {
    const response = await axiosInstance.post(`/api/account/set-new-password`, {
      token,
      email,
      newPassword,
    });

    if (response.data.code === 200) {
      return response.data;
    } else if (response.data.code === 6) {
      throw new Error("Password must contain at least one letter, one number, and be at least seven characters long.");
    } else if (response.data.code === 12) {
      throw new Error("This link has expired. Please go back to Homepage and try again.");
    } else {
      throw new Error("An unknown error occurred");
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
     // console.error("Error resetting password:", error.response.data.message);
      throw new Error(
        error.response.data.message ||
          "An error occurred while resetting the password."
      );
    } else {
     // console.error("Error resetting password:", error.message);
      throw new Error("An error occurred while resetting the password.");
    }
  }
};

const checkValidResetPasswordLink = async (token: string, email: string) => {
  try {
    const encodedEmail = encodeURIComponent(email);
    const response = await axiosInstance.get(
      `/api/account/valid-password-link?token=${token}&email=${encodedEmail}`
    );
    return response.data.code === 200;
  } catch (error: any) {
    // console.error(
    //   "Error validating password reset link:",
    //   error.response ? error.response.data : error.message
    // );
    return false;
  }
};

const getManager = async () => {
  try {
    const response = await axiosInstance.get(`/api/user/getManager`);
    if (response) {
      return {
        response,
        message: "Get the list of getManager successfully",
      };
    } else {
      return { message: "Get the list of getManager failure" };
    }
  } catch (error) {
    throw {
      error,
      message: "Internal server error.",
    };
  }
};
const getRecruiter = async () => {
  try {
    const response = await axiosInstance.get(`/api/user/get-all-recruiter`);
    if (response) {
      return {
        response,
        message: "Get the list of getRecruiter successfully",
      };
    } else {
      return { message: "Get the list of getRecruiter failure" };
    }
  } catch (error) {
    throw {
      error,
      message: "Internal server error.",
    };
  
  }
};


const getCurrentUserFromToken = (): { userId: number; roles: string[] } | null => {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token) as JwtPayLoad;
    return {
      userId: decodedToken.userId,
      roles: decodedToken.role,
    };
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};
const UserService = {
  login,
  fetchUserList,
  checkEmailHasAlready,
  checkPhoneNumberExists,
  checkIsEighteenYearsOld,
  createUser,
  isAuthentication,
  logoutApi,
  getUserByUserID,
  isAdminOnly,
  checkLogin,
  checkExpiredToken,
  updateisActivebyUserId,
  UpdateUserByUserId,
  sendEmailForgot,
  resetPassword,
  checkValidResetPasswordLink,
  getManager,
  getRecruiter,
  getCurrentUserFromToken
};

export default UserService;