package com.group2.InterviewManagement.Enum;

public enum Level {
    LEVEL("Level"),
    FRESHER("Fresher"),
    JUNIOR("Junior"),
    SENIOR("Senior"),
    LEADER("Leader"),
    MANAGER("Manager"),
    VICE_HEAD("Vice Head");

    private final String displayName;

    Level(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
