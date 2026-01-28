package dev.jettro.knowledge.proposition;

import dev.jettro.knowledge.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/propositions")
public class PropositionController {
    private static final Logger logger = LoggerFactory.getLogger(PropositionController.class);

    @GetMapping( "/contextId")
    public String fetchContextId(@AuthenticationPrincipal CustomUserDetails authentication) {
        return authentication.getUser().getCurrentContext();
    }
}
