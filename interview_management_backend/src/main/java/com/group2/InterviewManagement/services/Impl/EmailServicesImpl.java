package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.services.EmailServices;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServicesImpl implements EmailServices {

    private final JavaMailSender javaMailSender;

    @Autowired
    public EmailServicesImpl(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }
    
    @Override
    public void sendEmail(String from, String to, String subject, String text) {
        //MimeMailMessage file
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text,true);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        // thực hiện hành động gửi email
        javaMailSender.send(message);
    }
}
