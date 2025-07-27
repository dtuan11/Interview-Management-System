import axiosInstance from "./axios";
import axiosCandidate from "./AxiosCandidate";

import Swal from 'sweetalert2';
import axios from 'axios';
import { format } from "date-fns";
import { COMMON_VALUE_NAMES } from "./commonValue";

export enum ACTION {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
};


export interface CandidateForm {
  fullName: string;
  email: string;
  gender: any;
  phoneNumber: string;
  address: string;
  dob: string;
  candidateStatus: any;
  cvAttachmentFile: File | null;
  cvAttachmentUrl: string;
  cvAttachmentFileName: string;
  position: any;
  skills: any;
  yearOfExperience: string;
  highest_level: any;
  createAt: string;
  updateAt: string;
  note: string;
  recruiterDTO: { id: string, fullName: string, username: string } | null;
  updaterDTO: { id: string, fullName: string, username: string } | null;
}

export const AddNewCandidate = async (formData: CandidateForm, updaterId: number) => {

  const form = new FormData();
  if (formData.cvAttachmentFile) {
    form.append('cvAttachmentFile', formData.cvAttachmentFile);
    form.append('cvAttachmentFileName', formData.cvAttachmentFile.name);
  }
  form.append('fullName', formData.fullName);
  form.append('email', formData.email);
  form.append('gender', formData.gender && formData.gender.value === 'true' ? 'true' : 'false');
  form.append('address', formData.address);
  form.append('dob', formData.dob ? format(formData.dob, 'yyyy-MM-dd') : '');
  form.append('candidateStatus', COMMON_VALUE_NAMES.OPEN);
  form.append('position', formData.position ? formData.position.value : '');
  form.append('skills', formData.skills.map((skill: any) => skill.value).join(', '));
  form.append('phoneNumber', formData.phoneNumber);
  form.append('highest_level', formData.highest_level ? formData.highest_level.value : '');
  form.append('note', formData.note);
  form.append('yearOfExperience', formData.yearOfExperience);
  form.append('createAt', new Date().toISOString().split('T')[0]);
  form.append('updateAt', new Date().toISOString().split('T')[0]);
  form.append('recruiterDTO.id', formData.recruiterDTO ? formData.recruiterDTO.id : '');
  form.append('recruiterDTO.fullName', formData.recruiterDTO ? formData.recruiterDTO.fullName : '');
  form.append('recruiterDTO.username', formData.recruiterDTO ? formData.recruiterDTO.username : '');
  form.append('updaterDTO.id', updaterId ? updaterId.toString() : '');
  form.append('updaterDTO.fullName', '');
  form.append('updaterDTO.username', '');

  try {
    const response = await axiosInstance.post('api/candidate/save-candidate', form);
    if (response) {
      return {
        response,
        message: "Successfully created candidate"
      };
    } else {
      return { message: "Failed to created candidate" };
    }
  } catch (error) {
    throw {
      error,
      message: "Error saving candidate.",
    };
    // console.error('Error saving candidate:', error);
    // Swal.fire('Error', 'There was an error saving the candidate.', 'error');
  }
};


export const UpdateCandidate = async (formData: CandidateForm, updaterId: number, candidateId: number) => {

  const form = new FormData();
  if (formData.cvAttachmentFile !== null && formData.cvAttachmentFile !== undefined) {
    form.append('cvAttachmentFile', formData.cvAttachmentFile);
    form.append('cvAttachmentFileName', formData.cvAttachmentFile.name);
  }
  form.append('candidateId', candidateId ? candidateId.toString() : '');
  form.append('fullName', formData.fullName);
  form.append('email', formData.email);
  form.append('gender', formData.gender && formData.gender.value === 'true' ? 'true' : 'false');
  form.append('address', formData.address);
  form.append('dob', formData.dob ? format(formData.dob, 'yyyy-MM-dd') : '');
  form.append('candidateStatus', formData.candidateStatus ? formData.candidateStatus.value : '');
  form.append('position', formData.position ? formData.position.value : '');
  form.append('skills', formData.skills.map((skill: any) => skill.value).join(', '));
  form.append('phoneNumber', formData.phoneNumber ? formData.phoneNumber : '');
  form.append('highest_level', formData.highest_level ? formData.highest_level.value : '');
  form.append('note', formData.note);
  form.append('yearOfExperience', formData.yearOfExperience);
  form.append('updateAt', new Date().toISOString().split('T')[0]);
  form.append('recruiterDTO.id', formData.recruiterDTO ? formData.recruiterDTO.id : '');
  form.append('recruiterDTO.fullName', formData.recruiterDTO ? formData.recruiterDTO.fullName : '');
  form.append('recruiterDTO.username', formData.recruiterDTO ? formData.recruiterDTO.username : '');
  form.append('updaterDTO.id', updaterId ? updaterId.toString() : 'null');
  form.append('updaterDTO.fullName', '');
  form.append('updaterDTO.username', '');

  try {
    const response = await axiosInstance.post('api/candidate/update-candidate', form);
    if (response) {
      return {
        response,
        message: response.data.message
      };
    } else {
      return { message: "Failed to updated change" };
    }
  } catch (error) {
    throw {
      error,
      message: "Failed to updated change.",
    };
  }

  //   Swal.fire({
  //     icon: 'success',
  //     title: 'Candidate Changed',
  //     text: 'Change has been successfully updated'
  //   }).then(() => {
  //     // navigate('/candidate-list');
  //   });
  // } catch (error) {
  //   console.error('Failed to updated change: ', error);
  //   Swal.fire('Error', 'Failed to updated change', 'error');
  // }
};


