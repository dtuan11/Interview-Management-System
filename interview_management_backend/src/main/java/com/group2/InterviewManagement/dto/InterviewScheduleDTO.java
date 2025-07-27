package com.group2.InterviewManagement.dto;

import com.group2.InterviewManagement.Enum.CandidateStatus;
import com.group2.InterviewManagement.Enum.InterviewScheduleStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewScheduleDTO {

    private int scheduleId;
    private String scheduleTitle;
    private UserCandidateDTO candidateDTO;
    private LocalDate scheduleDate;
    private LocalTime scheduleFrom;
    private LocalTime scheduleTo;
    private String result;
    private String status;
    private String note;
    private JobDTO job;
    private List<UserDTO> interviewers;
    private String location;
    private UserDTO recruiterOwner;
    private String meetingId;
}
