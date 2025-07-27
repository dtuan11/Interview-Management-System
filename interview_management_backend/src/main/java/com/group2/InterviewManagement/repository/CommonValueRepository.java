package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.models.CommonValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface CommonValueRepository extends JpaRepository<CommonValue, Integer> {
    List<CommonValue> getAllByName(String name);
    List<CommonValue> getAllByNameAndIndexKeyGreaterThanEqualAndIndexKeyIsLessThanEqual(String name, int greater, int less);
        List<CommonValue> findAll();

    List<CommonValue> findByName(String name);
}