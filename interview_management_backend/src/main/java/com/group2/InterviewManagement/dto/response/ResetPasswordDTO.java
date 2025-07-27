package com.group2.InterviewManagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ResetPasswordDTO {
    private String token;
    private String email;
    private String newPassword;
}
