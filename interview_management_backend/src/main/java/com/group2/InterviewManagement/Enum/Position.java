package com.group2.InterviewManagement.Enum;

public enum Position {
    POSITION("Position"),
    BACKEND_DEVELOPER("Backend Developer"),
    BUSINESS_ANALYST("Business Analyst"),
    TESTER("Tester"),
    HR("HR"),
    PROJECT_MANAGER("Project manager"),
    NOT_AVAILABLE("Not available");

    private final String value;

    Position(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
