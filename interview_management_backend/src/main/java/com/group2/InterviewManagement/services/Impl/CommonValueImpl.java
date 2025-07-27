package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.models.CommonValue;
import com.group2.InterviewManagement.repository.CommonValueRepository;
import com.group2.InterviewManagement.services.CommonValueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommonValueImpl implements CommonValueService {

    private CommonValueRepository commonValueRepository;
    @Autowired
    public CommonValueImpl(CommonValueRepository commonValueRepository) {
        this.commonValueRepository = commonValueRepository;
    }

    @Override
    public List<CommonValue> getAllByName(String name) {
        return commonValueRepository.getAllByName(name);
    }

    @Override
    public List<CommonValue> getAllByNameAndBeginIndexAndEndIndex(String name, int begin, int end) {
        return commonValueRepository.getAllByNameAndIndexKeyGreaterThanEqualAndIndexKeyIsLessThanEqual(name, begin, end);
    }

    @Override
    public Map<String, List<String>> getAllValuesGroupedByName() {
        List<CommonValue> allCommonValues = commonValueRepository.findAll();
        return allCommonValues.stream()
                .collect(Collectors.groupingBy(
                        CommonValue::getName,
                        Collectors.mapping(CommonValue::getValue, Collectors.toList())
                ));
    }
}
