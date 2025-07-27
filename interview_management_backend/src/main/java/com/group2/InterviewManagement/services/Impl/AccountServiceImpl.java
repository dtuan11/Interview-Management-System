package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.Enum.Department;
import com.group2.InterviewManagement.dto.UserDTO;
import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.exception.AppException;
import com.group2.InterviewManagement.exception.ErrorCode;
import com.group2.InterviewManagement.models.PasswordReset;
import com.group2.InterviewManagement.models.Role;
import com.group2.InterviewManagement.models.RoleUser;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.models.key.KeyRoleUser;
import com.group2.InterviewManagement.repository.RoleRepository;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.repository.UserRepositoryRest;
import com.group2.InterviewManagement.services.AccountService;
import com.group2.InterviewManagement.services.EmailServices;
import com.group2.InterviewManagement.services.PasswordResetService;
import com.group2.InterviewManagement.services.UserCustomerServices;
import com.group2.InterviewManagement.utils.PasswordGenerator;
//import com.group2.InterviewManagement.utils.UserUpdaterHandler;
import com.group2.InterviewManagement.utils.UserUpdaterHandler;
import jakarta.persistence.OptimisticLockException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AccountServiceImpl implements AccountService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final EmailServices emailServices;
    private final UserRepositoryRest userRepositoryRest;
    private final JWTServices jwtServices;
    private final UserCustomerServices userCustomerServices;
    private final RoleRepository roleRepository;
    private final PasswordResetService passwordResetService;
    private final UserUpdaterHandler userUpdaterHandler;

    @Autowired
    public AccountServiceImpl(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder, EmailServices emailServices, UserRepositoryRest userRepositoryRest, JWTServices jwtServices, UserCustomerServices userCustomerServices, RoleRepository roleRepository, PasswordResetService passwordResetService
                              ,                      UserUpdaterHandler userUpdaterHandler
    ) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.emailServices = emailServices;
        this.userRepositoryRest = userRepositoryRest;
        this.jwtServices = jwtServices;
        this.userCustomerServices = userCustomerServices;
        this.roleRepository = roleRepository;
        this.passwordResetService = passwordResetService;
        this.userUpdaterHandler = userUpdaterHandler;
    }

    @Override
    public User addNewUserAccount(User user) {
        return userRepository.save(user);
    }

    @Override
    public User parseUserDTOtoUser(UserDTO userDTO) {
        String username = createUserNameFromFull(userDTO.getFullName());
        String password = PasswordGenerator.generateRandomPassword();
        String passwordEndcode = bCryptPasswordEncoder.encode(password);
        if (userRepositoryRest.existsUsersByEmail(userDTO.getEmail())) {
            throw new AppException(ErrorCode.EmailExists);
        }
        //check phoneNumber has
        if (userRepositoryRest.existsUserByPhoneNumber(userDTO.getPhoneNumber())) {
            throw new AppException(ErrorCode.PhoneNumberExists);
        }
        //check user greater than 18 age
        if (!isUser18YearsOld(userDTO.getDob())) {
            throw new AppException(ErrorCode.AgeUnder18);
        }
        //check department
        String department = userDTO.getDepartment();
        if (!isDepartment(department)) {
            throw new AppException(ErrorCode.DepartmentNotMatch);
        }
        Thread thread = new Thread(() -> sendAccount(username, password, userDTO.getEmail()));
        thread.start();
        User user = User.builder()
                .fullName(userDTO.getFullName())
                .email(userDTO.getEmail())
                .dob(userDTO.getDob())
                .address(userDTO.getAddress())
                .phoneNumber(userDTO.getPhoneNumber())
                .department(userDTO.getDepartment())
                .isActive(Boolean.parseBoolean(userDTO.getIsActive()))
                .note(userDTO.getNote())
                .username(username)
                .password(passwordEndcode)
                .version(0)
                .build();

        // Map roles from DTO to RoleUser entities
        List<RoleUser> roleUsers = userDTO.getRoles().stream().map(roleName -> {
            Role role = roleRepository.findByRoleName(roleName);
            return RoleUser.builder()
                    .keyRoleUser(new KeyRoleUser(user.getUserId(), role.getRoleId()))
                    .role(role)
                    .user(user)
                    .build();
        }).collect(Collectors.toList());

        user.setRoleUsers(roleUsers);

        return user;
    }

    @Override
    public String createUserNameFromFull(String fullName) {
        List<String> names = Arrays.stream(fullName.split(" "))
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toList());

        if (names.isEmpty()) {
            return "";
        }

        String lastName = names.get(names.size() - 1);
        String initials = names.stream()
                .limit(names.size() - 1)  // Exclude the last name
                .map(name -> name.substring(0, 1).toUpperCase()) // Get first letter of each name
                .collect(Collectors.joining()); // Concatenate initials

        String baseUsername = lastName + initials;

        // Remove diacritics
        baseUsername = Normalizer.normalize(baseUsername, Normalizer.Form.NFD);
        baseUsername = baseUsername.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");

        int count = CountUserNameLike(baseUsername);
        int incrementalNumber = count + 1; // Start from 1 if no duplicates found

        return baseUsername + incrementalNumber;
    }

    @Override
    public int CountUserNameLike(String username) {
        return userRepository.countByUsernameStartingWith(username);
    }

    @Override
    public void sendAccount(String username, String password, String emailSend) {
        String subject = "no-reply-email-IMS-system <Account created>";

        // HTML content for the email
        String htmlContent = "<html><body>" +
                "<h2>This email is from the IMS system,</h2>" +
                "<p>Your account has been created. Please use the following credentials to login:</p>" +
                "<p><strong>Username:</strong> " + username + "</p>" +
                "<p><strong>Password:</strong> " + password + "</p>" +
                "<p>If there is anything wrong, please reach out to the recruiter <offer recruiter owner account>. We are sorry for this inconvenience.</p>" +
                "<p>Thanks & Regards!<br>" +
                "IMS Team</p>" +
                "</body></html>";

        // Assuming emailServices is an instance or method that can send emails
        emailServices.sendEmail("interviewmanagement.fa.fpt@gmail.com", emailSend, subject, htmlContent);
    }

    @Transactional
    @Override
    public User updateUserByID(int userId, UserDTO userDTO) {
        Optional<User> existingUserOptional = userRepository.findById(userId);

        if (existingUserOptional.isEmpty()) {
            throw new AppException(ErrorCode.UserIDNotFount);
        }

        User existingUser = existingUserOptional.get();

        // Update email if changed
        if (userDTO.getEmail() != null && !existingUser.getEmail().equals(userDTO.getEmail())) {
            if (userRepositoryRest.existsUsersByEmail(userDTO.getEmail())) {
                throw new AppException(ErrorCode.EmailExists);
            }
            existingUser.setEmail(userDTO.getEmail());
        }

        // Update phone number if changed
        if (userDTO.getPhoneNumber() != null && !existingUser.getPhoneNumber().equals(userDTO.getPhoneNumber())) {
            if (userRepositoryRest.existsUserByPhoneNumber(userDTO.getPhoneNumber())) {
                throw new AppException(ErrorCode.PhoneNumberExists);
            }
            existingUser.setPhoneNumber(userDTO.getPhoneNumber());
        }

        // Update date of birth if changed
        if (userDTO.getDob() != null && !existingUser.getDob().equals(userDTO.getDob())) {
            LocalDate todayMinus18Years = LocalDate.now().minusYears(18);
            LocalDate todayMinus60Years = LocalDate.now().minusYears(60);

            if (userDTO.getDob().isAfter(todayMinus18Years) || userDTO.getDob().isBefore(todayMinus60Years)) {
                throw new AppException(ErrorCode.AgeUnder18);
            }

            existingUser.setDob(userDTO.getDob());
        }

        // Update other fields
        if (userDTO.getFullName() != null) {
            existingUser.setFullName(userDTO.getFullName());
        }
        if (userDTO.getAddress() != null) {
            existingUser.setAddress(userDTO.getAddress());
        }
        if (userDTO.getDepartment() != null) {
            if (!isDepartment(userDTO.getDepartment())) {
                throw new AppException(ErrorCode.DepartmentNotMatch);
            }
            existingUser.setDepartment(userDTO.getDepartment());
        }
        if (userDTO.getNote() != null) {
            existingUser.setNote(userDTO.getNote());
        }

        // Update roles only if they have changed
        if (userDTO.getRoles() != null) {
            Set<String> currentRoleNames = existingUser.getRoleUsers().stream()
                    .map(roleUser -> roleUser.getRole().getRoleName())
                    .collect(Collectors.toSet());

            Set<String> newRoleNames = new HashSet<>(userDTO.getRoles());

            if (!currentRoleNames.equals(newRoleNames)) {
                existingUser.getRoleUsers().clear(); // Clear existing roles

                List<RoleUser> roleUsers = userDTO.getRoles().stream().map(roleName -> {
                    Role role = roleRepository.findByRoleName(roleName);
                    if (role == null) {
                        throw new AppException(ErrorCode.RoleNotFound);
                    }
                    return RoleUser.builder()
                            .keyRoleUser(new KeyRoleUser(role.getRoleId(), existingUser.getUserId()))
                            .role(role)
                            .user(existingUser)
                            .build();
                }).toList();

                existingUser.getRoleUsers().addAll(roleUsers);
                existingUser.setVersion(existingUser.getVersion() + 1);
            }
        }

        try {
            User updatedUser = userRepository.save(existingUser);
            System.out.println("User updated, notifying WebSocket sessions...");
            userUpdaterHandler.notifyUserUpdated(userId); // Notify WebSocket sessions
            return updatedUser;
        } catch (OptimisticLockException ex) {
            throw new AppException(ErrorCode.UserIsBeingUpdated);
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }
    }








    @Override
    public boolean isUser18YearsOld(LocalDate dob) {
        LocalDate today = LocalDate.now();
        Period period = Period.between(dob, today);
        return period.getYears() >= 18;
    }

    @Override
    public boolean checkExpiredToken(String token) {
        try {
            String username = jwtServices.extractUsername(token);
            UserDetails userDetails = userCustomerServices.loadUserByUsername(username);
            return jwtServices.validateToken(token, userDetails);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void updateIsActiveById(int id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            userRepositoryRest.toggleIsActiveById(id);

        } else {
            throw new AppException(ErrorCode.UserIDNotFount);
        }
    }

    @Override
    public ResponseEntity<?> forgotPassword(String email) {
        Optional<User> user = userRepositoryRest.findByEmail(email);
        if (user.isPresent()) {
            User existingUser = user.get();
            PasswordReset passwordReset = passwordResetService.createPasswordResetLink(existingUser);
//            Thread thread = new Thread(() -> {
//                try {
//                    sendForgotPassword(email, passwordReset.getLink());
//                } catch (Exception e) {
//                    throw new AppException(ErrorCode.SendFail);
//                }
//            });
//            thread.start();
            ExecutorService executor = Executors.newSingleThreadExecutor();
            Future<?> future = executor.submit(() -> {
                try {
                    sendForgotPassword(email, passwordReset.getLink());
                } catch (Exception e) {
                    throw new AppException(ErrorCode.SendFail);
                }
            });

            // Attempt to get the result of the thread execution
            try {
                future.get(); // This will block until the thread completes
            } catch (InterruptedException | ExecutionException e) {
                throw new AppException(ErrorCode.SendFail);
            } finally {
                executor.shutdown();
            }
        } else {
            throw new AppException(ErrorCode.EmailNotFound);
        }

        return ResponseEntity.ok(ResponseDTO.builder().code(7).message("Email sent successfully").data(email).build());
    }

    @Override
    public ResponseEntity<?> setnewPassword(String email, String password) {
        if (!isValidPassword(password)) {
            throw new AppException(ErrorCode.PasswordInvalid);
        }
        Optional<User> user = userRepositoryRest.findByEmail(email);
        if (user.isPresent()) {
            User existingUser = user.get();
            String passwordEndcode = bCryptPasswordEncoder.encode(password);
            existingUser.setPassword(passwordEndcode);
            userRepository.save(existingUser);
        } else {
            throw new AppException(ErrorCode.EmailNotFound);
        }

        return ResponseEntity.ok(ResponseDTO.builder().code(8).message("Password updated successfully").data(email).build());
    }

    @Override
    public boolean isValidPassword(String password) {
        String passwordPattern = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{7,}$";
        Pattern pattern = Pattern.compile(passwordPattern);
        Matcher matcher = pattern.matcher(password);
        return matcher.matches();
    }

    @Override
    public void sendForgotPassword(String email, String link) {
        String subject = "Subject Password Reset";
        String text = "We have just received a password reset request for <" + email + ">. ";
        text += "Please click <a href=\"" + link + "\">here</a> to reset your password.<br/>";
        text += "For your security, the link will expire in 24 hours or immediately after you reset your password.<br/>";
        text += "Thanks & Regards!<br/>IMS Team.";

        emailServices.sendEmail("interviewmanagement.fa.fpt@gmail.com", email, subject, text);
    }

    @Override
    public boolean isDepartment(String department) {
        for (Department dept : Department.values()) {
            if (dept.getDepartment().equals(department)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public UserDTO mapUsertoUserDTO(User user) {
        List<String> userRoles = user.getRoleUsers().stream()
                .map(roleUser -> roleUser.getRole().getRoleName())
                .collect(Collectors.toList());

        return UserDTO.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .password(user.getPassword()) // Note: In a real application, do not expose password like this
                .fullName(user.getFullName())
                .address(user.getAddress())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .department(user.getDepartment())
                .gender(user.isGender())
                .note(user.getNote())
                .dob(user.getDob())
                .isActive(String.valueOf(user.isActive()))
                .roles(userRoles) // Ensure roles are correctly populated
                .build();
    }

    @Override
    public User getUserByID(int userID) {
        return userRepository.findById(userID)
                .orElseThrow(() -> new AppException(ErrorCode.UserIDNotFount));
    }
}