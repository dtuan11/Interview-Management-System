import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import "./StyleCreateInterview.css";
import axiosInstance from "../../services/axios";
import { jwtDecode } from "jwt-decode";
import { Helmet } from "react-helmet";
import { Button } from "primereact/button";
import { interviewScheduleApi } from "../../services/interviewSchedule";
import LoadingOverlay from "../../utils/LoadingOverlay";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";

const CreateInterviewSchedule: React.FC = () => {
  const [scheduleTitle, setScheduleTitle] = useState<string>("");
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleFrom, setScheduleFrom] = useState<string>("");
  const [scheduleTo, setScheduleTo] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [jobId, setJobId] = useState<number | null>(null);
  const [interviewerIds, setInterviewerIds] = useState<number[]>([]);
  const [location, setLocation] = useState<string>("");
  const [recruiterOwnerId, setRecruiterOwnerId] = useState<number | null>(null);
  const [meetingId, setMeetingId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [scheduleDateError, setScheduleDateError] = useState<string>("");
  const [scheduleTimeError, setScheduleTimeError] = useState<string>("");

  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const [currentUser, setCurrentUser] = useState<JwtPayload | null>(null);
  const recruiterOwnerSelectRef = useRef<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  interface JwtPayload {
    userId: number;
    role: string[];
    sub: string;
  }

  useEffect(() => {
    setLoading(true);
    loadFormData();
    getCurrentUser();
  }, []);

  useEffect(() => {
    validateScheduleDate();
  }, [scheduleDate]);

  useEffect(() => {
    validateScheduleTime();
  }, [scheduleFrom, scheduleTo]);

  const loadFormData = async () => {
    setLoading(true);
    await interviewScheduleApi.getInitializeFormData(
      setJobs,
      setCandidates,
      setInterviewers,
      setRoles
    );
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !scheduleTitle ||
      !scheduleDate ||
      !scheduleFrom ||
      !scheduleTo ||
      !candidateId ||
      !jobId ||
      interviewerIds.length === 0 ||
      !recruiterOwnerId
    ) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields.",
        icon: "error",
      });
      return;
    }

    if (scheduleDateError || scheduleTimeError) {
      Swal.fire({
        title: "Error",
        text: "Please fix the errors before submitting.",
        icon: "error",
      });
      return;
    }

    const scheduleData = {
      scheduleTitle,
      candidateDTO: { id: candidateId },
      scheduleDate,
      scheduleFrom,
      scheduleTo,
      note,
      job: { jobId: jobId },
      interviewers: interviewerIds.map((id) => ({ id })),
      location,
      recruiterOwner: { id: recruiterOwnerId },
      meetingId,
    };

    setLoading(true);
    await interviewScheduleApi
      .createInterviewSchedule(scheduleData)
      .then((response) => {
        console.log(response.message);
        Swal.fire({
          title: response.message,
          icon: "success",
          confirmButtonText: "Close",
        }).then(() => {
          navigate("/interview-list");
        });
      })
      .catch((error) => {
        console.log("Error:", error);
        Swal.fire({
          title: error,
          icon: "error",
          text: "Please try later.",
          confirmButtonText: "Close",
        });
      })
      .finally(() => setLoading(false));

    // if (success) {
    //   navigate("/interview-list");
    // }
  };

  const validateScheduleDate = () => {
    if (scheduleDate && scheduleDate < currentDate) {
      setScheduleDateError("Schedule date cannot be in the past.");
    } else {
      setScheduleDateError("");
    }
  };

  const validateScheduleTime = () => {
    if (scheduleFrom && scheduleTo && scheduleFrom >= scheduleTo) {
      setScheduleTimeError("Schedule end time must be after start time.");
    } else {
      setScheduleTimeError("");
    }
  };

  const handleCancel = () => {
    navigate("/interview-list");
  };

  const handleInterviewerChange = (selectedOptions: any) => {
    const selectedIds = selectedOptions.map((option: any) => option.value);
    setInterviewerIds(selectedIds);
  };

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
      setRecruiterOwnerId(currentUserId);

      // Find the recruiter option that matches the current user's ID
      const recruiterOption = roles.find(
        (recruiter) => recruiter.id === currentUserId
      );

      if (recruiterOption && recruiterOwnerSelectRef.current) {
        // Update the Select component's value
        recruiterOwnerSelectRef.current.setValue({
          value: recruiterOption.id,
          label: `${recruiterOption.fullName} (${recruiterOption.username})`,
        });
      } else {
        console.error("Recruiter not found or Select ref is not available");
      }
    } else {
      Swal.fire({
        title: "Error",
        text: "Unable to assign. Current user information not available.",
        icon: "error",
      });
    }
  };

  if (loading) return <LoadingOverlay isLoading={true} />;

  const handleCandidateChange = (selectedOption: any) => {
    setCandidateId(selectedOption.value);

    // Tìm candidate được chọn
    const selectedCandidate = candidates.find(
      (c) => c.id === selectedOption.value
    );

    if (selectedCandidate && selectedCandidate.recruiterId) {
      setRecruiterOwnerId(selectedCandidate.recruiterId);

      // Cập nhật giá trị của Select component cho Recruiter
      if (recruiterOwnerSelectRef.current) {
        recruiterOwnerSelectRef.current.setValue({
          value: selectedCandidate.recruiterId,
          label: `${selectedCandidate.recruiterName} (${selectedCandidate.recruiterUserName})`,
        });
      }
    }
  };

  return (
    <div id="create-interview-schedule" className="create-interview-container">
      <Helmet>
        <title>Create Interview Schedule</title>
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
        <span className="nav-link active">New Interview Schedule</span>
      </nav> */}

      <div className="backto-div">
        <Button
          label=" Back to Interview Schedule list"
          text
          icon="pi pi-angle-double-left"
          className="backto"
          onClick={() => navigate("/interview-list")}
        />
      </div>
      <div className="content-form">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="scheduleTitle">
                Schedule title <span className="required">*</span>
              </label>
              <input
                type="text"
                className="mt-0"
                id="scheduleTitle"
                placeholder="Enter schedule title..."
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                required
                maxLength={256}
              />
            </div>

            <div className="form-group">
              <label htmlFor="job">
                Job <span className="required">*</span>
              </label>
              <Select
                options={jobs
                  .filter((job) => job.isActive == "1")
                  .map((job) => ({
                    value: job.jobId,
                    label: job.jobTitle,
                  }))}
                onChange={(selectedOption: any) =>
                  setJobId(selectedOption.value)
                }
                placeholder="Select job..."
                styles={customStyles}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="candidateName">
                Candidate name <span className="required">*</span>
              </label>
              <Select
                options={candidates
                  .filter((candidate) => candidate.isActive)
                  .map((candidate) => ({
                    value: candidate.id,
                    label: candidate.fullName,
                  }))}
                onChange={handleCandidateChange}
                placeholder="Select candidate..."
                styles={customStyles}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="interviewer">
                Interviewer <span className="required">*</span>
              </label>
              <Select
                isMulti
                options={interviewers
                  .filter((interviewer) => interviewer.isActive == "true")
                  .map((interviewer) => ({
                    value: interviewer.id,
                    label: `${interviewer.fullName} (${interviewer.username})`,
                  }))}
                onChange={handleInterviewerChange}
                placeholder="Select interviewer"
                styles={customStyles}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="scheduleDate">
                Schedule Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="mt-1"
                id="scheduleDate"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                required
              />
              <br />

              {scheduleDateError && (
                <span className="error">{scheduleDateError}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="recruiterOwner">
                Recruiter Owner <span className="required">*</span>
              </label>
              <Select
                ref={recruiterOwnerSelectRef}
                options={roles
                  .filter((recruiter) => recruiter.isActive == "true")
                  .map((recruiter) => ({
                    value: recruiter.id,
                    label: `${recruiter.fullName} (${recruiter.username})`,
                  }))}
                onChange={(selectedOption: any) =>
                  setRecruiterOwnerId(selectedOption.value)
                }
                //placeholder="Select recruiter owner..."
                styles={customStyles}
                isDisabled
              />

              {/* <Button
                label="Assign me"
                type="button"
                link
                className="ass-me"
                onClick={handleAssignMe}
              /> */}

              {/* <a
                type="button"
                className="assign-me-button"
                onClick={handleAssignMe}
              >
                Assign Me
              </a> */}
            </div>
          </div>

          <div className="form-row start">
            <div className="form-group time-group">
              <div className="time-input">
                <label htmlFor="scheduleFrom">
                  From <span className="required">*</span>
                </label>
                <input
                  style={{ width: "65%" }}
                  type="time"
                  id="scheduleFrom"
                  value={scheduleFrom}
                  onChange={(e) => setScheduleFrom(e.target.value)}
                  required
                />
              </div>
              <div className="time-input">
                <label htmlFor="scheduleTo">
                  To <span className="required">*</span>
                </label>
                <input
                  style={{ width: "65%" }}
                  type="time"
                  id="scheduleTo"
                  value={scheduleTo}
                  onChange={(e) => setScheduleTo(e.target.value)}
                  required
                />
                <br />
                {scheduleTimeError && (
                  <span style={{ width: "20%" }} className="error">
                    {scheduleTimeError}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-row start">
            <div className="form-group">
              <label htmlFor="note">Notes</label>
              <textarea
                id="note"
                placeholder="Type schedule note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={256}
              />
            </div>

            <div className="form-group">
              <label>
                Interview Type <span className="required">*</span>
              </label>
              <div className="flex align-items-center">
                <RadioButton
                  inputId="online"
                  checked={isOnline}
                  onChange={(e: CheckboxChangeEvent) => {
                    setIsOnline(e.value);
                    setIsOffline(!e.value);
                  }}
                  value={true}
                  required
                />
                <label htmlFor="online" className="ml-2">
                  Online
                </label>

                <RadioButton
                  inputId="offline"
                  checked={isOffline}
                  onChange={(e: CheckboxChangeEvent) => {
                    setIsOffline(e.value);
                    setIsOnline(!e.value);
                  }}
                  value={true}
                  required
                />
                <label htmlFor="offline" className="ml-2">
                  Offline
                </label>
              </div>

              {isOffline && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      placeholder="Type a location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={256}
                      required={isOffline}
                    />
                  </div>
                </div>
              )}

              {isOnline && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="meetingId">Meeting ID</label>
                    <input
                      type="url"
                      id="meetingId"
                      placeholder="Enter Meeting ID..."
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      maxLength={256}
                      required={isOnline}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="button-submit">
              Submit
            </button>
            <button
              type="button"
              className="button-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterviewSchedule;
