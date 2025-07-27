package com.group2.InterviewManagement.Enum;

public enum HighestLevel {
    HIGHEST_LEVEL("Highest level"),
    HIGH_SCHOOL("High school"),
    BACHELORS_DEGREE("Bachelor's Degree"),
    MASTER_DEGREE_PHD("Master Degree, PhD");

    private final String value;

    HighestLevel(String value) {
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
