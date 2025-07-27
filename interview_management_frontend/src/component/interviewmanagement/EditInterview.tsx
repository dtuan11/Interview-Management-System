import React, { useEffect, useRef, useState } from "react";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Select from "react-select";
import "./EditInterview.css";
import axiosInstance from "../../services/axios";
import Swal from "sweetalert2";
import { Button } from "primereact/button";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { Label } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { interviewScheduleApi } from "../../services/interviewSchedule";
import LoadingOverlay from "../../utils/LoadingOverlay";

const EditInterview: React.FC = () => {
  const { interviewScheduleId } = useParams<{ interviewScheduleId: string }>();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const fromPath = searchParams.get("from") || "/interview-list";
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    scheduleTitle: "",
    candidateId: null as number | null,
    candidateName: "",
    scheduleDate: "",
    scheduleFrom: "",
    scheduleTo: "",
    note: "",
    jobId: null as number | null,
    jobTitle: "",
    interviewerIds: [] as number[],
    location: "",
    recruiterOwnerId: null as number | null,
    recruiterName: "",
    recruiterUserName: "",
    meetingId: "",
    result: "",
    status: "",
  });

  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [scheduleDateError, setScheduleDateError] = useState<string>("");
  const [scheduleTimeError, setScheduleTimeError] = useState<string>("");

  const formatDateForInput = (dateString: string) => {
    return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
  };

  const [currentUser, setCurrentUser] = useState<JwtPayload | null>(null);
  const recruiterOwnerSelectRef = useRef<any>(null);
  const [candidateError, setCandidateError] = useState<string>("");
  const [jobError, setJobError] = useState<string>("");
  const [interviewersError, setInterviewersError] = useState<string>("");
  const [recruiterError, setRecruiterError] = useState<string>("");

  interface JwtPayload {
    userId: number;
    role: string[];
    sub: string;
  }

  useEffect(() => {
    const fetchInterviewEdit = async () => {      
       
setLoading(true);
      try { 
        await interviewScheduleApi.getInitializeFormData(
          setJobs,
          setCandidates,
          setInterviewers,
          setRoles
        );
        
        await interviewScheduleApi.getInterviewSchedule(
          interviewScheduleId!,
          (interviewData: any) => {
            setInterview(interviewData);
            setFormData({
              scheduleTitle: interviewData.scheduleTitle || "",
              candidateId: interviewData.candidateDTO.id || null,
              candidateName: interviewData.candidateDTO.fullName || "",
              scheduleDate:
                formatDateForInput(interviewData.scheduleDate) || "",
              scheduleFrom: interviewData.scheduleFrom || "",
              scheduleTo: interviewData.scheduleTo || "",
              note: interviewData.note || "",
              jobId: interviewData.job.jobId || null,
              jobTitle: interviewData.job.jobTitle || "",
              interviewerIds:
                interviewData.interviewers.map(
                  (interviewer: any) => interviewer.id
                ) || [],
              location: interviewData.location || "",
              recruiterOwnerId: interviewData.recruiterOwner.id || null,
              recruiterName: interviewData.recruiterOwner.fullName || "",
              recruiterUserName: interviewData.recruiterOwner.username || "",
              meetingId: interviewData.meetingId || "",
              result: interviewData.result || "",
              status: interviewData.status || "",
            });

            if (
              interviewData.candidateDTO &&
              !interviewData.candidateDTO.isActive
            ) {
              setCandidateError("This candidate is banned");
            }
            if (interviewData.job && interviewData.job.isActive !== "1") {
              setJobError("This job is inactive");
            }
            const bannedInterviewers = interviewData.interviewers
            .filter((interviewer: any) => interviewer.isActive !== "true")
            .map((interviewer: any) => interviewer.username);
          
          if (bannedInterviewers.length > 0) {
            setInterviewersError(`The following interviewers are banned: ${bannedInterviewers.join(", ")}`);
          }
          
            if (
              interviewData.recruiterOwner &&
              interviewData.recruiterOwner.isActive !== "true"
            ) {
              setRecruiterError("This recruiter is banned");
            }
          },
          setError
        );
      
        
      } finally {
        setLoading(false);
      }
    };
    getCurrentUser();
    fetchInterviewEdit();
  }, [interviewScheduleId]);

  const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayload;
        setCurrentUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
        Swal.fire({
          title: "Error",
          text: "Unable to get current user information.",
          icon: "error",
        });
      }
    } else {
      console.error("No token found");
      Swal.fire({
        title: "Error",
        text: "You are not authenticated. Please log in.",
        icon: "error",
      });
    }
  };

  const handleAssignMe = () => {
    if (currentUser) {
      const currentUserId = currentUser.userId;
      const currentRecruiter = roles.find((r) => r.id === currentUserId);

      if (currentRecruiter) {
        setFormData((prevData) => ({
          ...prevData,
          recruiterOwnerId: currentUserId,
          recruiterName: currentRecruiter.fullName,
          recruiterUserName: currentRecruiter.username,
        }));

        if (recruiterOwnerSelectRef.current) {
          recruiterOwnerSelectRef.current.setValue({
            value: currentUserId,
            label: `${currentRecruiter.fullName} (${currentRecruiter.username})`,
          });
        }
      } else {
        Swal.fire({
          title: "Error",
          text: "You are not registered as a recruiter.",
          icon: "error",
        });
      }
    } else {
      Swal.fire({
        title: "Error",
        text: "Unable to assign. Current user information not available.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    validateScheduleDate();
  }, [formData.scheduleDate]);

  useEffect(() => {
    validateScheduleTime();
  }, [formData.scheduleFrom, formData.scheduleTo]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string) => (selectedOption: any) => {
    if (name === "candidateId") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedOption ? selectedOption.value : null,
        candidateName: selectedOption ? selectedOption.label : "",
      }));
    } else if (name === "jobId") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedOption ? selectedOption.value : null,
        jobTitle: selectedOption ? selectedOption.label : "",
      }));
    } else if (name === "recruiterOwnerId") {
      const [fullName, username] = selectedOption
        ? selectedOption.label.split(" (")
        : ["", ""];
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedOption ? selectedOption.value : null,
        recruiterName: fullName,
        recruiterUserName: username.slice(0, -1), // Remove the closing parenthesis
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedOption ? selectedOption.value : null,
      }));
    }
  };

  const handleMultiSelectChange = (selectedOptions: any) => {
    const selectedIds = selectedOptions.map((option: any) => option.value);
    setFormData((prevData) => ({
      ...prevData,
      interviewerIds: selectedIds,
    }));
  };

  const validateScheduleDate = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    if (formData.scheduleDate && formData.scheduleDate < currentDate) {
      setScheduleDateError("Schedule date cannot be in the past.");
    } else {
      setScheduleDateError("");
    }
  };

  const validateScheduleTime = () => {
    if (
      formData.scheduleFrom &&
      formData.scheduleTo &&
      formData.scheduleFrom >= formData.scheduleTo
    ) {
      setScheduleTimeError("Schedule end time must be after start time.");
    } else {
      setScheduleTimeError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate required fields
    if (
      !formData.scheduleTitle ||
      !formData.scheduleDate ||
      !formData.scheduleFrom ||
      !formData.scheduleTo ||
      !formData.candidateId ||
      !formData.jobId ||
      formData.interviewerIds.length === 0 ||
      !formData.recruiterOwnerId
    ) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields.",
        icon: "error",
      });
      return;
    }
  
    // Validate for any schedule errors
    if (scheduleDateError || scheduleTimeError) {
      Swal.fire({
        title: "Error",
        text: "Please fix the errors before submitting.",
        icon: "error",
      });
      return;
    }
  
    try {
      const updatedData = {
        ...interview,
        ...formData,
        candidateDTO: {
          id: formData.candidateId,
          fullName: formData.candidateName,
        },
        job: { jobId: formData.jobId, jobTitle: formData.jobTitle },
        interviewers: formData.interviewerIds.map((id) => ({ id })),
        recruiterOwner: {
          id: formData.recruiterOwnerId,
          fullName: formData.recruiterName,
        },
      };
  
      let success;
  
      if (formData.result !== interview.result) {
        // If the Result field has changed, call submitInterviewResult API
        success = await interviewScheduleApi.submitInterviewResult(interviewScheduleId!, updatedData);
      } else {
        // If the Result field hasn't changed, call updateInterview API
        success = await interviewScheduleApi.updateInterviewSchedule(interviewScheduleId!, updatedData);
      }
  
      if (success) {
        Swal.fire({
          title: "Success",
          text: "Changes have been successfully updated",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/interview-list");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to update changes",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  
  if (error) return <div className="error-message">{error}</div>;

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      borderRadius: "4px",
      borderColor: "#ced4da",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const handleCancelSchedule = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to cancel this interview?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      const success = await interviewScheduleApi.cancelInterviewSchedule(
        interviewScheduleId!
      );
      if (success) {
        navigate("/interview-list");
      }
    }
  };

  const handleCancel = () => {
    const fromPath =
      location.state && (location.state as { from: string }).from
        ? (location.state as { from: string }).from
        : "/";
    navigate(fromPath);
  };

  const renderErrorMessage = (error: string) => {
    return error ? <span className="error-message">{error}</span> : null;
  };

  if (!interview) return <LoadingOverlay isLoading={true} />;


  const handleCandidateChange = (selectedOption: any) => {
    const selectedCandidate = candidates.find(c => c.id === selectedOption.value);
    
    setFormData(prevData => ({
      ...prevData,
      candidateId: selectedOption.value,
      candidateName: selectedOption.label,
      recruiterOwnerId: selectedCandidate ? selectedCandidate.recruiterId : null,
      recruiterName: selectedCandidate ? selectedCandidate.recruiterName : '',
      recruiterUserName: selectedCandidate ? selectedCandidate.recruiterUserName : '',
    }));

    if (selectedCandidate && recruiterOwnerSelectRef.current) {
      recruiterOwnerSelectRef.current.setValue({
        value: selectedCandidate.recruiterId,
        label: `${selectedCandidate.recruiterName} (${selectedCandidate.recruiterUserName})`
      });
    }
  };

  return (
    <div id="edit-interview" className="interview-edits-container">
      <Helmet>
        <title>Edit Interview Schedule</title>
      </Helmet>
      {/* <nav className="navbar">
        <Link
          to="/interview-list"
          className="nav-link"
          style={{ textDecorationLine: "underline", fontStyle: "italic" }}
        >
          Interview Schedule List
        </Link>
        <span>&gt;</span>
        <span className="nav-link active">Edit Interview Schedule</span>
      </nav> */}

      <div className="flex justify-content-between align-items-center">
        <div className="backto-div">
          <Button
            label=" Back to interview schedule list"
            text
            icon="pi pi-angle-double-left"
            className="backto"
            onClick={() => navigate("/interview-list")}
          />
        </div>
        <div>
          {formData.status !== "Cancelled" && (
            <div className="cancel-schedule ">
              <Button
                className="mr-0"
                label="Cancel Inteview Schedule"
                severity="danger"
                onClick={handleCancelSchedule}
              />
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="interview-edits-board">
        <div className="interview-edits">
          <div className="interview-edit left-column">
            <p>
              <span>
                Schedule Title <span className="required">*</span>
              </span>
              <input
                type="text"
                name="scheduleTitle"
                value={formData.scheduleTitle}
                onChange={handleInputChange}
                className="form-control"
                required
                maxLength={256}
              />
            </p>
            <p>
            <span>
              Candidate <span className="required">*</span>
            </span>
            <Select
              options={candidates
                .filter((candidate) => candidate.isActive)
                .map((candidate) => ({
                  value: candidate.id,
                  label: candidate.fullName,
                }))}
              value={{
                value: formData.candidateId,
                label: formData.candidateName,
              }}
              onChange={handleCandidateChange}
              placeholder="Select candidate..."
              styles={customStyles}
              required
            />
            {renderErrorMessage(candidateError)}
          </p>
            <p>
              <span>
                Schedule Date <span className="required">*</span>
              </span>
              <input
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleInputChange}
                className="form-control"
                required
              />
              {scheduleDateError && (
                <span className="error">{scheduleDateError}</span>
              )}
            </p>
            <p>
              <span>
                Schedule Time <span className="required">*</span>
              </span>
              <div className="time-inputs">
                <input
                  type="time"
                  name="scheduleFrom"
                  value={formData.scheduleFrom}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
                <span>-</span>
                <input
                  type="time"
                  name="scheduleTo"
                  value={formData.scheduleTo}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              {scheduleTimeError && (
                <span className="error">{scheduleTimeError}</span>
              )}
            </p>
            <p>
              <span>Notes</span>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={4}
                className="form-control"
                maxLength={256}
              />
            </p>
          </div>
          <div className="interview-edit right-column">
            <p>
              <span>
                Job <span className="required">*</span>
              </span>
              <Select
                options={jobs
                  .filter((job) => job.isActive == "1")
                  .map((job) => ({
                    value: job.jobId,
                    label: job.jobTitle,
                  }))}
                value={{ value: formData.jobId, label: formData.jobTitle }}
                onChange={handleSelectChange("jobId")}
                placeholder="Select job..."
                styles={customStyles}
                required
              />
              {renderErrorMessage(jobError)}
            </p>
            <p>
              <span>
                Interviewers <span className="required">*</span>
              </span>
              <Select
                isMulti
                options={interviewers
                  .filter((interview) => interview.isActive == "true")
                  .map((interviewer) => ({
                    value: interviewer.id,
                    label: interviewer.username,
                  }))}
                value={interviewers
                  .filter((i) => formData.interviewerIds.includes(i.id))
                  .map((i) => ({
                    value: i.id,
                    label: i.username,
                  }))}
                onChange={handleMultiSelectChange}
                placeholder="Select interviewers..."
                styles={customStyles}
                required
              />
              {renderErrorMessage(interviewersError)}
            </p>
            <p>
              <span>Location</span>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-control"
                maxLength={256}
              />
            </p>
            <p className="form-group">
            <span>
              Recruiter Owner <span className="required">*</span>
            </span>
            <div style={{ alignItems: "center" }}>
              <Select
                ref={recruiterOwnerSelectRef}
                options={candidates
                  .filter((role) => role.isActive == "true")
                  .map((role) => ({
                    value: role.id,
                    label: `${role.fullName} (${role.username})`,
                  }))}
                value={
                  formData.recruiterOwnerId &&
                  roles.find(
                    (role) =>
                      role.id === formData.recruiterOwnerId &&
                      role.isActive == "true"
                  )
                    ? {
                        value: formData.recruiterOwnerId,
                        label: `${formData.recruiterName} (${formData.recruiterUserName})`,
                      }
                    : null
                }
                onChange={handleSelectChange("recruiterOwnerId")}
                placeholder="Select recruiter owner..."
                styles={customStyles}
                required
                isDisabled={true}
              />
              {/* <a className="assign-me-button" onClick={handleAssignMe}>
                Assign Me
              </a> */}
            </div>
            {renderErrorMessage(recruiterError)}
          </p>
            <p>
              <span>Meeting ID</span>
              <input
                type="text"
                name="meetingId"
                value={formData.meetingId}
                onChange={handleInputChange}
                className="form-control"
                maxLength={256}
              />
            </p>
            <p>
              <span>Result</span>
              <select
                name="result"
                value={formData.result}
                onChange={handleInputChange}
              >
                <option value="N/A">Select Result</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>
            </p>
            <p>
              <span>Status</span> {formData.status}
            </p>
          </div>
        </div>
        <div className="button-group">
          {/* <button type="submit" className="button-submit">
            Update Interview
          </button> */}

          <Button
            label="Update Interview"
            severity="secondary"
            type="submit"
          ></Button>

          {/* <Link to={fromPath} className="button-cancel">
            Cancel
          </Link> */}

          <Button
            label="Cancel"
            severity="secondary"
            onClick={handleCancel}
          ></Button>
        </div>
      </form>
    </div>
  );
};

export default EditInterview;
