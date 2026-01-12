package dev.jettro.knowledge.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        // Allow all static resources (frontend) - using broader patterns
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/**/*.js",
                                "/**/*.css",
                                "/**/*.ico",
                                "/**/*.png",
                                "/**/*.svg",
                                "/**/*.jpg",
                                "/**/*.jpeg",
                                "/**/*.gif",
                                "/**/*.woff",
                                "/**/*.woff2",
                                "/**/*.ttf",
                                "/**/*.eot"
                        ).permitAll()
                        // Secure all API endpoints
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> {
                    // Suppress Basic Auth popup by customizing the entry point
                    httpBasic.authenticationEntryPoint((request, response, authException) -> {
                        // Only send 401 with JSON, no WWW-Authenticate header
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Unauthorized\"}");
                    });
                })
                // Enable session creation for SSE (EventSource) support
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .exceptionHandling(exceptions -> exceptions
                        // Global authentication entry point to prevent popup
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .csrf(csrf -> csrf.disable()); // Disable CSRF for simplicity (consider enabling with proper token handling in production)

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails jettro = User.builder()
                .username("jettro")
                .password(passwordEncoder().encode("password"))
                .roles("USER")
                .build();

        UserDetails ian = User.builder()
                .username("ian")
                .password(passwordEncoder().encode("password"))
                .roles("USER")
                .build();

        UserDetails roy = User.builder()
                .username("roy")
                .password(passwordEncoder().encode("password"))
                .roles("USER")
                .build();

        UserDetails marijn = User.builder()
                .username("marijn")
                .password(passwordEncoder().encode("password"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(jettro, ian, roy, marijn);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
