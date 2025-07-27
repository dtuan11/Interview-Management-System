package com.group2.InterviewManagement.Enum;

public enum ContractType {
    CONTRACT_TYPE("Contract type"),
    TRIAL_2_MONTHS("Trial 2 months"),
    TRAINEE_3_MONTHS("Trainee 3 months"),
    ONE_YEAR("1 year"),
    THREE_YEARS("3 years"),
    UNLIMITED("Unlimited");

    private final String value;

    ContractType(String value) {
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

