import axiosInstance from "./axios";

const getAllRoles = async () => {
    try {
        const response = await axiosInstance.get(`/api/role/all`);
        if (response.data) {
            return {
                data: response.data,
                message: "Get the list of roles successfully",
            };
        } else {
            return { message: "Get the list of roles failure" };
        }
    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};

const RoleService = {
    getAllRoles,
};

export default RoleService;
