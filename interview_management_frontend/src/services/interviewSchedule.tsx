// interviewSchedule.tsx
import axiosInstance from "./axios";
import Swal from "sweetalert2";

export const interviewScheduleApi = {
  getAllInterviewSchedules: async (
    params: any,
    setInterviewSchedules: Function,
    setPageNumber: Function,
    setTotalPages: Function
  ) => {
    try {
      const response = await axiosInstance.get(
        "/api/interview/get-all-interview-schedule",
        { params }
      );
      const data = response.data.data;
      if (data) {
        setInterviewSchedules(data.interviewSchedules || []);
        setPageNumber(data.pageNumber || 0);
        setTotalPages(data.totalPages || 0);
      } else {
        setInterviewSchedules([]);
        setPageNumber(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.log("Error:", error);
      setInterviewSchedules([]);
      setPageNumber(0);
      setTotalPages(0);
    }
  },


  getAllInterviewSchedulesofInterviewer: async (
    interviewerId: number,
    params: any,
    setInterviewSchedules: Function,
    setPageNumber: Function,
    setTotalPages: Function
  ) => {
    try {
      const response = await axiosInstance.get(
        `/api/interview/get-all-interview-schedule-interviewer/${interviewerId}`,
        { params }
      );
      const data = response.data.data;
      if (data) {
        setInterviewSchedules(data.interviewSchedules || []);
        setPageNumber(data.pageNumber || 0);
        setTotalPages(data.totalPages || 0);
      } else {
        setInterviewSchedules([]);
        setPageNumber(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.log("Error:", error);
      setInterviewSchedules([]);
      setPageNumber(0);
      setTotalPages(0);
    }
  },

  loadInterviewers: async (setInterviewers: Function) => {
    try {
      const response = await axiosInstance.get("/api/interview/interviewers");
      const data = response.data.data;
      if (data && data.interviewers) {
        const interviewerOptions = data.interviewers
          .filter((interviewer: any) => interviewer.isActive == "true")
          .map((interviewer: any) => ({
            label: interviewer.fullName,
            value: interviewer.fullName,
          }));
        setInterviewers([
          { label: "All Interviewer", value: "" },
          ...interviewerOptions,
        ]);
      } else {
        Swal.fire({
          title: "Load Interviewers Fail",
          icon: "error",
          text: "Please try later.",
          confirmButtonText: "Close",
        });
      }
    } catch (error) {
      console.log("Error:", error);
      Swal.fire({
        title: "Load Interviewers Fail",
        icon: "error",
        text: "Please try later.",
        confirmButtonText: "Close",
      });
    }
  },

  loadStatusOptions: async (setStatusOptions: Function) => {
    try {
      const response = await axiosInstance.get("/api/common-values/getValue");
      const data = response.data.data;
      if (data && data["Interview schedule status"]) {
        const options = data["Interview schedule status"].map(
          (status: string) => ({
            label: status,
            value: status,
          })
        );
        setStatusOptions([{ label: "All Status", value: "" }, ...options]);
      } else {
        Swal.fire({
          title: "Load Status Options Fail",
          icon: "error",
          text: "Please try later.",
          confirmButtonText: "Close",
        });
      }
    } catch (error) {
      console.log("Error:", error);
      Swal.fire({
        title: "Load Status Options Fail",
        icon: "error",
        text: "Please try later.",
        confirmButtonText: "Close",
      });
    }
  },

  createInterviewSchedule: async (scheduleData: any) => {
    try {
      const response = await axiosInstance.post(
        "/api/interview/create",
        scheduleData
      );
      if (response) {
        return {
          response,
          message: "Interview Schedule created successfully",
        };
      } else {
        return { message: "Error creating schedule" };
      }
    } catch (error) {
      throw {
        error,
        message: "Error creating schedule.",
      };
    }

    //   if (response.status === 200 || response.status === 201) {
    //     Swal.fire({
    //       title: "Success",
    //       text: "Interview Schedule created successfully",
    //       icon: "success",
    //       confirmButtonText: "Close",
    //     }).then(() => {
    //       return true;

    //     })
    //   } else {
    //     throw new Error(`Unexpected response status: ${response.status}`);
    //   }
    // } catch (error: any) {
    //   console.error("Error creating schedule:", error);
    //   Swal.fire({
    //     title: "Error",
    //     text: error,
    //     icon: "error",
    //   });
    //   return false;
    // }
  },

  getInterviewSchedule: async (
    id: string,
    setInterview: Function,
    setError: Function
  ) => {
    try {
      const response = await axiosInstance.get(`/api/interview/${id}`);
      if (response.data && response.data.data) {
        setInterview(response.data.data);
      } else {
        setError("No interview data available");
      }
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError("Bad request: " + error.response.data.message);
            break;
          case 404:
            setError("Interview not found: " + error.response.data.message);
            break;
          default:
            setError("An error occurred while fetching interview details");
        }
      } else {
        setError("Network error: Unable to fetch interview details");
      }
      console.error("Error fetching interview details:", error);
    }
  },

  updateInterviewSchedule: async (id: string, scheduleData: any) => {
    try {
      await axiosInstance.put(`/api/interview/update/${id}`, scheduleData);
      Swal.fire({
        title: "Success",
        text: "Change has been successfully updated",
        icon: "success",
      });
      return true;
    } catch (error) {
      console.error("Error updating interview:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update change",
        icon: "error",
      });
      return false;
    }
  },

  submitInterviewResult: async (id: string, scheduleData: any) => {
    try {
      await axiosInstance.put(
        `/api/interview/submit-result/${id}`,
        scheduleData
      );
      Swal.fire({
        title: "Success",
        text: "Change has been successfully updated",
        icon: "success",
      });
      return true;
    } catch (error) {
      console.error("Error updating interview:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update change",
        icon: "error",
      });
      return false;
    }
  },

  cancelInterviewSchedule: async (id: string) => {
    try {
      const response = await axiosInstance.put(
        `/api/interview/cancel-schedule/${id}`
      );
      if (response.data.code === 200) {
        Swal.fire({
          title: "Cancelled!",
          text:
            response.data.message ||
            "The interview schedule has been cancelled.",
          icon: "success",
        });
        return true;
      } else {
        throw new Error(
          response.data.message || "Failed to cancel the interview schedule"
        );
      }
    } catch (error: any) {
      console.error("Error cancelling interview schedule:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to cancel the interview schedule",
        icon: "error",
      });
      return false;
    }
  },

  sendReminder: async (id: string) => {
    try {
      const response = await axiosInstance.post(
        `/api/interview/${id}/send-reminder`
      );
      if (response.data && response.data.message) {
        Swal.fire({
          title: "Success",
          text: response.data.message,
          icon: "success",
        });
        return true;
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to send reminder. Please try again.",
        icon: "error",
      });
      return false;
    }
  },

  getInitializeFormData: async (
    setJobs: Function,
    setCandidates: Function,
    setInterviewers: Function,
    setRoles: Function
  ) => {
    try {
      const response = await axiosInstance.get(
        "/api/interview/initialize-form-data"
      );
      const data = response.data;
      setJobs(data.jobs);
      setCandidates(data.openCandidates);
      setInterviewers(data.interviewers);
      setRoles(data.roles);
    } catch (error) {
      console.error("Error loading form data:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load form data. Please try again later.",
        icon: "error",
      });
    }
  },
};
