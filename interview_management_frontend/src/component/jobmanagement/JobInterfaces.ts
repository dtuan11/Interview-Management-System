// JobInterfaces.ts

import { DataTablePageEvent } from "primereact/datatable";

export interface Job {
  jobId?: number;
  jobTitle: string;
  startDate: Date | null;
  endDate: Date | null;
  jobSkills: string[];
  jobBenefit: string[];
  jobLevel: string[];
  salaryRangeFrom: number | null;
  salaryRangeTo: number | null;
  workingAddress: string;
  jobDescription: string;
  jobStatus: string;
  updateById: number | null;
  createAt?: string;
  updateAt?: string;
  updateByUserName?: string;
}

export interface JobStatus {
  label: string;
  value: string;
  index: number;
}

export interface JobTableProps {
  jobList: Job[];
  loadData: () => void;
  first: number;
  rows: number;
  totalRecords: number;
  onPage: (event: DataTablePageEvent) => void;
  userRole: string;
  loading: boolean;
}

export interface SearchBarProps {
  handleSearch: (title: string, status: string) => void;
  jobStatuses: JobStatus[];
}
