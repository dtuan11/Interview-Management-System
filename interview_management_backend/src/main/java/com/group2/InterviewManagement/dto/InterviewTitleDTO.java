package com.group2.InterviewManagement.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewTitleDTO {
    private int scheduleId;
    private String scheduleTitle;
    private String scheduleNote;
}
