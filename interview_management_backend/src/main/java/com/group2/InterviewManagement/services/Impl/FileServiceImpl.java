package com.group2.InterviewManagement.services.Impl;

import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.group2.InterviewManagement.services.FileService;
import com.group2.InterviewManagement.utils.GoogleDriveConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Collections;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FileServiceImpl implements FileService {
    private static final String FILE_ID_PATTERN = "https://drive\\.google\\.com/file/d/([^/]+)/view\\?usp=drivesdk";
    private static final String DOCS_ID_PATTERN = "https://docs\\.google\\.com/document/d/([^/]+)/edit\\?usp=drivesdk.*";

    private GoogleDriveConfig googleDriveConfig;

    @Autowired
    public FileServiceImpl(GoogleDriveConfig googleDriveConfig) {
        this.googleDriveConfig = googleDriveConfig;
    }

    @Override
    public String uploadFile(File file, String filename) {
        try {
            Drive drive = googleDriveConfig.createDriveService();
            com.google.api.services.drive.model.File fileMetaData = new com.google.api.services.drive.model.File();
            fileMetaData.setName(filename);
            fileMetaData.setParents(Collections.singletonList(GoogleDriveConfig.FOLDER_ID));

            FileContent fileContent = new FileContent(GoogleDriveConfig.FILE_TYPE, file);
            com.google.api.services.drive.model.File uploadedFile = drive.files()
                    .create(fileMetaData, fileContent)
                    .setFields("id, webViewLink").execute(); // Lấy cả webViewLink

            String fileUrl = uploadedFile.getWebViewLink();
//            System.out.println("File url: " + fileUrl);
            file.delete();

            return fileUrl;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    @Override
    public boolean deleteFileByFileUrl(String fileUrl) {
        try {
            Drive drive = googleDriveConfig.createDriveService();
            String fileId = extractFileId(fileUrl);
            drive.files().delete(fileId).execute();
            return true;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    @Override
    public String getFileName (String fileUrl) {
        try {
            Drive drive = googleDriveConfig.createDriveService();
            String fileId = extractFileId(fileUrl);
            com.google.api.services.drive.model.File file = drive.files().get(fileId).execute();
            return file.getName();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    private static String extractFileId(String url) {
        Pattern drivePattern = Pattern.compile(FILE_ID_PATTERN);
        Matcher driveMatcher = drivePattern.matcher(url);
        if (driveMatcher.find()) {
            return driveMatcher.group(1);
        }

        Pattern docsPattern = Pattern.compile(DOCS_ID_PATTERN);
        Matcher docsMatcher = docsPattern.matcher(url);
        if (docsMatcher.find()) {
            return docsMatcher.group(1);
        }

        throw new IllegalArgumentException("Invalid Google Drive URL format");
    }

    private String getFileNameWithoutExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return fileName;
        }
        int lastIndexOfDot = fileName.lastIndexOf('.');
        if (lastIndexOfDot == -1) {
            return fileName; // No extension found
        }
        return fileName.substring(0, lastIndexOfDot);
    }
}