export const getAllRecruiters = async () => {
  try {
    const response = await axiosInstance.get('/api/candidate/get-all-recruiter');
    return response.data.data.map((recruiter: any) => ({
      value: recruiter.id,
      label: `${recruiter.fullName} (${recruiter.username})`
    }));
  } catch (error) {
    console.error('Error fetching recruiters:', error);
    throw error;
  }
};

export const getCandidateById = async (candidateId: number) => {
  try {
    const response = await axiosInstance.post('/api/candidate/get-candidate-detail', null, {
      params: { candidateId }
    });
    return response.data.data;
  } catch (error) {
    console.log("Error:", error);
    Swal.fire({
      title: "Load Data Fail",
      icon: "error",
      text: "Please try later.",
      confirmButtonText: "Close",
    });
    throw error;
  }
};


export const deleteById = async (candidateId: number, updaterId: number) => {
  await Swal.fire({
    title: "Are you sure you want to delete this candidate?",
    icon: "warning",
    confirmButtonText: "Yes",
    showCancelButton: true,
    cancelButtonText: "No",
  }).then((result) => {
    if (result.isConfirmed) {
      axiosInstance.post("/api/candidate/delete-candidate", null, {
        params: {
          candidateId: candidateId,
          updaterId: updaterId
        }
      })
        .then((response) => {
          console.log(response.data.message);
          Swal.fire({
            title: "Delete successfully",
            icon: "success",
            confirmButtonText: "Close",
          }).then(() => {
            window.location.reload();
          });
        })
        .catch((error) => {
          console.log("Error:", error);
          Swal.fire({
            title: "Delete candidate Fail",
            icon: "error",
            text: "Please try later.",
            confirmButtonText: "Close",
          });
        });
    }
  });
};


export const handleBan = async (candidateId: number, updaterId: number) => {
  try {
    const response = await axiosInstance.post("/api/candidate/ban-candidate", null, {
      params: {
        candidateId: candidateId,
        updaterId: updaterId
      }
    });
    if (response) {
      return {
        response,
        message: "Candidate has been banned"
      };
    } else {
      return { message: "Ban candidate Fail" };
    }

  } catch (error) {
    throw {
      error,
      message: "Internal server error.",
    };
  }
};


export const handleUnban = async (candidateId: number, updaterId: number) => {
  try {
    const response = await axiosInstance.post("/api/candidate/unban-candidate", null, {
      params: {
        candidateId: candidateId,
        updaterId: updaterId
      }
    });
    if (response) {
      return {
        response,
        message: "Candidate has been unbanned"
      };
    } else {
      return { message: "unban candidate Fail" };
    }

  } catch (error) {
    throw {
      error,
      message: "Internal server error.",
    };
  }
};

