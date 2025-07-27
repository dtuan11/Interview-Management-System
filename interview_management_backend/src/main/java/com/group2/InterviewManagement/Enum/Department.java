package com.group2.InterviewManagement.Enum;

public enum Department {
    DEPARTMENT("Department"),
    IT("IT"),
    HR("HR"),
    Finance("Finance"),
    Communication("Communication"),
    Marketing ("Marketing"),
    Accounting("Accounting"),
    ;

    private String department;

    Department(String department) {
        this.department = department;
    }

    public String getDepartment() {
        return department;
    }
}
