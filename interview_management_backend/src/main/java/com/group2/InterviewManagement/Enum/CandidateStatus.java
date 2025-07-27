package com.group2.InterviewManagement.Enum;

public enum CandidateStatus {
    CANDIDATE_STATUS("Candidate status"),
    WAITING_FOR_INTERVIEW("Waiting for interview"),
    WAITING_FOR_APPROVAL("Waiting for approval"),
    WAITING_FOR_RESPONSE("Waiting for response"),
    OPEN("Open"),
    PASSED_INTERVIEW("Passed Interview"),
    APPROVED_OFFER("Approved Offer"),
    REJECTED_OFFER("Rejected Offer"),
    ACCEPTED_OFFER("Accepted offer"),
    DECLINED_OFFER("Declined offer"),
    CANCELLED_OFFER("Cancelled offer"),
    FAILED_INTERVIEW("Failed interview"),
    CANCELLED_INTERVIEW("Cancelled interview"),
    BANNED("Banned");

    private final String displayName;

    CandidateStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

