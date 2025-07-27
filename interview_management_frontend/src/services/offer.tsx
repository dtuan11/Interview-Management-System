import Swal from "sweetalert2";
import axiosInstance from "./axios";

const getOffer = async (pageIndex: number) => {
    // const getOffer = async (dataReq: IgetOffer) => {
    try {
        const response = await axiosInstance.get(
            `/api/offer/getOffer/${pageIndex}`
        );
        if (response) {
            return {
                response,
                message: "Get the list of offer successfully"
            };
        } else {
            return { message: "Get the list of offer failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const search = async (pageIndex: number, search: string, department: string, status: string) => {
    try {
        let endpoint = `/api/offer/search/${pageIndex}`;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (department) params.append('department', department);
        if (status) params.append('status', status);
        if (params.toString()) endpoint += `?${params.toString()}`;
        const response = await axiosInstance.get(endpoint);
        if (response) {
            return {
                response,
                message: "Get the list search offer successfully"
            };
        } else {
            return { message: "No item matches with your search data. Please try again" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const viewOfferDeatil = async (id: number) => {
    try {
        const response = await axiosInstance.get(
            `/api/offer/viewOfferDetail/${id}`
        );
        // Check the response code
        if (response.data.code === 200) {
            return response.data;
        } else if (response.data.code === 400) {
            throw new Error("OfferId does not exist");
        } else {
            throw new Error("An unknown error occurred");
        }
    } catch (error: any) {
        if (error.response && error.response.data) {
            console.error("Error fetching Offer:", error.response.data.message);
            throw new Error(
                error.response.data.message ||
                "An error occurred while create offer."
            );
        } else {
            console.error("Error fetching Offer:", error.message);
            throw new Error(
                "An error occurred while create offer."
            );
        }
    }
};
const approveOffer = async (id: number) => {
    try {
        const response = await axiosInstance.put(
            `/api/offer/approveOffer/${id}`
        );
        if (response) {
            return {
                response,
                message: "Update approveOffer successfully"
            };
        } else {
            return { message: "Update approveOffer failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const rejectOffer = async (id: number, reason: string) => {
    try {
        const response = await axiosInstance.put(
            `/api/offer/rejectOffer/${id}/${reason}`
        );
        if (response) {
            return {
                response,
                message: "Update rejectOffer successfully"
            };
        } else {
            return { message: "Update rejectOffer failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const markOfferAsSent = async (id: number) => {
    try {
        const response = await axiosInstance.put(
            `/api/offer/markOfferAsSent/${id}`
        );
        if (response) {
            return {
                response,
                message: "Update markOfferAsSent successfully"
            };
        } else {
            return { message: "Update markOfferAsSent failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const acceptOffer = async (id: number) => {
    try {
        const response = await axiosInstance.put(
            `/api/offer/acceptOffer/${id}`
        );
        if (response) {
            return {
                response,
                message: "Update acceptOffer successfully"
            };
        } else {
            return { message: "Update acceptOffer failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const declineOffer = async (id: number) => {
    try {
        const response = await axiosInstance.put(
            `/api/offer/declineOffer/${id}`
        );
        if (response) {
            return {
                response,
                message: "Update declineOffer successfully"
            };
        } else {
            return { message: "Update declineOffer failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const cancelOffer = async (id: number) => {
    try {
        const response = await axiosInstance.put(
            `/api/offer/cancelOffer/${id}`
        );
        if (response) {
            return {
                response,
                message: "Update cancelOffer successfully"
            };
        } else {
            return { message: "Update acceptOffer failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const createOffer = async (offerData: any) => {
    try {
        const response = await axiosInstance.post(`/api/offer/create`, offerData);
        // Check the response code
        if (response.data.code === 200) {
            return response.data;
        } else if (response.data.code === 16) {
            throw new Error("Candidate Name has exists. Please try again.");
        } else if (response.data.code === 17) {
            throw new Error("Schedule Info has exists. Please try again.");
        } else {
            throw new Error("An unknown error occurred");
        }
    } catch (error: any) {
        if (error.response && error.response.data) {
            console.error("Error fetching Offer:", error.response.data.message);
            throw new Error(
                error.response.data.message ||
                "An error occurred while create offer."
            );
        } else {
            console.error("Error fetching Offer:", error.message);
            throw new Error(
                "An error occurred while create offer."
            );
        }
    }
};
const getInterviewTitle = async () => {
    try {
        const response = await axiosInstance.get(
            `/api/interview/getInterviewTitle`
        );
        if (response) {
            return {
                response,
                message: "Get the list of InterviewTitle successfully"
            };
        } else {
            return { message: "Get the list of InterviewTitle failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const editOffer = async (offerData: any) => {
    try {
        const response = await axiosInstance.put(`/api/offer/edit`, offerData);
        // Check the response code
        if (response.data.code === 200) {
            return response.data;
        } else if (response.data.code === 16) {
            throw new Error("Candidate Name has exists. Please try again.");
        } else if (response.data.code === 17) {
            throw new Error("Schedule Info has exists. Please try again.");
        } else {
            throw new Error("An unknown error occurred");
        }

    } catch (error: any) {
        if (error.response && error.response.data) {
            console.error("Error fetching Offer:", error.response.data.message);
            throw new Error(
                error.response.data.message ||
                "An error occurred while edit offer."
            );
        } else {
            console.error("Error fetching Offer:", error.message);
            throw new Error(
                "An error occurred while edit offer."
            );
        }
    }
};
const getOfferById = async (id: number) => {
    try {
        const response = await axiosInstance.get(
            `/api/offer/getOfferById/${id}`
        );
        if (response) {
            return {
                response,
                message: "Get the list of getOfferById successfully"
            };
        } else {
            return { message: "Get the list of getOfferById failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const exportOffers = async (fromDate: string, toDate: string) => {
    try {
        const response = await axiosInstance.get(`/api/offer/export/${fromDate}/${toDate}`, {
            responseType: 'blob' // Important to set the response type to 'blob' for file downloads
        });
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('application/json')) {
            // Convert blob to JSON
            const reader = new FileReader();
            reader.onload = () => {
                const jsonResponse = JSON.parse(reader.result as string);
                if (jsonResponse.code === 200 && jsonResponse.data.length === 0) {
                    Swal.fire({
                        title: "No Offer",
                        icon: "info",
                        text: "No offer on the selected date.",
                        confirmButtonText: "Close",
                    });
                }
            };
            reader.readAsText(response.data);
            return {
                response,
                message: "No offer on the selected date."
            };
        } else {
            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Offerlist_${fromDate}_${toDate}.xlsx`); // Specify the filename
            document.body.appendChild(link);
            link.click();
            // Cleanup
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(url);
            return {
                response,
                message: "Export offers successfully"
            };
        }
    } catch (error: any) {

        return {
            error,
            message: error.response.data.message || "Internal server error."
        };
    }
};
const updateStatus = async (id: number, status: string) => {
    try {
        const response = await axiosInstance.put(
            `/api/offer/updateStatus/${id}/${status}`
        );
        if (response) {
            return {
                response,
                message: "updateStatus successfully"
            };
        } else {
            return { message: "updateStatus failure" };
        }

    } catch (error) {
        throw {
            error,
            message: "Internal server error.",
        };
    }
};
const OfferService = {
    getOffer,
    search,
    viewOfferDeatil,
    approveOffer,
    rejectOffer,
    markOfferAsSent,
    acceptOffer,
    declineOffer,
    cancelOffer,
    createOffer,
    getInterviewTitle,
    editOffer,
    getOfferById,
    exportOffers,
    updateStatus
};

export default OfferService;