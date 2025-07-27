import { useState, useEffect } from "react";
import axiosInstance from "./axios";
import Swal from "sweetalert2";
import AuthService from "./auth";

interface JobSubmission {
  jobTitle: string;
  startDate: string | null;
  endDate: string | null;
  jobSkills: string;
  jobBenefit: string;
  jobLevel: string;
  salaryRangeFrom: number | null;
  salaryRangeTo: number | null;
  workingAddress: string;
  jobDescription: string;
  jobStatus: string;
  updateById: number | null;
}

const showErrorNotification = (message: string) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
  });
};

const loadJobData = async (
  pageNumber: number,
  keyword: string,
  jobStatus: string | null,
  setJobList: React.Dispatch<React.SetStateAction<any[]>>,
  setTotalRecords: React.Dispatch<React.SetStateAction<number>>,
  setLoading: (value: boolean) => void,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<number> => {
  setLoading(true);
  setError(null);

  const params: any = {
    jobTitle: keyword,
    page: pageNumber - 1,
    size: 10,
    timestamp: new Date().getTime(),
  };

  if (jobStatus !== null && jobStatus !== "") {
    params.jobStatus = jobStatus;
  }

  try {
    const response = await axiosInstance.get("/api/job/getJobs", { params });
    const data = response.data;
    if (data) {
      setJobList(data.content || []);
      setTotalRecords(data.page.totalElements || 0);
      return data.page.totalElements || 0;
    } else {
      throw new Error("Failed to load job data");
    }
  } catch (error) {
    console.error("Error loading job data:", error);
    showErrorNotification("Load Data Failed");
    setError("An error occurred while loading job data. Please try again.");
    return 0;
  } finally {
    setLoading(false);
  }
};

const getCommonValues = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/api/job/common-values");
    return response.data;
  } catch (error) {
    console.error("Error fetching common values:", error);
    showErrorNotification("Load Data Failed");
    throw error;
  }
};

const getJobDetails = async (jobId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/api/job/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job details:", error);
    showErrorNotification("Load Data Failed");
    throw error;
  }
};

const createJob = async (jobData: JobSubmission): Promise<any> => {
  try {
    const response = await axiosInstance.post("/api/job/saveJob", jobData);
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    showErrorNotification("Failed to create job");
    throw error;
  }
};

const updateJob = async (
  jobId: string,
  jobData: JobSubmission
): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      `/api/job/update/${jobId}`,
      jobData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job:", error);
    showErrorNotification("Failed to update job");
    throw error;
  }
};

const deleteJob = async (jobId: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/api/job/delete/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error);
    showErrorNotification("Failed to delete job");
    throw error;
  }
};

const importJobs = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const currentUserId = await AuthService.getCurrentUserId();
    if (currentUserId === null) {
      throw new Error("User ID not found");
    }
    formData.append("userId", currentUserId.toString());

    const response = await axiosInstance.post("/api/job/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error importing jobs:", error);
    showErrorNotification("Failed to import jobs");
    throw error;
  }
};

const JobService = {
  loadJobData,
  getJobDetails,
  createJob,
  updateJob,
  deleteJob,
  importJobs,
  getCommonValues,
};

export default JobService;
