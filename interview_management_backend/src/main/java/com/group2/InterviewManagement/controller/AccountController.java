package com.group2.InterviewManagement.controller;

import com.group2.InterviewManagement.dto.request.LoginRequest;
import com.group2.InterviewManagement.dto.response.JwtResponse;
import com.group2.InterviewManagement.dto.response.ResetPasswordDTO;
import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.exception.AppException;
import com.group2.InterviewManagement.exception.ErrorCode;
import com.group2.InterviewManagement.models.PasswordReset;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.services.AccountService;
import com.group2.InterviewManagement.services.Impl.JWTServices;
import com.group2.InterviewManagement.services.PasswordResetService;
import com.group2.InterviewManagement.services.UserCustomerServices;
import com.group2.InterviewManagement.utils.UserDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AuthenticationManager authenticationManager;
    private final UserCustomerServices userCustomerServices;
    private final JWTServices jwtServices;
    private final AccountService accountService;
    private final PasswordResetService passwordResetService;

    @Autowired
    public AccountController(PasswordResetService passwordResetService, AccountService accountService, JWTServices jwtServices, UserCustomerServices userCustomerServices, AuthenticationManager authenticationManager) {
        this.passwordResetService = passwordResetService;
        this.accountService = accountService;
        this.jwtServices = jwtServices;
        this.userCustomerServices = userCustomerServices;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        // Xác thực người dùng bằng tên đăng nhập và mật khẩu
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            User user = userCustomerServices.findUserByUsername(loginRequest.getUsername());
            // Nếu xác thực thành công, tạo token JWT
            if (!user.isActive()) {
                return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.UserLoginFail.getCode()).message(ErrorCode.UserLoginFail.getMessage()).build());
            }
            if (authentication.isAuthenticated()) {
                final String jwt = jwtServices.generateToken(loginRequest.getUsername());
                String refreshToken = jwtServices.refreshToken(new UserDetail(user));

                return ResponseEntity.ok(new JwtResponse(200, "Success", jwt, refreshToken, "2Hours", userCustomerServices.getRoles(user)));
            }
        } catch (AuthenticationException e) {
            // Xác thực không thành công, trả về lỗi hoặc thông báo
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(400).message("Invalid username/password. Please try again.").build());
        }
        return ResponseEntity.badRequest().body("");
    }

    @PostMapping("/refreshToken")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody JwtResponse jwtResponse) {
        JwtResponse newJwtResponse = new JwtResponse();
        String username = jwtServices.extractUsername(jwtResponse.getToken());
        User user = userCustomerServices.findUserByUsername(username);

        if (jwtServices.validateToken(jwtResponse.getToken(), (UserDetails) user)) {
            String jwt = jwtServices.generateToken(user.getUsername());
            newJwtResponse.setCode(200);
            newJwtResponse.setToken(jwt);
            newJwtResponse.setRefreshToken(jwtResponse.getRefreshToken());
            newJwtResponse.setExpirationTime("2Hours");
            newJwtResponse.setMessage("Success Refresh Token");

            return ResponseEntity.ok(newJwtResponse);
        }
        newJwtResponse.setCode(500);
        return ResponseEntity.ok(newJwtResponse);
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        // Trích xuất token JWT từ header
        String jwt = token.substring(7); // Bỏ qua tiền tố "Bearer "
        boolean isTokenInvalidated = jwtServices.invalidateToken(jwt);

        if (isTokenInvalidated) {
            return ResponseEntity.ok().body("Logout successful");
        } else {
            return ResponseEntity.badRequest().body("Logout failed. Invalid token.");
        }
    }

    @GetMapping("/check-token")
    public ResponseEntity<?> checkTokenValidity(@RequestParam String token) {
        boolean isValid = accountService.checkExpiredToken(token);
        if (isValid) {
            return ResponseEntity.ok("Token is valid");
        } else {
            return ResponseEntity.status(401).body("Token is invalid or expired");
        }
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> createPasswordResetLink(@RequestParam String email) {
        return accountService.forgotPassword(email);
    }

    @GetMapping("/valid-password-link")
    public ResponseEntity<?> validatePasswordResetLink(@RequestParam String token, @RequestParam String email) {
        Optional<PasswordReset> link = passwordResetService.validatePasswordResetLink(token, email);
        if (link.isPresent() && link.get().getIsActive()) {
            return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Password reset link is valid.").data(null).build());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseDTO.builder().code(12).message("Password reset link is invalid or has expired.").data(null));
        }
    }

    @PostMapping("/set-new-password")
    public ResponseEntity<?> setNewPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        Optional<PasswordReset> link = passwordResetService.validatePasswordResetLink(resetPasswordDTO.getToken(), resetPasswordDTO.getEmail());
        if (link.isPresent() && link.get().getIsActive()) {
            ResponseEntity<?> response = accountService.setnewPassword(resetPasswordDTO.getEmail(), resetPasswordDTO.getNewPassword());
            if (response.getStatusCode() == HttpStatus.OK) {
                passwordResetService.deactivatePasswordResetLink(resetPasswordDTO.getToken());
                return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Password reset successfully.").data(null).build());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseDTO.builder().code(13).message("Failed to reset password.").data(null));
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseDTO.builder().code(12).message("Password reset link is invalid or has expired.").data(null));
        }
    }

}
