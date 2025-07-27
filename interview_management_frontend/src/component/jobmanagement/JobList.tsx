import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import SearchBar from "./SearchBar";
import JobTable from "./JobTable";
import JobService from "../../services/job";
import AuthService from "../../services/auth";
import "./JobStyles.css";
import { Helmet } from "react-helmet";

const JobList: React.FC = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [jobList, setJobList] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [userRole, setUserRole] = useState("");
  const fileUploadRef = useRef<FileUpload>(null);
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await JobService.loadJobData(
        pageNumber,
        keyword,
        jobStatus,
        setJobList,
        setTotalRecords,
        setLoading,
        setError
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load job data. Please try again.",
      });
    }
  }, [pageNumber, keyword, jobStatus]);

  useEffect(() => {
    loadData();
    setUserRole(AuthService.getUserRole());
  }, [loadData]);

  const handleSearch = useCallback((title: string, status: string) => {
    setFirst(0);
    setPageNumber(1);
    setKeyword(title.trim());
    setJobStatus(status);
  }, []);

  const handleFileUpload = async (event: any) => {
    const file = event.files[0];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (
      fileExtension !== "xls" &&
      fileExtension !== "xlsx" &&
      fileExtension !== "csv"
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload only Excel (.xls or .xlsx) or CSV (.csv) files",
      });
      if (fileUploadRef.current) fileUploadRef.current.clear();
      return;
    }

    try {
      await JobService.importJobs(file);
      Swal.fire({ icon: "success", title: "Import successful" }).then(() =>
        loadData()
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Import failed",
        text: "Please check again the given data",
      });
    }
    if (fileUploadRef.current) fileUploadRef.current.clear();
  };

  const canAddOrImport = ["ADMIN", "MANAGER", "RECRUITER"].includes(userRole);

  return (
    <div id="job-list" className="container-custom">
      <Helmet>
        <title>Job</title>
      </Helmet>
      <div className="tab-content">
        <div className="main-content p-5">
          <div className="flex justify-content-between mb-3">
            <SearchBar
              handleSearch={handleSearch}
              jobStatuses={commonValues["Job status"] || []}
              loading={loading || commonValuesLoading}
            />
            {canAddOrImport && (
              <div className="flex">
                <Link to="/create-job">
                  <Button
                    label="Add New Job"
                    className="p-button p-component p-button-secondary mr-2"
                  />
                </Link>
                <FileUpload
                  ref={fileUploadRef}
                  mode="basic"
                  accept=".xlsx,.xls,.csv"
                  maxFileSize={1000000}
                  customUpload
                  uploadHandler={handleFileUpload}
                  auto
                  chooseLabel="Import"
                  chooseOptions={{
                    icon: "pi pi-file-import",
                    className: "p-button p-component p-button-secondary",
                  }}
                />
              </div>
            )}
          </div>
          <div className="mt-3 mb-3">
            <div className="main__table-wrap">
              <JobTable
                loading={loading}
                jobList={jobList}
                loadData={loadData}
                first={first}
                rows={10}
                totalRecords={totalRecords}
                onPage={(e) => {
                  setFirst(e.first);
                  setPageNumber(Math.floor(e.first / e.rows) + 1);
                }}
                userRole={userRole}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
