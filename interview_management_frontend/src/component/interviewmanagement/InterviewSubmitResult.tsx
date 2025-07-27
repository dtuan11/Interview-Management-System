import React, { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import "../interviewmanagement/InterviewDetail.css";
import "../interviewmanagement/SubmitResult.css";
import axiosInstance from "../../services/axios";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet";
import { interviewScheduleApi } from "../../services/interviewSchedule";
import { Button } from "primereact/button";
import LoadingOverlay from "../../utils/LoadingOverlay";

const InterviewSubmit: React.FC = () => {
  const { interviewScheduleId } = useParams<{ interviewScheduleId: string }>();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const fromPath =
    searchParams.get("from") || `/interview-detail/${interviewScheduleId}`;
  const navigate = useNavigate();

  const [note, setNote] = useState<string>("");
  const [result, setResult] = useState<string>("Passed");

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        setLoading(true);
        await interviewScheduleApi.getInterviewSchedule(
          interviewScheduleId!,
          (data: any) => {
            setInterview(data);
            setNote(data.note || "");
            setResult(data.result || "Passed");
          },
          setError
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [interviewScheduleId]);

  useEffect(() => {
    // Ensure the result is set to "Passed" if it's empty or invalid
    if (!result || (result !== "Passed" && result !== "Failed")) {
      setResult("Passed");
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const success = await interviewScheduleApi.submitInterviewResult(
        interviewScheduleId!,
        {
          ...interview,
          note,
          result,
        }
      );

      if (success) {
        Swal.fire({
          title: "Success",
          text: "Change has been successfully updated",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/interview-list");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to updated change",
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
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  if (!interview) return <LoadingOverlay isLoading={true} />;

  return (
    <div id="interview-submit" className="interview-submits-container">
      <Helmet>
        <title>Interview Submit Result</title>
      </Helmet>

      <div className="backto-div">
        <Button
          label=" Back to Interview Schedule list"
          text
          icon="pi pi-angle-double-left"
          className="backto"
          onClick={() => navigate("/interview-list")}
        />
      </div>

      <form onSubmit={handleSubmit} className="interview-submits-board">
        <div className="interview-submits">
          <div className="interview-submit left-column">
            <p>
              <strong>Schedule Title:</strong> {interview.scheduleTitle}
            </p>
            <p>
              <strong>Candidate:</strong>{" "}
              {interview.candidateDTO && interview.candidateDTO.fullName}
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
              <strong>Notes:</strong>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="form-control"
              />
            </p>
          </div>
          <div className="interview-submit right-column">
            <p>
              <strong>Job:</strong> {interview.job && interview.job.jobTitle}
            </p>
            <p>
              <strong>Interviewers:</strong>{" "}
              {interview.interviewers &&
                interview.interviewers
                  .map((interviewer: any) => interviewer.username)
                  .join(", ")}
            </p>
            <p>
              <strong>Location:</strong> {interview.location}
            </p>
            <p>
              <strong>Recruiter Owner:</strong>{" "}
              {interview.recruiterOwner && interview.recruiterOwner.username}
            </p>
            <p>
              <strong>Meeting ID:</strong> {interview.meetingId}
            </p>
            <p>
              <strong>Result:</strong>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="form-control"
              >
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>
            </p>
            <p>
              <strong>Status:</strong> {interview.status}
            </p>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="button-submit">
            Submit Result
          </button>
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            onClick={() => navigate(-1)}
          ></Button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSubmit;
