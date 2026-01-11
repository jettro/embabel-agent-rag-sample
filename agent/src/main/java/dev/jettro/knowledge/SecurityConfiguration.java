package dev.jettro.knowledge;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        // Allow static resources (frontend)
                        .requestMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg").permitAll()
                        // Secure all API endpoints
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> {})
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
