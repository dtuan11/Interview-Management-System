package com.group2.InterviewManagement.utils;

import com.group2.InterviewManagement.dto.JobDTO;
import jakarta.validation.ValidationException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

@Service
public class FileHelperForJob {


    private final JobValidator jobValidator;

    public FileHelperForJob(JobValidator jobValidator) {
        this.jobValidator = jobValidator;
    }

    public List<JobDTO> readFile(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IOException("Invalid file name");
        }

        if (filename.endsWith(".csv")) {
            return readCSVFile(file);
        } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
            return readExcelFile(file);
        } else {
            throw new IOException("Unsupported file format. Please upload a CSV or Excel file.");
        }
    }

    private List<JobDTO> readCSVFile(MultipartFile file) throws IOException {
        List<JobDTO> validJobDTOs = new ArrayList<>();
        List<String> errorMessages = new ArrayList<>();
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build())) {

            for (CSVRecord csvRecord : csvParser) {
                JobDTO jobDTO = new JobDTO();
                jobDTO.setJobTitle(csvRecord.get("Job Title"));
                jobDTO.setJobSkills(csvRecord.get("Job Skills"));
                LocalDate startDate = parseDate(csvRecord.get("Start Date"));
                jobDTO.setStartDate(startDate);
                jobDTO.setEndDate(parseDate(csvRecord.get("End Date")));
                jobDTO.setSalaryRangeFrom(parseDouble(csvRecord.get("Salary Range From")));
                jobDTO.setSalaryRangeTo(parseDouble(csvRecord.get("Salary Range To")));
                jobDTO.setWorkingAddress(csvRecord.get("Working Address"));
                jobDTO.setJobBenefit(csvRecord.get("Job Benefit"));
                jobDTO.setJobLevel(csvRecord.get("Job Level"));
                jobDTO.setJobDescription(csvRecord.get("Job Description"));
                jobDTO.setJobStatus(determineJobStatus(startDate));
                jobDTO.setCreateAt(LocalDate.now());

                List<String> validationErrors = jobValidator.validateJob(jobDTO);
                if (validationErrors.isEmpty()) {
                    validJobDTOs.add(jobDTO);
                } else {
                    errorMessages.add("Row " + csvRecord.getRecordNumber() + ": " + String.join(", ", validationErrors));
                }
            }
            if (!errorMessages.isEmpty()) {
                throw new ValidationException("Import failed due to validation errors:\n" + String.join("\n", errorMessages));
            }
        }
        return validJobDTOs;
    }


    public List<JobDTO> readExcelFile(MultipartFile file) throws IOException {
        List<JobDTO> validJobDTOs = new ArrayList<>();
        List<String> errorMessages = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) {
                rows.next(); // Skip header row
            }

            while (rows.hasNext()) {
                Row row = rows.next();
                JobDTO jobDTO = new JobDTO();

                jobDTO.setJobTitle(getCellStringValue(row.getCell(0)));
                jobDTO.setJobSkills(getCellStringValue(row.getCell(1)));
                LocalDate startDate = getCellLocalDateValue(row.getCell(2));
                jobDTO.setStartDate(startDate);
                jobDTO.setEndDate(getCellLocalDateValue(row.getCell(3)));
                jobDTO.setSalaryRangeFrom(getCellNumericValue(row.getCell(4)));
                jobDTO.setSalaryRangeTo(getCellNumericValue(row.getCell(5)));
                jobDTO.setWorkingAddress(getCellStringValue(row.getCell(6)));
                jobDTO.setJobBenefit(getCellStringValue(row.getCell(7)));
                jobDTO.setJobLevel(getCellStringValue(row.getCell(8)));
                jobDTO.setJobDescription(getCellStringValue(row.getCell(9)));
                jobDTO.setJobStatus(determineJobStatus(startDate));
                jobDTO.setCreateAt(LocalDate.now());

                List<String> validationErrors = jobValidator.validateJob(jobDTO);
                if (validationErrors.isEmpty()) {
                    validJobDTOs.add(jobDTO);
                } else {
                    errorMessages.add("Row " + (row.getRowNum() + 1) + ": " + String.join(", ", validationErrors));
                }
            }
            if (!errorMessages.isEmpty()) {
                throw new ValidationException("Import failed due to validation errors:\n" + String.join("\n", errorMessages));
            }
        }

        return validJobDTOs;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) {
            return "";
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((int) cell.getNumericCellValue());
        }
        return cell.getStringCellValue();
    }

    private LocalDate getCellLocalDateValue(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }
        return cell.getLocalDateTimeCellValue().toLocalDate();
    }

    private double getCellNumericValue(Cell cell) {
        if (cell == null) {
            return 0.0;
        }
        return cell.getNumericCellValue();
    }

    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }

        List<DateTimeFormatter> formatters = Arrays.asList(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy")
        );

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dateString, formatter);
            } catch (DateTimeParseException e) {
                // If parsing fails, try the next formatter
            }
        }

        // If all formatters fail, throw an exception
        throw new IllegalArgumentException("Unable to parse date: " + dateString);
    }

    private double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0.0;
        }
        return Double.parseDouble(value);
    }

    private String determineJobStatus(LocalDate startDate) {
        LocalDate today = LocalDate.now();
        return startDate.equals(today) ? "Open" : "Draft";
    }
}
