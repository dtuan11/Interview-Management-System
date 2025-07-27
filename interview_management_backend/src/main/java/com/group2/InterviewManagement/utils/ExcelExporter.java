package com.group2.InterviewManagement.utils;

import com.group2.InterviewManagement.models.Offer;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public class ExcelExporter {
    private XSSFWorkbook workbook;
    private XSSFSheet sheet;
    private List<Offer> listOffers;

    public ExcelExporter(List<Offer> listOffers) {
        this.listOffers = listOffers;
        workbook = new XSSFWorkbook();
    }
    private void writeHeaderLine() {
        sheet = workbook.createSheet("Offers List");

        Row row = sheet.createRow(0);

        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeight(14);
        style.setFont(font);
        createCell(row, 0, "Candidate Name", style);
        createCell(row, 1, "Candidate Email", style);
        createCell(row, 2, "Position", style);
        createCell(row, 3, "Approve By", style);
        createCell(row, 4, "Recruiter Owner", style);
        createCell(row, 5, "Contract Type", style);
        createCell(row, 6, "Level", style);
        createCell(row, 7, "Department", style);
        createCell(row, 8, "Due Date", style);
        createCell(row, 9, "Contract Start", style);
        createCell(row, 10, "Contract End", style);
        createCell(row, 11, "Basic Salary", style);
        createCell(row, 12, "Note", style);
        createCell(row, 13, "Is Active", style);
        createCell(row, 14, "Offer Status", style);
        createCell(row, 15, "Update At", style);
        createCell(row, 16, "Create At", style);
    }
        private void createCell(Row row, int columnCount, Object value, CellStyle style) {
            sheet.autoSizeColumn(columnCount);
            Cell cell = row.createCell(columnCount);
            if (value instanceof Integer) {
                cell.setCellValue((Integer) value);
            } else if (value instanceof Boolean) {
                cell.setCellValue((Boolean) value);
            } else if (value instanceof Double) {
                cell.setCellValue((Double) value);
            } else if (value instanceof LocalDate) {
                cell.setCellValue(value.toString());
            } else {
                cell.setCellValue((String) value);
            }
            cell.setCellStyle(style);
        }
    private void writeDataLines() {
        int rowCount = 1;

        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontHeight(12);
        style.setFont(font);

        for (Offer offer : listOffers) {
            Row row = sheet.createRow(rowCount++);
            int columnCount = 0;

            createCell(row, columnCount++, offer.getCandidate().getFullName(), style);
            createCell(row, columnCount++, offer.getCandidate().getEmail(), style);
            createCell(row, columnCount++, offer.getPosition(), style);
            createCell(row, columnCount++, offer.getApproveByManager().getUsername(), style);
            createCell(row, columnCount++, offer.getRecruiterOwner().getUsername(), style);
            createCell(row, columnCount++, offer.getContractType(), style);
            createCell(row, columnCount++, offer.getLevel(), style);
            createCell(row, columnCount++, offer.getDepartment(), style);
            createCell(row, columnCount++, offer.getDueDate(), style);
            createCell(row, columnCount++, offer.getContractStart(), style);
            createCell(row, columnCount++, offer.getContractEnd(), style);
            createCell(row, columnCount++, offer.getBasicSalary(), style);
            createCell(row, columnCount++, offer.getNote(), style);
            createCell(row, columnCount++, offer.isActive(), style);
            createCell(row, columnCount++, offer.getOfferStatus(), style);
            createCell(row, columnCount++, offer.getUpdateAt(), style);
            createCell(row, columnCount++, offer.getCreateAt(), style);
        }
    }
    public String export(HttpServletResponse response) throws IOException {
        writeHeaderLine();
        writeDataLines();

        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();

        outputStream.close();
        return "Export success";
    }

}
