package com.group2.InterviewManagement.Enum;

public enum OfferStatus {
    OFFER_STATUS("Offer status"),
    WAITING_FOR_APPROVAL("Waiting for approval"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    WAITING_FOR_RESPONSE("Waiting for response"),
    ACCEPTED_OFFER("Accepted"),
    DECLINED_OFFER("Declined"),
    CANCELLED("Cancelled");

    private final String displayName;

    OfferStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
