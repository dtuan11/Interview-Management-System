import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import JobService from "../../services/job";
import { JobTableProps } from "./JobInterfaces";
import { ProgressSpinner } from "primereact/progressspinner";

const JobTable: React.FC<JobTableProps> = ({
  jobList,
  loadData,
  first,
  rows,
  totalRecords,
  onPage,
  userRole,
  loading,
}) => {
  const navigate = useNavigate();

  const handleDeleteJob = (jobId: number) => {
    Swal.fire({
      title: "Are you sure you want to delete this job?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteJob(jobId);
      }
    });
  };

  const deleteJob = async (jobId: number) => {
    try {
      await JobService.deleteJob(jobId);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Successfully deleted job",
      }).then((result) => {
        if (result.isConfirmed) {
          loadData();
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete job. Please try again.",
      });
    }
  };

  const actionBodyTemplate = React.useCallback(
    (rowData: any) => {
      return (
        <div className="main__table-btns text-center">
          <Button
            icon="pi pi-eye"
            tooltip="View"
            tooltipOptions={{ position: "bottom" }}
            text
            onClick={() => navigate(`/job-details/${rowData.jobId}`)}
          />
          {(userRole === "ADMIN" ||
            userRole === "MANAGER" ||
            userRole === "RECRUITER") && (
            <>
              <Button
                icon="pi pi-pen-to-square"
                severity="secondary"
                tooltip="Edit"
                tooltipOptions={{ position: "bottom" }}
                text
                onClick={() => navigate(`/edit-job/${rowData.jobId}`)}
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                tooltip="Delete"
                tooltipOptions={{ position: "bottom" }}
                text
                onClick={() => handleDeleteJob(rowData.jobId)}
              />
            </>
          )}
        </div>
      );
    },
    [navigate, userRole]
  );

  if (loading) {
    return (
      <div className="loading-container-all">
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="5"
          fill="var(--surface-ground)"
          animationDuration=".8s"
        />
      </div>
    );
  }

  return (
    <div id="job-table">
      <DataTable
        value={jobList}
        lazy
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={onPage}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="No item matches with your search data. Please try again."
      >
        <Column field="jobTitle" header="Job Title" />
        <Column field="jobSkills" header="Required Skills" />
        <Column field="startDate" header="Start Date" />
        <Column field="endDate" header="End Date" />
        <Column field="jobLevel" header="Level" />
        <Column field="jobStatus" header="Status" />
        <Column
          style={{ maxWidth: "120px" }}
          body={actionBodyTemplate}
          header="Action"
        />
      </DataTable>
    </div>
  );
};

export default React.memo(JobTable);
