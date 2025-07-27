package com.group2.InterviewManagement.Enum;

public enum JobStatus {
    DRAFT("Draft"),
    OPEN("Open"),
    CLOSED("Closed");

    private final String status;

    JobStatus(String status) {
        this.status = status;
    }

    public String getJobStatus() {
        return status;
    }
}
