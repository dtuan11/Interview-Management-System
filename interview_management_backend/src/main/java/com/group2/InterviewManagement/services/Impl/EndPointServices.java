package com.group2.InterviewManagement.services.Impl;

public class EndPointServices {
    public static final String[] publicGetEndPoint = {
            "/api/candidate/get-all-candidate",
            "/api/interview/get-all-interview-schedule",
            "/api/interview/interviewers",
            "/api/interview/**",
            "/api/job/getJobs",
            "/api/job/**",
            "/api/job/common-values",
            "/api/job/import",
            "/api/account/check-token",
            "/api/account/valid-password-link",
            "/user-update/**",
            "/download-file",
            "/api/interview/get-all-interview-schedule-interviewer",
    };
    public static final String[] publicPostEndPoint = {
            "/api/account/login",
            "api/account/logout",
            "/api/account/refresh-token",
//            "/api/candidate/save-candidate",
//            "/api/candidate/update-candidate",
            "/api/account/forgot-password",
            "/api/account/set-new-password",

            "/api/common-values/get-all-value-by-name",
//            "/api/candidate/get-candidate-detail",
//            "/api/candidate/ban-candidate",
//            "/api/candidate/delete-candidate",
//            "/api/job/saveJob",
//            "/api/job/import",

    };

    public static final String[] adminGetEndPoint = {
            "api/user",
            "/api/user/search",
            "/api/user-list/**",
            "/api/user/is-exists-email",
            "/api/user/is-18-years-old",
            "/api/user/is-exists-phone-number",
            "/api/offer/getOffer",
//            "/api/job/common-values",
            "/download-file",
            "/api/role/all",
    };

    public static final String[] adminPostEndPoint = {
            "/api/user/create",
            "/api/candidate/save-candidate",
//            "/api/candidate/update-candidate",
            "/api/interview/initialize-form-data",
            "/api/interview/create",
//            "/api/candidate/delete-candidate",
//            "/api/job/saveJob",
//            "/api/job/import",

    };
    public static final String[] adminPutEndPoint = {
            "/api/user/update/**",
            "/api/user/update-active/**",
//            "api/job/update/**",


    };
    public static final String[] adminDeleteEndPoint = {

    };
    //GET
    public static final String[] adminAndRecruiterAndManagerGetEndPoint = {
            "/api/candidate/get-all-recruiter",
            "/api/interview/initialize-form-data",
            "api/offer/search/**",
            "api/offer/getOfferById/**",
            "api/offer/viewOfferDetail/**",
            "api/offer/sendEmailReminder",
            "/api/candidate/is-exists-phone",
            "/api/candidate/is-exists-email"
    };
    //POST
    public static final String[] adminAndRecruiterAndManagerPostEndPoint = {
            "/api/candidate/save-candidate",
            "/api/candidate/update-candidate",
            "/api/candidate/ban-candidate",
            "/api/candidate/delete-candidate",
            "/api/job/saveJob",
            "/api/job/import",
            "/api/interview/{id}/send-reminder",
            "/api/candidate/get-candidate-detail",
            "/api/interview/create",

    };
    //Put
    public static final String[] adminAndRecruiterAndManagerPutEndPoint = {
            "api/job/update/**",
            "/api/interview/cancel-schedule/**",
            "/api/interview/update/**",
            "api/offer/edit",
            "api/offer/approveOffer/**",
            "api/offer/rejectOffer/**",
            "api/offer/markOfferAsSent/**",
            "api/offer/acceptOffer/**",
            "api/offer/declineOffer/**",
            "api/offer/cancelOffer/**",
            "api/offer/updateStatus/**",
            "/api/interview/submit-result/"
    };
    //Delete
    public static final String[] adminAndRecruiterAndManagerDeleteEndPoint = {
            "/api/job/delete/**",
    };
    public static final String[] interviewerPutEndPoint = {
            "/api/interview/submit-result",

    };


// public static final String front_end_host = "http://donghai.me";
    public static final String front_end_host = "http://localhost:3000";
}