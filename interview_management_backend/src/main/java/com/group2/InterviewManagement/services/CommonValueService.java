package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.models.CommonValue;

import java.util.List;
import java.util.Map;

public interface CommonValueService {
    List<CommonValue> getAllByName(String name);
    List<CommonValue> getAllByNameAndBeginIndexAndEndIndex(String name, int begin, int end);

    Map<String, List<String>> getAllValuesGroupedByName();

    
}