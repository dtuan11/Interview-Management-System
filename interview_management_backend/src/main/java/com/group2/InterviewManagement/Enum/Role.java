package com.group2.InterviewManagement.Enum;

public enum Role {
    ADMIN("ADMIN"),
    RECRUITER("RECRUITER"),
    INTERVIEWER("INTERVIEWER"),
    MANAGER("MANAGER");
    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
