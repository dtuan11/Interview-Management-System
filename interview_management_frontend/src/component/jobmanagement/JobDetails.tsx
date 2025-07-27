import React, { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import JobService from "../../services/job";
import AuthService from "../../services/auth";
import { Button } from "primereact/button";
import { Helmet } from "react-helmet";
import LoadingOverlay from "../../utils/LoadingOverlay";

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const fromPath = searchParams.get("from") || "/job-list";
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const userRole = AuthService.getUserRole();
    setUserRole(userRole);

    const fetchJobDetails = async () => {
      if (!jobId) return;
      try {
        const data = await JobService.getJobDetails(jobId);
        setJob(data);
      } catch (error) {
        setError("Failed to fetch job details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, navigate]);

  if (loading) return <LoadingOverlay isLoading={loading} />;
  if (error) return <div className="error">{error}</div>;
  if (!job) return <div className="info">No job details available</div>;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");
  const createAt = formatDate(job.createAt);
  const updatedAt = formatDate(job.updateAt);

  const canEdit = ["ADMIN", "MANAGER", "RECRUITER"].includes(userRole);

  const renderTags = (tags: string) => (
    <>
      {tags.split(",").map((tag, index) => (
        <span key={index} className="job-details-tag">
          {tag.trim()}
        </span>
      ))}
    </>
  );

  const renderJobDetail = (
    label: string,
    content: string | React.ReactNode
  ) => (
    <div className="job-details-item">
      <strong>{label}:</strong>
      <div className="job-details-content">{content}</div>
    </div>
  );

  const goJobList = () => {
    navigate("/job-list");
  };

  const formatSalary = (salary: number) => {
    return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đ";
  };

  return (
    <div id="job-details" className="job-detail">
      <Helmet>
        <title>Job Details</title>
      </Helmet>
      <div className="padding">
        <div className="backto-div">
          <Button
            label="Back to job list"
            text
            icon="pi pi-angle-double-left"
            className="backto"
            onClick={goJobList}
          />
        </div>

        <div className="job-form-container bg-white">
          <div className="card-header">
            <span className="text-sm text-500">
              Created on{" "}
              {createAt === formatDate(new Date().toISOString())
                ? "today"
                : createAt}
              , last update by {job.updateByUserName}{" "}
              {updatedAt === formatDate(new Date().toISOString())
                ? "today"
                : updatedAt}
            </span>
          </div>
          <div className="card-body">
            <div className="job-details-grid">
              <div className="job-details-column">
                {renderJobDetail("Job Title", job.jobTitle)}
                {renderJobDetail("Start Date", job.startDate)}
                {renderJobDetail("End Date", job.endDate)}
                {renderJobDetail(
                  "Salary Range",
                  `${formatSalary(job.salaryRangeFrom)} - ${formatSalary(
                    job.salaryRangeTo
                  )}`
                )}
                {renderJobDetail("Working Address", job.workingAddress)}
                {renderJobDetail("Status", job.jobStatus)}
              </div>
              <div className="job-details-column">
                {renderJobDetail(
                  "Skills",
                  <div className="job-details-tags">
                    {renderTags(job.jobSkills || "N/A")}
                  </div>
                )}
                {renderJobDetail(
                  "Benefits",
                  <div className="job-details-tags">
                    {renderTags(job.jobBenefit || "N/A")}
                  </div>
                )}
                {renderJobDetail(
                  "Level",
                  <div className="job-details-tags">
                    {renderTags(job.jobLevel || "N/A")}
                  </div>
                )}
                {renderJobDetail("Description", job.jobDescription || "N/A")}
              </div>
            </div>
          </div>
          <div className="card-footer">
            {canEdit && (
              <button
                onClick={() =>
                  navigate(`/edit-job/${jobId}`, { state: { from: "details" } })
                }
                className="btn btn-primary mr-2"
              >
                Edit
              </button>
            )}
            <Link to={fromPath}>
              <button className="btn btn-secondary">Cancel</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
