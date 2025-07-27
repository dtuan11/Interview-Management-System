package com.group2.InterviewManagement.Enum;

public enum Benefit {
    BENEFIT("Benefit"),
    LUNCH("Lunch"),
    LEAVE_25_DAYS("25-day leave"),
    HEALTHCARE_INSURANCE("Healthcare insurance"),
    HYBRID_WORKING("Hybrid working"),
    TRAVEL("Travel");

    private final String displayName;

    Benefit(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayValue() {
        return displayName;
    }
}
