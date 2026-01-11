package dev.jettro.knowledge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LogoutController {
    private static final Logger logger = LoggerFactory.getLogger(LogoutController.class);

    @PostMapping("/logout")
    public void logout(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            String username = authentication.getName();
            logger.info("User {} logged out successfully", username);
            // Note: Sessions will be garbage collected automatically
            // or can be manually managed if needed in the future
        }
    }
}