const getAllCandidate = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/candidate/getAllCandidateName`
    );
    if (response) {
      return {
        response,
        message: "Get the list of candidate successfully"
      };
    } else {
      return { message: "Get the list of candidate failure" };
    }

  } catch (error) {
    throw {
      error,
      message: "Internal server error.",
    };
  }
};

export const validateCandidateForm = async (formData: any, action: string): Promise<boolean> => {
  if (!formData.fullName.trim()) {
    Swal.fire('Error', 'Please fill out Full name field', 'error');
    return false;
  } else if (/[0-9!@#$%^&*()_+=\[\]{};:'",.<>?/\\|`~\-]/.test(formData.fullName.trim())) { 
    Swal.fire('Error', 'Please enter only letter in Full name field', 'error');
    return false;
  }

  if (ACTION.ADD === action) {
    if (!formData.email.trim()) {
      Swal.fire('Error', 'Please fill out Email field', 'error');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Swal.fire('Error', 'Invalid email address', 'error');
      return false;
    } else {
      // Check if email already exists
      const emailExists = await checkEmailHasAlready(formData.email);
      if (emailExists) {
        Swal.fire('Error', 'Email address already exists', 'error');
        return false;
      }
    }


    if (formData.phoneNumber.trim()) {

      const phoneNumberPattern = /^\+?[0-9]{10,15}$/;
      if (!phoneNumberPattern.test(formData.phoneNumber)) {
        Swal.fire('Error', 'Phone number must contain 10 to 15 digits and may start with a "+"', 'error');
        return false;
      }
      // Check if phone number already exists
      const phoneExists = await checkPhoneNumberExists(formData.phoneNumber);
      if (phoneExists) {
        Swal.fire('Error', 'Phone number already exists', 'error');
        return false;
      }
    }

  }

  if (!formData.gender) {
    Swal.fire('Error', 'Please fill out Gender field', 'error');
    return false;
  }

  if (formData.dob) {
    const dobDate = new Date(formData.dob);
    const today = new Date();
    const age = new Date().getFullYear() - dobDate.getFullYear();
    today.setHours(0, 0, 0, 0);

    if (age < 18) {
      Swal.fire('Error', 'Candidate age must be 18 years or older', 'error');
      return false;
    } else if (age > 60) {
      Swal.fire('Error', 'Candidate age must be 60 or younger', 'error');
      return false;
    }
  }
  console.log("file:", formData.cvAttachmentFile);

  if(formData.cvAttachmentFile && formData.cvAttachmentFile !== undefined) {
    const fileSizeLimit = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (formData.cvAttachmentFile.size > fileSizeLimit) {
      Swal.fire('Error', 'File size exceeds 10mb', 'error');
      return false;
    } else if (!allowedTypes.includes(formData.cvAttachmentFile.type)) {
      Swal.fire('Error', 'Only .pdf or .docx files are accepted.', 'error');
      return false;

    }
  }

  if (!formData.position) {
    Swal.fire('Error', 'Please fill out Position field', 'error');
    return false;
  }

  if (formData.skills.length === 0) {
    Swal.fire('Error', 'At least one skill is required', 'error');
    return false;
  }

  if (formData.yearOfExperience) {
    if (isNaN(formData.yearOfExperience) || formData.yearOfExperience < 0) {
      Swal.fire('Error', 'Year of experience must be a number greater than 0', 'error');
      return false;
    }

  }

  // if (!formData.candidateStatus) {
  //   Swal.fire('Error', 'Please fill out Candidate status field', 'error');
  //   return false;
  // }

  if (!formData.highest_level) {
    Swal.fire('Error', 'Please fill out Highest level field', 'error');
    return false;
  }

  if (!formData.recruiterDTO) {
    Swal.fire('Error', 'Please fill out Recruiter field', 'error');
    return false;
  }

  return true;
};

export const formatDateString = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

export const checkEmailHasAlready = async (email: string): Promise<boolean> => {
  const encodedEmail = encodeURIComponent(email);
  const url = `/api/candidate/is-exists-email?email=${encodedEmail}`;
  try {
    const response = await axiosInstance.get(url);
    return response.data === true;
  } catch (error: any) {
    if (error.response.status == 500) {
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
  const url = `/api/candidate/is-exists-phone?phone=${phoneNumber}`;
  try {
    const response = await axiosInstance.get(url);
    // console.log("Phone check response:", response.data);
    return response.data === true;
  } catch (error: any) {
    if (error.response.status == 500) {
      throw new Error(
        error.response.data.message ||
        "An error occurred while checking phone number"
      );
    }
    // console.error("Error checking phone number:", error);
    return false;
  }
};
const CandidateService = {
  AddNewCandidate,
  getAllCandidate,
  getAllRecruiters,
  getCandidateById,
  validateCandidateForm,
  UpdateCandidate,
  deleteById,
  formatDateString,
  handleBan,
  handleUnban,
  checkEmailHasAlready,
  checkPhoneNumberExists
  // handleEdit
};

export default CandidateService;