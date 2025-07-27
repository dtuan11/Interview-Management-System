import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Helmet } from "react-helmet";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./InterviewList.css";
import axiosInstance from "../../services/axios";
import { jwtDecode } from "jwt-decode";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import Select, { SingleValue } from "react-select";
import { interviewScheduleApi } from "../../services/interviewSchedule";
import { ProgressSpinner } from "primereact/progressspinner";
import { Skeleton } from "primereact/skeleton";
import { Tooltip } from "primereact/tooltip";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

const InterviewList: React.FC = () => {
  const { scheduleId } = useParams();
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [interviewer, setInterviewer] = useState<string>("");
  const [interviewSchedules, setInterviewSchedules] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<
    { label: string; value: string }[]
  >([]);
  const [statusOptions, setStatusOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  const [userRole, setUserRole] = React.useState("");
  const [role, setRole] = React.useState("");

  const [currentUserId, setcurrentUserId] = useState<number>(0);

  const navigate = useNavigate();
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string>("");
  const [submittingResult, setSubmittingResult] = useState<boolean>(false);
  const [updatedResults, setUpdatedResults] = useState<{
    [key: number]: string;
  }>({});
  const [resultUpdateTrigger, setResultUpdateTrigger] = useState(0);

  interface JwtPayLoad {
    userId: number;
    role: string[];
    sub: string;
  }

  interface Interviewer {
    id: string;
    fullName: string;
    isActive: string;
  }

  useEffect(() => {
    loadInterviewScheduleData();
    loadInterviewers();
    loadStatusOptions();
    getUserRole();
  }, [resultUpdateTrigger, userRole]);

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

  const loadInterviewScheduleData = async (page: number = 0) => {
    setLoading(true);
    if (userRole === "INTERVIEWER") {
      await interviewScheduleApi
        .getAllInterviewSchedulesofInterviewer(
          currentUserId,
          { keyword, status, pageNumber: page },
          setInterviewSchedules,
          setPageNumber,
          setTotalPages
        )
        .finally(() => setLoading(false));
    } 
    else if(userRole==="ADMIN"||userRole==="MANAGER"||userRole==="RECRUITER") {
      await interviewScheduleApi
        .getAllInterviewSchedules(
          { keyword, status, interviewer, pageNumber: page },
          setInterviewSchedules,
          setPageNumber,
          setTotalPages
        )
        .finally(() => setLoading(false));
    }
  };

  const loadInterviewers = async () => {
    try {
      setLoadingOptions(true);

      await interviewScheduleApi.loadInterviewers(setInterviewers);
    } catch (error) {
      console.log("error load interviewers: ", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadStatusOptions = async () => {
    try {
      setLoadingOptions(true);

      await interviewScheduleApi.loadStatusOptions(setStatusOptions);
    } catch (error) {
      console.log("error load status options: ", error);
    } finally {
      setLoadingOptions(false);
    }
  };
  const handleSearch = () => {
    loadInterviewScheduleData(0);
  };

  const handleStatusChange = (
    selectedOption: SingleValue<{ label: string; value: string }>
  ) => {
    setStatus(selectedOption ? selectedOption.value : "");
  };

  const handleInterviewerChange = (
    selectedOption: SingleValue<{ label: string; value: string }>
  ) => {
    if (userRole !== "INTERVIEWER") {
      setInterviewer(selectedOption ? selectedOption.value : "");
    }
  };

  const handleDetail = (interviewScheduleId: number) => {
    navigate(`/interview-detail/${interviewScheduleId}`);
  };

  const handleEdit = (interviewScheduleId: number) => {
    if (interviewScheduleId) {
      navigate(`/interview-edit/${interviewScheduleId}`, {
        state: { from: window.location.pathname },
      });
    }
  };

  const handleSubmitResult1 = (interviewScheduleId: number) => {
    navigate(`/interview-submit-result/${interviewScheduleId}`);
  };
  const resultBodyTemplate = (rowData: any) => {
    const resultOptions = [
      { label: "N/A", value: "N/A" },
      { label: "Passed", value: "Passed" },
      { label: "Failed", value: "Failed" },
    ];

    const handleResultChange = (newResult: string) => {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you want to set the result to ${newResult}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, set it!",
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmitResult(rowData.scheduleId, newResult);
        }
      });
    };

    if (
      (
        (userRole === "INTERVIEWER" || userRole === "ADMIN") &&
        (rowData.status === "New" || rowData.status === "Invited")
      ) &&
      (
        userRole === "ADMIN" ||
        rowData.interviewers.some((interviewer: any) => interviewer.id === currentUserId)
      )
    ) {
      return (
        <Dropdown
          value={updatedResults[rowData.scheduleId] || rowData.result}
          options={resultOptions}
          onChange={(e) => handleResultChange(e.value)}
          placeholder="Select result"
        />
      );
    } else {
      return (
        <span>
          {updatedResults[rowData.scheduleId] || rowData.result || "-"}
        </span>
      );
    }
  };

  const handleResultChange = (scheduleId: number, newResult: string) => {
    setInterviewSchedules((prevSchedules) =>
      prevSchedules.map((schedule) =>
        schedule.scheduleId === scheduleId
          ? { ...schedule, result: newResult }
          : schedule
      )
    );
  };

  const handleSubmitResult = async (scheduleId: number, newResult: string) => {
    setSubmittingResult(true);

    try {
      const success = await interviewScheduleApi.submitInterviewResult(
        scheduleId.toString(),
        {
          result: newResult,
        }
      );

      if (success) {
        Swal.fire({
          title: "Success",
          text: "Result has been successfully updated",
          icon: "success",
          confirmButtonText: "OK",
        });
        setUpdatedResults((prev) => ({ ...prev, [scheduleId]: newResult }));
        setResultUpdateTrigger((prev) => prev + 1);
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to update result",
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
      setSubmittingResult(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="main__table-btns text-center">
        <Button
          icon="pi pi-eye"
          text
          tooltip="View"
          tooltipOptions={{ position: "bottom" }}
          onClick={() => handleDetail(rowData.scheduleId)}
        />
        {(
          userRole === "INTERVIEWER" && rowData.status === "New" || rowData.status === "Invited") 
        
        
        && rowData.interviewers.some((interviewer : any) => interviewer.id === currentUserId)  ? (
          <Button
            icon="pi pi-file-edit"
            severity="secondary"
            tooltip="Submit Result"
            tooltipOptions={{ position: "bottom" }}
            text
            onClick={() => handleSubmitResult1(rowData.scheduleId)}
          />
        ) : (userRole!="INTERVIEWER" &&
          rowData.status === "New" && (
            <Button
              icon="pi pi-pen-to-square"
              severity="secondary"
              tooltip="Edit"
              tooltipOptions={{ position: "bottom" }}
              text
              onClick={() => handleEdit(rowData.scheduleId)}
            />
          )
        )}
      </div>
    );
  };

  const canAddNewInterview = userRole !== "INTERVIEWER";

  const onPage = (event: { first: number; rows: number }) => {
    const newPage = Math.floor(event.first / event.rows);
    setPageNumber(newPage);
    loadInterviewScheduleData(newPage);
  };

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div id="interview-list-component" className="list-interview-container">
      <Helmet>
        <title>Interview Schedule List</title>
      </Helmet>

      <div className="tab-content">
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex justify-content-start">
            {loadingOptions ? (
              <Skeleton width="222px" height="41px" className="mr-2"></Skeleton>
            ) : (
              <IconField iconPosition="right" className="mr-2">
                <InputIcon className="pi pi-search" />
                <InputText
                  value={keyword}
                  placeholder="Enter something ..."
                  id="candidate-searching"
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </IconField>
            )}

            <div className="mr-2">
            {userRole !== "INTERVIEWER" && (
  <div className="mr-2">
    {loadingOptions ? (
      <Skeleton width="210px" height="41px" className=""></Skeleton>
    ) : (
      <Select
        value={interviewers.find(
          (option) => option.value === interviewer
        )}
        options={interviewers}
        onChange={handleInterviewerChange}
        isSearchable={false}
      />
    )}
  </div>
)}
            </div>

            <div className="mr-2">
              {loadingOptions ? (
                <Skeleton width="210px" height="41px" className=""></Skeleton>
              ) : (
                <Select
                  value={statusOptions.find(
                    (option) => option.value === status
                  )}
                  options={statusOptions}
                  onChange={handleStatusChange}
                  placeholder="Status"
                  isSearchable={false}
                />
              )}
            </div>

            <div className="mr-2">
              <Button
                label="Search"
                severity="secondary"
                onClick={handleSearch}
              />
            </div>
          </div>

          {canAddNewInterview && (
            <div className="">
              <Button
                className="mr-0"
                label="Add new interview"
                severity="secondary"
                onClick={() => navigate("/create-interview")}
              />
            </div>
          )}
        </div>

        <div className="mt-3 mb-3">
          {loading ? (
            <div className="loading-container-all">
              <ProgressSpinner
                style={{ width: "50px", height: "50px" }}
                strokeWidth="5"
                fill="var(--surface-ground)"
                animationDuration=".8s"
              />
            </div>
          ) : (
            <div>
              <DataTable
                key={resultUpdateTrigger}
                value={interviewSchedules}
                showGridlines
                paginator
                rows={10}
                totalRecords={totalPages * 10}
                lazy
                first={pageNumber * 10}
                onPage={onPage}
                tableStyle={{ minWidth: "50rem" }}
                emptyMessage="No item matches with your search data. Please try again."
              >
                <Column field="scheduleTitle" header="Title" />
                <Column
                  field="candidateDTO.fullName"
                  header="Candidate Name"
                  body={(rowData) =>
                    rowData.candidateDTO && (
                      <React.Fragment key={rowData.candidateDTO.id}>
                        <span
                          className={
                            rowData.candidateDTO.isActive
                              ? "p-tooltip-target"
                              : "p-tooltip-target text-danger"
                          }
                          data-pr-tooltip={
                            rowData.candidateDTO.isActive
                              ? rowData.candidateDTO.fullName
                              : rowData.candidateDTO.fullName + " (BANNED)"
                          }
                        >
                          {rowData.candidateDTO.fullName}
                        </span>
                        <Tooltip target=".p-tooltip-target" position="bottom" />
                      </React.Fragment>
                    )
                  }
                />

                <Column
                  field="interviewers"
                  header="Interviewer"
                  body={(rowData) => (
                    <div>
                      {rowData.interviewers.length > 0
                        ? rowData.interviewers.map(
                            (interviewer: Interviewer, index: number) => (
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
                                  {truncateText(interviewer.fullName, 30)}
                                </span>
                                {index < rowData.interviewers.length - 1
                                  ? ", "
                                  : ""}
                              </React.Fragment>
                            )
                          )
                        : "-"}
                      <Tooltip target=".p-tooltip-target" position="bottom" />
                    </div>
                  )}
                />

                <Column
                  field="scheduleDate"
                  header="Schedule Date"
                  body={(rowData) => (
                    <span>
                      {new Date(rowData.scheduleDate).toLocaleDateString(
                        "en-GB"
                      )}{" "}
                      <br />
                      <span style={{ fontSize: "15px" }}>
                        {formatTime(rowData.scheduleFrom)} -{" "}
                        {formatTime(rowData.scheduleTo)}
                      </span>
                    </span>
                  )}
                />
                <Column
                  field="result"
                  header="Result"
                  body={resultBodyTemplate}
                />
                <Column field="status" header="Status" />
                <Column
                  body={(rowData) => (
                    <span
                      className={
                        rowData.job.isActive === "1"
                          ? "p-tooltip-target"
                          : "p-tooltip-target text-danger"
                      }
                      data-pr-tooltip={
                        rowData.job.isActive === "1"
                          ? rowData.job.jobTitle
                          : rowData.job.jobTitle + " (DELETED)"
                      }
                    >
                      {rowData.job.jobTitle}
                    </span>
                  )}
                  header="Job"
                />

                <Column
                  body={actionBodyTemplate}
                  header="Actions"
                  style={{ maxWidth: "120px" }}
                />
              </DataTable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewList;
