import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import JobService from "../../services/job";
import AuthService from "../../services/auth";
import { Job } from "./JobInterfaces";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import LoadingOverlay from "../../utils/LoadingOverlay";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";

const initialJob: Job = {
  jobTitle: "",
  startDate: null,
  endDate: null,
  salaryRangeFrom: null,
  salaryRangeTo: null,
  workingAddress: "",
  jobStatus: "",
  jobSkills: [],
  jobBenefit: [],
  jobLevel: [],
  jobDescription: "",
  updateById: null,
};

const JobForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState<Job>(initialJob);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [commonValues, setCommonValues] = useState<any>({});
  const [commonValuesLoading, setCommonValuesLoading] = useState(true);

  useEffect(() => {
    const fetchCommonValues = async () => {
      try {
        setCommonValuesLoading(true);
        const values = await JobService.getCommonValues();
        setCommonValues(values);
      } catch (error) {
        console.error("Failed to fetch common values:", error);
      } finally {
        setCommonValuesLoading(false);
      }
    };

    fetchCommonValues();
  }, []);

  const getSelectOptions = useMemo(
    () => (key: string) => {
      return (commonValues[key] || []).map((item: any) => ({
        label: item.label,
        value: item.value,
      }));
    },
    [commonValues]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUserId = await AuthService.getCurrentUserId();
        if (jobId) {
          const jobData = await JobService.getJobDetails(jobId);
          if (jobData) {
            setJob({
              ...jobData,
              startDate: jobData.startDate ? new Date(jobData.startDate) : null,
              endDate: jobData.endDate ? new Date(jobData.endDate) : null,
              jobSkills: Array.isArray(jobData.jobSkills)
                ? jobData.jobSkills
                : jobData.jobSkills.split(",").map((s: string) => s.trim()),
              jobBenefit: Array.isArray(jobData.jobBenefit)
                ? jobData.jobBenefit
                : jobData.jobBenefit.split(",").map((b: string) => b.trim()),
              jobLevel: Array.isArray(jobData.jobLevel)
                ? jobData.jobLevel
                : jobData.jobLevel.split(",").map((l: string) => l.trim()),
              updateById: currentUserId,
            });
          } else {
            setError("No data received from the server");
          }
        } else {
          setJob((prev) => ({ ...prev, updateById: currentUserId }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleChange = (name: string, value: any) => {
    setJob((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSalaryChange = (
    e: InputNumberChangeEvent,
    field: "salaryRangeFrom" | "salaryRangeTo"
  ) => {
    const value = e.value as number | null;
    setJob((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!job.jobTitle.trim())
      newErrors.jobTitle = "Please fill out Job Title field";
    if (job.jobSkills.length === 0)
      newErrors.jobSkills = "Please fill out Job Skills field";
    if (job.salaryRangeFrom === null || job.salaryRangeFrom < 0)
      newErrors.salaryRangeFrom = "Salary Range From must be 0 or greater";
    if (!job.salaryRangeTo)
      newErrors.salaryRangeTo = "Please fill out Salary Range To field";
    if (
      job.salaryRangeFrom !== null &&
      job.salaryRangeTo !== null &&
      job.salaryRangeFrom > job.salaryRangeTo
    )
      newErrors.salaryRangeTo =
        "Salary range to must be greater than salary range from";
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (job.startDate && job.startDate < currentDate)
      newErrors.startDate = "Start date must be today or a future date";

    if (job.startDate && job.endDate && job.endDate < job.startDate)
      newErrors.endDate = "End date must be later than start date";
    if (job.jobBenefit.length === 0)
      newErrors.jobBenefit = "Please fill out Job Benefit field";
    if (job.jobLevel.length === 0)
      newErrors.jobLevel = "Please fill out Job Level field";
    if (job.jobDescription.length > 500)
      newErrors.jobDescription = "Description must be less than 500 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please correct the errors in the form.",
      });
      return;
    }
    try {
      setLoading(true);
      const formattedJob = {
        ...job,
        jobSkills: job.jobSkills.join(", "),
        jobBenefit: job.jobBenefit.join(", "),
        jobLevel: job.jobLevel.join(", "),
        startDate: job.startDate
          ? job.startDate.toISOString().split("T")[0]
          : null,
        endDate: job.endDate ? job.endDate.toISOString().split("T")[0] : null,
      };

      if (jobId) {
        await JobService.updateJob(jobId, formattedJob);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully updated job",
        });
      } else {
        await JobService.createJob(formattedJob);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully created job",
        });
      }
      navigate("/job-list");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save job. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const goJobList = () => {
    navigate("/job-list");
  };

  const handleCancel = () => {
    if (location.state && location.state.from === "details") {
      navigate(`/job-details/${jobId}`);
    } else {
      navigate("/job-list");
    }
  };

  const renderField = (
    label: string,
    name: keyof Job,
    component: React.ReactNode,
    mandatory = false
  ) => (
    <div className="p-field mb-3">
      {mandatory ? (
        <label>
          {label} <span style={{ color: "red" }}>*</span>
        </label>
      ) : (
        <label>{label}</label>
      )}
      {component}
      {errors[name] && <small className="p-error">{errors[name]}</small>}
    </div>
  );

  if (loading || commonValuesLoading)
    return <LoadingOverlay isLoading={true} />;
  if (error) return <div className="p-component p-error">{error}</div>;

  return (
    <div id="job-form" className="create-job">
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
          <form onSubmit={handleSubmit}>
            <div className="job-form-flex">
              <div className="left-column">
                {renderField(
                  "Job Title",
                  "jobTitle",
                  <InputText
                    id="jobTitle"
                    value={job.jobTitle}
                    name="jobTitle"
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    className={`p-inputtext p-component w-100 ${
                      errors.jobTitle ? "p-invalid" : ""
                    }`}
                    placeholder="Type a title"
                    required
                  />,
                  true
                )}
                {renderField(
                  "Start Date",
                  "startDate",
                  <input
                    type="date"
                    name="startDate"
                    value={
                      job.startDate
                        ? job.startDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleChange("startDate", new Date(e.target.value))
                    }
                    className={`p-inputtext p-component ${
                      errors.startDate ? "p-invalid" : ""
                    }`}
                  />,
                  true
                )}
                {renderField(
                  "Salary Range From",
                  "salaryRangeFrom",
                  <div className="p-inputgroup">
                    <InputNumber
                      inputId="salaryRangeFrom"
                      value={job.salaryRangeFrom}
                      onChange={(e) => handleSalaryChange(e, "salaryRangeFrom")}
                      mode="currency"
                      currency="VND"
                      locale="vi-VN"
                      className={errors.salaryRangeFrom ? "p-invalid" : ""}
                    />
                  </div>
                )}

                {renderField(
                  "Salary Range To",
                  "salaryRangeTo",
                  <div className="p-inputgroup">
                    <InputNumber
                      inputId="salaryRangeTo"
                      value={job.salaryRangeTo}
                      onChange={(e) => handleSalaryChange(e, "salaryRangeTo")}
                      mode="currency"
                      currency="VND"
                      locale="vi-VN"
                      className={errors.salaryRangeTo ? "p-invalid" : ""}
                    />
                  </div>,
                  true
                )}

                {renderField(
                  "Working Address",
                  "workingAddress",
                  <input
                    type="text"
                    name="workingAddress"
                    value={job.workingAddress}
                    onChange={(e) =>
                      handleChange("workingAddress", e.target.value)
                    }
                    className="p-inputtext p-component"
                  />
                )}
                {jobId &&
                  renderField(
                    "Job Status",
                    "jobStatus",
                    <input
                      type="text"
                      name="jobStatus"
                      value={job.jobStatus}
                      readOnly
                      className="p-inputtext p-component"
                    />
                  )}
              </div>
              <div className="right-column">
                {renderField(
                  "Job Skills",
                  "jobSkills",
                  <Select
                    isMulti
                    name="jobSkills"
                    options={getSelectOptions("Skills")}
                    value={job.jobSkills.map((skill) => ({
                      label: skill,
                      value: skill,
                    }))}
                    onChange={(value) =>
                      handleChange(
                        "jobSkills",
                        value.map((v) => v.value)
                      )
                    }
                    className={
                      errors.jobSkills
                        ? "react-select-container p-invalid"
                        : "react-select-container"
                    }
                    classNamePrefix="react-select"
                  />,
                  true
                )}
                {renderField(
                  "End Date",
                  "endDate",
                  <input
                    type="date"
                    name="endDate"
                    value={
                      job.endDate ? job.endDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(e) =>
                      handleChange("endDate", new Date(e.target.value))
                    }
                    className={`p-inputtext p-component ${
                      errors.endDate ? "p-invalid" : ""
                    }`}
                  />,
                  true
                )}
                {renderField(
                  "Job Benefits",
                  "jobBenefit",
                  <Select
                    isMulti
                    name="jobBenefit"
                    options={getSelectOptions("Benefit")}
                    value={job.jobBenefit.map((benefit) => ({
                      label: benefit,
                      value: benefit,
                    }))}
                    onChange={(value) =>
                      handleChange(
                        "jobBenefit",
                        value.map((v) => v.value)
                      )
                    }
                    className={
                      errors.jobBenefit
                        ? "react-select-container p-invalid"
                        : "react-select-container"
                    }
                    classNamePrefix="react-select"
                  />,
                  true
                )}
                {renderField(
                  "Job Levels",
                  "jobLevel",
                  <Select
                    isMulti
                    name="jobLevel"
                    options={getSelectOptions("Level")}
                    value={job.jobLevel.map((level) => ({
                      label: level,
                      value: level,
                    }))}
                    onChange={(value) =>
                      handleChange(
                        "jobLevel",
                        value.map((v) => v.value)
                      )
                    }
                    className={
                      errors.jobLevel
                        ? "react-select-container p-invalid"
                        : "react-select-container"
                    }
                    classNamePrefix="react-select"
                  />,
                  true
                )}
                {renderField(
                  "Job Description",
                  "jobDescription",
                  <textarea
                    name="jobDescription"
                    value={job.jobDescription}
                    onChange={(e) =>
                      handleChange("jobDescription", e.target.value)
                    }
                    rows={5}
                    maxLength={500}
                    className={`p-inputtextarea p-inputtext p-component ${
                      errors.jobDescription ? "p-invalid" : ""
                    }`}
                  />
                )}
              </div>
            </div>

            <div className="button-container">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;
