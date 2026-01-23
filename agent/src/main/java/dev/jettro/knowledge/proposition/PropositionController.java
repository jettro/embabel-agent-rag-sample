package dev.jettro.knowledge.proposition;

import com.embabel.dice.proposition.Proposition;
import com.embabel.dice.proposition.PropositionRepository;
import dev.jettro.knowledge.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/propositions")
public class PropositionController {
    private static final Logger logger = LoggerFactory.getLogger(PropositionController.class);

    private final PropositionRepository propositionRepository;

    public PropositionController(PropositionRepository propositionRepository) {
        this.propositionRepository = propositionRepository;
    }

    @GetMapping
    public List<Proposition> getPropositions(@AuthenticationPrincipal CustomUserDetails authentication) {
        logger.info("Getting propositions");
        List<Proposition> all = propositionRepository.findByContextIdValue(authentication.getUser().getCurrentContext());

        logger.info("Found {} propositions", all.size());

        return all;
    }

    @GetMapping( "/contextId")
    public String fetchContextId(@AuthenticationPrincipal CustomUserDetails authentication) {
        return authentication.getUser().getCurrentContext();
    }
}
