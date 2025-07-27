package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.response.ResponseDTO;

import java.io.File;

public interface FileService {

    String uploadFile(File file, String filename);


    boolean deleteFileByFileUrl(String fileUrl);

    String getFileName(String fileUrl);
}
