package dev.jettro.knowledge.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Map;

public class CustomUserDetailsService implements UserDetailsService {
    private final Map<String, CustomUserDetails> users;

    public CustomUserDetailsService(Map<String, CustomUserDetails> users) {
        this.users = users;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (users.containsKey(username)) {
            return users.get(username);
        } else {
            throw new UsernameNotFoundException("User not found");
        }
    }
}
