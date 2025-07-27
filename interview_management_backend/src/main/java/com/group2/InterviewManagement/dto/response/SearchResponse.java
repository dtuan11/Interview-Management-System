package com.group2.InterviewManagement.dto.response;

import com.group2.InterviewManagement.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class SearchResponse {
    private List<UserDTO> users;
    private int totalPages;

}
