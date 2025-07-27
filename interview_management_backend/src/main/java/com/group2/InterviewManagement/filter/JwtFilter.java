package com.group2.InterviewManagement.filter;

import com.group2.InterviewManagement.exception.AppException;
import com.group2.InterviewManagement.exception.ErrorCode;
import com.group2.InterviewManagement.services.Impl.JWTServices;
import com.group2.InterviewManagement.services.UserCustomerServices;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JWTServices jwtServices;
    private final UserCustomerServices userCustomerServices;

    @Autowired
    public JwtFilter(JWTServices jwtServices, UserCustomerServices userCustomerServices) {
        this.jwtServices = jwtServices;
        this.userCustomerServices = userCustomerServices;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwtToken = authHeader.substring(7);
        String userEmail = null;

        try {
            userEmail = jwtServices.extractUsername(jwtToken); // Extracting username inside try-catch
        } catch (ExpiredJwtException e) {
            // Handle expired token here
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Token expired\"}");
            response.getWriter().flush();
            return;
        } catch (JwtException e) {
            // Handle other JWT exceptions
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Invalid token\"}");
            response.getWriter().flush();
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userCustomerServices.loadUserByUsername(userEmail);

            if (jwtServices.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("Token validation failed for user: " + userEmail);
            }
        } else {
            System.out.println("JWT token does not contain a valid username or authentication is already set.");
        }

        filterChain.doFilter(request, response);
    }

}