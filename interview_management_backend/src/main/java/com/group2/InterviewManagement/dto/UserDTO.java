package com.group2.InterviewManagement.dto;

import com.group2.InterviewManagement.models.RoleUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserDTO {
    private int id;
    private String fullName;
    private String email;
    private LocalDate dob;
    private String address;
    private String phoneNumber;
    private boolean gender;
    private List<String> roles = new ArrayList<>(); // Adjusted to List of role names
    private String department;
    private String isActive; // Changed from String to boolean
    private String note;
    private String username;
    private String password;
    private int version;
}
