package dev.jettro.knowledge;

import com.embabel.agent.api.identity.SimpleUser;
import com.embabel.agent.api.identity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

}
