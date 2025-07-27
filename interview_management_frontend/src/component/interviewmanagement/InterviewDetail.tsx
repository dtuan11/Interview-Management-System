import React, { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import "../interviewmanagement/InterviewDetail.css";
import axiosInstance from "../../services/axios";
import { Button } from "primereact/button";
import { jwtDecode } from "jwt-decode";
import { Helmet } from "react-helmet";
import { interviewScheduleApi } from "../../services/interviewSchedule";
import LoadingOverlay from "../../utils/LoadingOverlay";
import { spawn } from "child_process";
import { Tooltip } from "primereact/tooltip";

interface JwtPayLoad {
  userId: number;
  role: string[];
  sub: string;
}

const InterviewDetail: React.FC = () => {
  const { interviewScheduleId } = useParams<{ interviewScheduleId: string }>();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const fromPath = searchParams.get("from") || "/interview-list";
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const canSendReminder = ["ADMIN", "RECRUITER", "MANAGER"].includes(userRole);
  const canEdit = ["ADMIN", "RECRUITER", "MANAGER"].includes(userRole);
  const canSubmitResult = ["INTERVIEWER"].includes(userRole);
  const [currentUserId, setcurrentUserId] = useState<number>(0);

  useEffect(() => {
    const fetchInterviewDetails = () => {
      setLoading(true);
      interviewScheduleApi.getInterviewSchedule(
        interviewScheduleId!,
        setInterview,
        setError
      );
      setLoading(false);
    };

    fetchInterviewDetails();
    getUserRole();
  }, [interviewScheduleId]);

  const handleSendReminder = async () => {
    const success = await interviewScheduleApi.sendReminder(
      interviewScheduleId!
    );
    if (success) {
      navigate("/interview-list");
    }
  };

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayLoad;
        setcurrentUserId(decodedToken.userId);
        setUserRole(decodedToken.role[0]);
      } catch (error) {
        console.error("Invalid token", error);
        navigate("/login");
      }
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // if (!interview) {
  //   return <div className="no-data">No interview details available</div>;
  // }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const handleEdit = (interviewScheduleId: any) => {
    if (interviewScheduleId) {
      navigate(`/interview-edit/${interviewScheduleId}`, {
        state: { from: window.location.pathname },
      });
    }
  };
  if (!interview) return <LoadingOverlay isLoading={true} />;

  return (
    <div
      id="interview-detail"
      className="interview-details-container id-interview-detail"
    >
      <Helmet>
        <title>Interview Schedule Details</title>
      </Helmet>

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
        {canSendReminder && (
          <div className="send-schedule">
            <Button
              style={{
                backgroundColor: "var(--cyan-400)",
                borderRadius: "var(--border-radius)",
              }}
              className="mr-0 border-200"
              label="Send Reminder"
              // severity="secondary"
              onClick={handleSendReminder}
            />
          </div>
        )}
      </div>
      {/* <nav className="navbar">
        <Link
          to="/interview-list"
          className="nav-link"
          style={{ fontStyle: "italic", textDecorationLine: "underline" }}
        >
          Interview Schedule List
        </Link>
        <span className="nav-separator">&gt;</span>
        <span className="nav-link active">Interview Schedule Detail</span>
      </nav> */}

      <div className="interview-details-board">
        <div className="interview-details">
          <div className="interview-detail left-column">
            <p>
              <strong>Schedule Title:</strong> {interview.scheduleTitle}
            </p>
            <p>
              <strong>Candidate:</strong>{" "}
              {interview.candidateDTO && (
                <React.Fragment key={interview.candidateDTO.id}>
                  <span
                    className={
                      interview.candidateDTO.isActive
                        ? "p-tooltip-target"
                        : "p-tooltip-target text-danger"
                    }
                    data-pr-tooltip={
                      interview.candidateDTO.isActive
                        ? interview.candidateDTO.fullName
                        : interview.candidateDTO.fullName + " (BANNED)"
                    }
                  >
                    {interview.candidateDTO.fullName}
                  </span>
                </React.Fragment>
              )}
              <Tooltip target=".p-tooltip-target" position="bottom" />
            </p>

            <p>
              <strong>Schedule Date:</strong>{" "}
              {formatDate(interview.scheduleDate)}
            </p>
            <p>
              <strong>Schedule Time:</strong>{" "}
              {formatTime(interview.scheduleFrom)} -{" "}
              {formatTime(interview.scheduleTo)}
            </p>
            <p>
              <strong>Notes:</strong> {interview.note}
            </p>
          </div>
          <div className="interview-detail right-column">
            <p>
              <strong>Job:</strong>{" "}
              {interview.job && (
                <React.Fragment key={interview.job.jobId}>
                  <span
                    className={
                      interview.job.isActive === "1"
                        ? "p-tooltip-target"
                        : "p-tooltip-target text-danger"
                    }
                    data-pr-tooltip={
                      interview.job.isActive === "1"
                        ? interview.job.jobTitle
                        : interview.job.jobTitle + " (INACTIVE)"
                    }
                  >
                    {interview.job.jobTitle}
                  </span>
                </React.Fragment>
              )}
              <Tooltip target=".p-tooltip-target" position="bottom" />
            </p>

            <p>
              <strong>Interviewers:</strong>{" "}
              {interview.interviewers &&
                interview.interviewers.map(
                  (interviewer: any, index: number) => (
                    <React.Fragment key={interviewer.id || index}>
                      <span
                        className={
                          interviewer.isActive === "true"
                            ? "p-tooltip-target"
                            : "p-tooltip-target text-danger"
                        }
                        data-pr-tooltip={
                          interviewer.isActive === "true"
                            ? interviewer.fullName
                            : interviewer.fullName + " (BANNED)"
                        }
                      >
                        {interviewer.username}  ({interviewer.fullName})
                      </span>
                      {index < interview.interviewers.length - 1 ? ", " : ""}
                    </React.Fragment>
                  )
                )}
              <Tooltip target=".p-tooltip-target" position="bottom" />
            </p>
            <p>
              <strong>Location:</strong> {interview.location}
            </p>
            <p>
              <strong>Recruiter Owner:</strong>{" "}
              {interview.recruiterOwner && (
                <React.Fragment key={interview.recruiterOwner.id}>
                  <span
                    className={
                      interview.recruiterOwner.isActive === "true"
                        ? "p-tooltip-target"
                        : "p-tooltip-target text-danger"
                    }
                    data-pr-tooltip={
                      interview.recruiterOwner.isActive === "true"
                        ? interview.recruiterOwner.fullName
                        : interview.recruiterOwner.fullName + " (BANNED)"
                    }
                  >
                    {interview.recruiterOwner.username} ({interview.recruiterOwner.fullName})
                  </span>
                  <Tooltip target=".p-tooltip-target" position="bottom" />
                </React.Fragment>
              )}
            </p>

            <p>
              <strong>Meeting ID:</strong> {interview.meetingId}
            </p>
            <p>
              <strong>Result:</strong> {interview.result}
            </p>
            <p>
              <strong>Status:</strong> {interview.status}
            </p>
          </div>
        </div>

        <div className="button-group">
          {" "}
          {canEdit && interview.status == "New" && (
            <Button
              severity="secondary"
              className="mr-2"
              label="Edit"
              onClick={() => handleEdit(interviewScheduleId)}
            ></Button>
          )}{" "}
          {userRole === "INTERVIEWER" &&
   (interview.status === "New" || interview.status === "Invited") &&
   interview.interviewers.some((interviewer: any) => interviewer.id === currentUserId) && (
    <Link
      to={`/interview-submit-result/${interviewScheduleId}`}
      className="button-submit"
    >
      Submit Result
    </Link>
  )}{" "}
          {/* <Link to={fromPath} className="button-cancel"> Cancel </Link> */}{" "}
          <Button
            severity="secondary"
            label="Cancel"
            onClick={() => navigate("/interview-list")}
          ></Button>{" "}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;
