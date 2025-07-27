package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.JobDTO;
import com.group2.InterviewManagement.models.Job;
import org.springframework.data.domain.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface JobService {
    JobDTO toJobDTO(Job job);
    Job toJobEntity(JobDTO jobDTO);
    JobDTO getJobById(Integer id);
    JobDTO saveJob(JobDTO jobDTO);
    JobDTO updateJob(Integer id, JobDTO jobDTO);
    Job deleteJob(Integer id);
    Page<JobDTO> getAllJobsSortedByStatusAndCreatedDate(Pageable pageable);
    Page<JobDTO> findJobsByCriteria(String jobTitle, String jobStatus, Pageable pageable);
    void importJobsFromFile(MultipartFile file, Integer currentUserId) throws IOException;
    List<Job> getJobOpen();
    void updateJobStatuses(String triggerSource);
}