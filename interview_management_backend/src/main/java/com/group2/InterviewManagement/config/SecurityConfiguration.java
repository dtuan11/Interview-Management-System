package com.group2.InterviewManagement.config;

import com.group2.InterviewManagement.filter.JwtFilter;
import com.group2.InterviewManagement.services.Impl.EndPointServices;
import com.group2.InterviewManagement.services.UserCustomerServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;

@Configuration
public class SecurityConfiguration {
    private JwtFilter jwtFilter;
    private UserCustomerServices userCustomerServices;

    @Autowired
    public SecurityConfiguration(UserCustomerServices userCustomerServices, JwtFilter jwtFilter) {
        this.userCustomerServices = userCustomerServices;
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public BCryptPasswordEncoder bCrypt() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Autowired
    public DaoAuthenticationProvider authenticationProvider(UserCustomerServices userCustomerServices) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userCustomerServices);
        provider.setPasswordEncoder(bCrypt());
        return provider;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity.authorizeHttpRequests(config -> config
                .requestMatchers(HttpMethod.GET, EndPointServices.publicGetEndPoint).permitAll()
                .requestMatchers(HttpMethod.POST, EndPointServices.publicPostEndPoint).permitAll()
                .requestMatchers(HttpMethod.GET, EndPointServices.adminGetEndPoint).hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.POST, EndPointServices.adminPostEndPoint).hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, EndPointServices.adminPutEndPoint).hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, EndPointServices.adminDeleteEndPoint).hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, EndPointServices.adminAndRecruiterAndManagerGetEndPoint)
                .hasAnyAuthority("ADMIN","RECRUITER","MANAGER")
                .requestMatchers(HttpMethod.POST, EndPointServices.adminAndRecruiterAndManagerPostEndPoint)
                .hasAnyAuthority("ADMIN","RECRUITER","MANAGER")
                .requestMatchers(HttpMethod.PUT, EndPointServices.adminAndRecruiterAndManagerPutEndPoint)
                .hasAnyAuthority("ADMIN","RECRUITER","MANAGER")
                .requestMatchers(HttpMethod.DELETE, EndPointServices.adminAndRecruiterAndManagerDeleteEndPoint)
                .hasAnyAuthority("ADMIN","RECRUITER","MANAGER")
                .requestMatchers(HttpMethod.PUT,EndPointServices.interviewerPutEndPoint).hasAuthority("INTERVIEWER")

                .anyRequest().authenticated()// Ensure all other requests are authenticated
        );
        httpSecurity.cors(cors -> {
            cors.configurationSource(request -> {
                CorsConfiguration corsConfig = new CorsConfiguration();
                corsConfig.addAllowedOrigin(EndPointServices.front_end_host);
                corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
                corsConfig.addAllowedHeader("*");
                return corsConfig;
            });
        });
        httpSecurity.authenticationProvider(authenticationProvider(userCustomerServices)).addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        httpSecurity.sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        httpSecurity.httpBasic(Customizer.withDefaults());
        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        return httpSecurity.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}