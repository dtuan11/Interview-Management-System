package com.group2.InterviewManagement.controller;

import com.group2.InterviewManagement.dto.request.RequestCommonValue;
import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.models.CommonValue;
import com.group2.InterviewManagement.services.CommonValueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/common-values")
public class CommonValueController {
    private final CommonValueService commonValueService;

    @Autowired
    public CommonValueController(CommonValueService commonValueService) {
        this.commonValueService = commonValueService;
    }

    @GetMapping("getValue")
    public ResponseEntity<ResponseDTO> getValuesByName() {
        try {
            Map<String, List<String>> values = commonValueService.getAllValuesGroupedByName();
            ResponseDTO response = ResponseDTO.builder()
                    .message("success")
                    .code(200)
                    .data(values)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @PostMapping ("/get-all-value-by-name")
    public ResponseEntity<ResponseDTO> getCommonValueByName(@RequestBody RequestCommonValue requestCommonValue) {
        List<CommonValue> commonValues;
        try {
            String name = requestCommonValue.getName();
            int beginIndex = requestCommonValue.getBeginIndex();
            int endIndex = requestCommonValue.getEndIndex();

            if (beginIndex != 0 && endIndex != 0) {
                commonValues = commonValueService.getAllByNameAndBeginIndexAndEndIndex(name, beginIndex, endIndex);
            } else {
                commonValues = commonValueService.getAllByName(name);
            }
            return ResponseEntity.ok().body(ResponseDTO.builder().data(commonValues).message("Get common value " + name + " success!").build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .message("Load common value " + requestCommonValue.getName() + " fail! Error: " + e.getMessage()).build());
        }
    }
}