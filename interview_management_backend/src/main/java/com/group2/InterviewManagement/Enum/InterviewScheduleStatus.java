package com.group2.InterviewManagement.Enum;

public enum InterviewScheduleStatus {

    NEW("New"),
    INVITED("Invited"),
    INTERVIEWED("Interviewed"),
    CANCELLED("Cancelled");


    private final String displayName;

    InterviewScheduleStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
