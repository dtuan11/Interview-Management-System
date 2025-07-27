import axiosInstance from "./axios";

export enum COMMON_VALUE_NAMES {
    CONTRACT_TYPE = "Contract type",
    HIGHEST_LEVEL = "Highest level",
    LEVEL = "Level",
    DEPARTMENT = "Department",
    POSITION = "Position",
    SKILLS = "Skills",
    BENEFIT = "Benefit",
    CANDIDATE_STATUS = "Candidate status",
    OFFER_STATUS = "Offer status",
    INTERVIEW_SCHEDULE_STATUS = "Interview schedule status",
    JOB_STATUS = "Job status",
    ROLE_ADMIN = "ADMIN",
    ROLE_INTERVIEWER = "INTERVIEWER",
    ROLE_RECRUITER = "RECRUITER",
    ROLE_MANAGER = "MANAGER",
    OPEN = "Open"

};


const getCommonValue = async () => {
    try {
        const response = await axiosInstance.get(`/api/common-values/getValue`);
        if (response) {
            return {
                response,
                message: "Get the list of common value successfully"
            };
        } else {
            return { message: "Get the list of common value failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};

export const getAllCommonValueByName = async (name: string, begin: number, end: number) => {
    try {
        const payload = {
            name: name,
            beginIndex: begin,
            endIndex: end
        };
        console.log('Request payload:', payload);

        const response = await axiosInstance.post('/api/common-values/get-all-value-by-name', payload);

        return response.data.data.map((commonValue: any) => ({
            value: commonValue.value,
            label: commonValue.value
        }));
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        throw error;
    }
};

const CommonValueService = {
    getCommonValue,
    getAllCommonValueByName,
    COMMON_VALUE_NAMES,
};

export default CommonValueService;