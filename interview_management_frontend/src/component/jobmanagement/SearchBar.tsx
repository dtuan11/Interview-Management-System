import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { Button } from "primereact/button";
import { SearchBarProps } from "./JobInterfaces";
import "./JobStyles.css";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";

const SearchBar: React.FC<SearchBarProps & { loading: boolean }> = ({
  handleSearch,
  jobStatuses,
  loading,
}) => {
  const initialStatusOption = { label: "All Status", value: "" };
  const [jobTitle, setJobTitle] = useState<string>("");
  const [status, setStatus] = useState<{ label: string; value: string } | null>(
    initialStatusOption
  );
  const jobTitleInputRef = useRef<HTMLInputElement>(null);

  const statusOptions = [initialStatusOption, ...jobStatuses];

  const onSearch = () => {
    handleSearch(jobTitle, status ? status.value : "");
  };

  const handleStatusChange = (selectedOption: any) => {
    setStatus(selectedOption);
  };

  useEffect(() => {
    if (!loading && jobTitleInputRef.current) {
      jobTitleInputRef.current.focus();
    }
  }, [loading]);

  return (
    <div id="job-search-bar" className="search-bar-container">
      <div className="search-bar-inner">
        {loading ? (
          <Skeleton width="222.4px" height="42.6px" className="mr-2" />
        ) : (
          <IconField iconPosition="right" className="mr-2">
            <InputIcon className="pi pi-search" />
            <InputText
              ref={jobTitleInputRef}
              placeholder="Enter job title ..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </IconField>
        )}
        {loading ? (
          <Skeleton width="210px" height="42.6px" className="mr-2" />
        ) : (
          <Select
            value={status}
            className="mr-2"
            onChange={handleStatusChange}
            options={statusOptions}
            placeholder="Select status..."
          />
        )}
        <Button severity="secondary" label="Search" onClick={onSearch} />
      </div>
    </div>
  );
};

export default SearchBar;
