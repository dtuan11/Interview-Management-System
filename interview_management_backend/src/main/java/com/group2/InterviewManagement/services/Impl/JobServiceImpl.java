package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.dto.JobDTO;
import com.group2.InterviewManagement.models.Job;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.repository.JobRepository;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.utils.FileHelperForJob;
import com.group2.InterviewManagement.services.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobServiceImpl implements JobService {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final FileHelperForJob fileHelper;

    @Autowired
    public JobServiceImpl(UserRepository userRepository, JobRepository jobRepository, FileHelperForJob fileHelper) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.fileHelper = fileHelper;
    }

    @Override
    public JobDTO getJobById(Integer id) {
        Job job = jobRepository.findByJobIdAndIsActive(id,1);
        if (job == null) {
            throw new ResourceNotFoundException("Job not found or is inactive");
        }
        return toJobDTO(job);
    }

    @Override
    @Transactional
    public JobDTO saveJob(JobDTO jobDTO) {
        LocalDate today = LocalDate.now();

        if (jobDTO.getStartDate().isAfter(today)) {
            jobDTO.setJobStatus("Draft");
        } else if (jobDTO.getStartDate().isEqual(today)) {
            jobDTO.setJobStatus("Open");
        } else {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        if (jobDTO.getUpdateById() == null) {
            throw new IllegalArgumentException("UpdateById must be provided");
        }
        Job job = toJobEntity(jobDTO);
        job.setIsActive(1);
        Job savedJob = jobRepository.save(job);
        return toJobDTO(savedJob);
    }

    @Override
    @Transactional
    public JobDTO updateJob(Integer id, JobDTO jobDTO) {
        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        LocalDate today = LocalDate.now();

        if (jobDTO.getStartDate().isAfter(today)) {
            existingJob.setJobStatus("Draft");
        } else if (jobDTO.getStartDate().isEqual(today)) {
            existingJob.setJobStatus("Open");
        }
        existingJob.setJobTitle(jobDTO.getJobTitle());
        existingJob.setStartDate(jobDTO.getStartDate());
        existingJob.setEndDate(jobDTO.getEndDate());
        existingJob.setJobSkills(jobDTO.getJobSkills());
        existingJob.setJobLevel(jobDTO.getJobLevel());
        existingJob.setJobBenefit(jobDTO.getJobBenefit());
        existingJob.setSalaryRangeFrom(jobDTO.getSalaryRangeFrom());
        existingJob.setSalaryRangeTo(jobDTO.getSalaryRangeTo());
        existingJob.setWorkingAddress(jobDTO.getWorkingAddress());
        existingJob.setJobDescription(jobDTO.getJobDescription());
        existingJob.setCreateAt(jobDTO.getCreateAt());
        existingJob.setUpdateAt(LocalDate.now());

        if (jobDTO.getUpdateById() == null) {
            throw new IllegalArgumentException("UpdateById must be provided");
        }
        User user = userRepository.findById(jobDTO.getUpdateById())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        existingJob.setUpdateBy(user);

        existingJob = jobRepository.save(existingJob);
        return toJobDTO(existingJob);
    }

    @Override
    @Transactional
    public Job deleteJob(Integer id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        job.setIsActive(0);
        job.setUpdateAt(LocalDate.now());
        return jobRepository.save(job);
    }

    @Override
    public Page<JobDTO> findJobsByCriteria(String jobTitle, String jobStatus, Pageable pageable) {
        if (jobTitle == null && jobStatus == null) {
            // Fetch all jobs if no search criteria are provided
            return jobRepository.findAll(pageable).map(this::toJobDTO);
        }
        return jobRepository.findByJobTitleAndJobStatus(jobTitle, jobStatus, pageable).map(this::toJobDTO);
    }

    @Override
    public Page<JobDTO> getAllJobsSortedByStatusAndCreatedDate(Pageable pageable) {
        Page<Job> jobsPage = jobRepository.findAllSortedByCreationDateStatusAndStartDate(pageable);
        return jobsPage.map(this::toJobDTO);
    }

    @Override
    @Transactional
    public void importJobsFromFile(MultipartFile file, Integer currentUserId) throws IOException {
        List<JobDTO> jobDTOs = fileHelper.readFile(file);

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        for (JobDTO jobDTO : jobDTOs) {
            Job newJob = toJobEntity(jobDTO);
            newJob.setUpdateBy(user);
            newJob.setIsActive(1);
            jobRepository.save(newJob);
        }
    }

    @Override
    public JobDTO toJobDTO(Job job) {
        return JobDTO.builder()
                .jobId(job.getJobId())
                .jobTitle(job.getJobTitle())
                .startDate(job.getStartDate())
                .endDate(job.getEndDate())
                .jobSkills(job.getJobSkills())
                .jobLevel(job.getJobLevel())
                .jobBenefit(job.getJobBenefit())
                .salaryRangeFrom(job.getSalaryRangeFrom())
                .salaryRangeTo(job.getSalaryRangeTo())
                .workingAddress(job.getWorkingAddress())
                .jobDescription(job.getJobDescription())
                .jobStatus(job.getJobStatus())
                .createAt(job.getCreateAt())
                .updateAt(job.getUpdateAt())
                .updateById(job.getUpdateBy().getUserId())
                .updateByUserName(job.getUpdateBy().getUsername())
                .build();
    }

    @Override
    public Job toJobEntity(JobDTO jobDTO) {
        User user = null;
        if (jobDTO.getUpdateById() != null) {
            user = userRepository.findById(jobDTO.getUpdateById())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        return Job.builder()
                .jobTitle(jobDTO.getJobTitle())
                .startDate(jobDTO.getStartDate())
                .endDate(jobDTO.getEndDate())
                .jobSkills(jobDTO.getJobSkills())
                .jobLevel(jobDTO.getJobLevel())
                .jobBenefit(jobDTO.getJobBenefit())
                .salaryRangeFrom(jobDTO.getSalaryRangeFrom())
                .salaryRangeTo(jobDTO.getSalaryRangeTo())
                .workingAddress(jobDTO.getWorkingAddress())
                .jobDescription(jobDTO.getJobDescription())
                .jobStatus(jobDTO.getJobStatus())
                .createAt(jobDTO.getCreateAt() != null ? jobDTO.getCreateAt() : LocalDate.now())
                .updateAt(LocalDate.now())
                .updateBy(user)
                .build();
    }

    @Override
    public List<Job> getJobOpen() {
        return jobRepository.findByJobStatusAndIsActive("OPEN",1);
    }

    @Override
    public void updateJobStatuses(String triggerSource) {
        LocalDate today = LocalDate.now();

        // Update Draft to Open
        List<Job> draftJobs = jobRepository.findByJobStatusAndStartDateLessThanEqualAndIsActive("Draft", today, 1);
        for (Job job : draftJobs) {
            job.setJobStatus("Open");
            jobRepository.save(job);
        }

        // Update Open to Closed
        List<Job> openJobs = jobRepository.findByJobStatusAndEndDateLessThanAndIsActive("Open", today, 1);
        for (Job job : openJobs) {
            job.setJobStatus("Closed");
            jobRepository.save(job);
        }

        System.out.println("Job statuses updated at: " + LocalDateTime.now() + " - Triggered by: " + triggerSource);
    }
}