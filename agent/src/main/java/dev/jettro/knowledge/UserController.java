package dev.jettro.knowledge;

import com.embabel.agent.api.identity.SimpleUser;
import com.embabel.agent.api.identity.User;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static dev.jettro.knowledge.ChatController.CONVERSATION_ID_SESSION_ATTRIBUTE;

@RestController
@RequestMapping("/users")
public class UserController {
    private final static Logger logger = LoggerFactory.getLogger(UserController.class);

    private static final List<User> USERS = List.of(
            new SimpleUser("jettro", "Jettro", "jettro", "jettro@example.org"),
            new SimpleUser("ian", "Ian", "ian", "ian@example.org"),
            new SimpleUser("roy", "Roy", "roy", "roy@example.org"),
            new SimpleUser("marijn", "Marijn", "marijn", "marijn@example.org")
    );

    @GetMapping
    public List<User> getUsers() {
        return USERS;
    }

    @PostMapping("/{id}")
    public String selectUser(@PathVariable("id") String id, HttpSession session) {
        logger.info("Selected user: {}", id);

        Optional<User> user = USERS.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst();
        
        user.ifPresent(u -> session.setAttribute("user", u));

        session.setAttribute(CONVERSATION_ID_SESSION_ATTRIBUTE, null);

        return "User selected: " + id;
    }
}
