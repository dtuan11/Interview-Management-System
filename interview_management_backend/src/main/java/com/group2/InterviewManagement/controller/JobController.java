package com.group2.InterviewManagement.controller;

import com.group2.InterviewManagement.dto.JobDTO;
import com.group2.InterviewManagement.models.CommonValue;
import com.group2.InterviewManagement.models.Job;
import com.group2.InterviewManagement.repository.CommonValueRepository;
import com.group2.InterviewManagement.services.JobService;
import com.group2.InterviewManagement.utils.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/job")
public class JobController {

    private final JobService jobService;
    private final CommonValueRepository commonValueRepository;

    @Autowired
    public JobController(JobService jobService, CommonValueRepository commonValueRepository) {
        this.jobService = jobService;
        this.commonValueRepository = commonValueRepository;
    }

    @GetMapping("/getJobs")
    public ResponseEntity<Page<JobDTO>> getJobs(
            @RequestParam(value = "jobTitle", required = false) String jobTitle,
            @RequestParam(value = "jobStatus", required = false) String jobStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        // Treat empty jobTitle as null
        if (jobTitle != null && jobTitle.trim().isEmpty()) {
            jobTitle = null;
        }

        // Treat empty jobStatus as null (optional)
        if (jobStatus != null && jobStatus.trim().isEmpty()) {
            jobStatus = null;
        }
        Page<JobDTO> jobDTOPage;
        if (jobTitle == null && jobStatus == null) {
            // If no search criteria, fetch all jobs (paginated)
            jobDTOPage = jobService.getAllJobsSortedByStatusAndCreatedDate(pageable);
        } else {
            // Apply search criteria
            jobDTOPage = jobService.findJobsByCriteria(jobTitle, jobStatus, pageable);
        }

        return new ResponseEntity<>(jobDTOPage, HttpStatus.OK);
    }


    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getJobById(@PathVariable Integer id) {
        return new ResponseEntity<>(jobService.getJobById(id), HttpStatus.OK);
    }

    @PostMapping("/saveJob")
    public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO jobDTO) {
        return new ResponseEntity<>(jobService.saveJob(jobDTO), HttpStatus.CREATED);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<JobDTO> updateJob(@PathVariable Integer id, @RequestBody JobDTO jobDTO) {
        return new ResponseEntity<>(jobService.updateJob(id, jobDTO), HttpStatus.OK);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<JobDTO> deleteJob(@PathVariable Integer id) {
        Job deletedJob = jobService.deleteJob(id);
        return new ResponseEntity<>(jobService.toJobDTO(deletedJob), HttpStatus.OK);
    }

    @PostMapping("/import")
    public ResponseEntity<?> importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        try {
            jobService.importJobsFromFile(file, userId);
            Page<JobDTO> jobDTOPage = jobService.getAllJobsSortedByStatusAndCreatedDate(pageable);
            return new ResponseEntity<>(jobDTOPage, HttpStatus.OK);
        } catch (ValidationException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during file processing");
        }
    }

    @GetMapping("/common-values")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getAllCommonValues() {
        List<CommonValue> allValues = commonValueRepository.findAll();

        Map<String, List<Map<String, Object>>> groupedValues = allValues.stream()
                .collect(Collectors.groupingBy(
                        CommonValue::getName,
                        Collectors.mapping(
                                cv -> Map.of(
                                        "label", cv.getValue(),
                                        "value", cv.getValue(),
                                        "index", cv.getIndexKey()
                                ),
                                Collectors.toList()
                        )
                ));

        return ResponseEntity.ok(groupedValues);
    }
}
