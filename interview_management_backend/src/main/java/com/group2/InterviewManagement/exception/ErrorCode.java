package com.group2.InterviewManagement.exception;

public enum ErrorCode {

    UnDefine_Error(9999, "Undefine_Error"),
    INVALID_KEY(1001, "Uncategorized error"),
    SendFail(8888,"Send email fail"),
    //Offer manager
    CandidateNameExists(16, "Candidate Name has exists !!"),
    ScheduleInfoExists(17, "Schedule Info has exists !!"),

    //use_management
    EmailExists(1, "This email has already existed!!"),
    PhoneNumberExists(2, "This phone number has already existed!!"),
    AgeUnder18(3, "User   must be at least 18 years old and under 60 years old."),
    SaveUserSuccess(4, "Save user success"),
    EmailNotFound(5, "Email not found"),
    PasswordInvalid(6, "Password invalid"),
    EmailSentSuccess(7, "Email sent successfully"),
    PasswordResetSuccess(8, "Password reset successfully"),
    DepartmentNotMatch(9, "Department not match"),
    UserIDNotFount(10, "User Id not found"),
    RoleNotFound(11, "Role has not found"),
    PasswordResetLinkInvalid(12, "Password reset link is invalid or has expired."),
    UserIsBeingUpdated(13, "User is being update!"),
    InvalidToken(14, "Invalid token"),
    TokenExpired(15, "Token Expired"),
    ChangeStatusUserFail(18, "Change status user fail"),
    UserLoginFail(19, "User account is inactive. Please contact support."),
    //Candidate_Management
    DeleteCandidateFail(666, "Delete candidate fail"),
    BanCandidateFail(667, "Ban candidate fail"),
    UpdateCandidateFail(668, "Failed to updated change"),
    CandidateIDNotFound(669, "Candidate Id not found"),

    ;


    private int code;
    private String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }


    public String getMessage() {
        return message;
    }


}
