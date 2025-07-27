package com.group2.InterviewManagement.utils;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Collections;
@Component
public class GoogleDriveConfig {
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String SERVICE_ACCOUNT_KEY_PATH = getPathToGoogleCredentials();
    public static final String FILE_TYPE = "application/octet-stream";
    public static final String FOLDER_ID = "1Cn3U9CGJd_bo5uWuRejAilWFLME7Thzi"; // Candidate_CV


    private static String getPathToGoogleCredentials() {
        String currentDirectory = System.getProperty("user.dir");
        Path pathFile = Paths.get(currentDirectory, "interviewmanagerUploadConfig.json");
        return pathFile.toString();
    }

    public Drive createDriveService() throws GeneralSecurityException, IOException {
        GoogleCredential credential = GoogleCredential.fromStream(new FileInputStream(SERVICE_ACCOUNT_KEY_PATH))
                .createScoped(Collections.singleton(DriveScopes.DRIVE));
        return new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credential
        ).build();
    }
}
