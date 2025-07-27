package com.group2.InterviewManagement.Enum;

public enum Skill {
    SKILLS("Skills"),
    JAVA("Java"),
    NODEJS("Nodejs"),
    NET(".net"),
    C_PLUS_PLUS("C++"),
    BUSINESS_ANALYSIS("Business analysis"),
    COMMUNICATION("Communication");

    private final String displayName;

    Skill(String displayName) {
        this.displayName = displayName;
    }
    public String getDisplayName() {
        return displayName;
    }
}
