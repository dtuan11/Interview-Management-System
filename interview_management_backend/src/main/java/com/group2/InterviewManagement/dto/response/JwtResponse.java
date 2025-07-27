package com.group2.InterviewManagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private int code;
    private String message;
    private String token;
    private String refreshToken;
    private String expirationTime;
    private List<String> role;

}
