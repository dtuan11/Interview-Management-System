package com.group2.InterviewManagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomPageDTO<T> {
    private long total;
    private int pageIndex;
    private int pageSize;
    private List<T> data;
    // Getters and Setters
}
