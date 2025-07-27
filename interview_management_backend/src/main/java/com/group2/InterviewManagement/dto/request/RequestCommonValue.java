package com.group2.InterviewManagement.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestCommonValue {
    private String name;
    private int beginIndex;
    private int endIndex;
}
