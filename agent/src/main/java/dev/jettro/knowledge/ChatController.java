package dev.jettro.knowledge;

import com.embabel.agent.api.channel.*;
import com.embabel.agent.api.identity.SimpleUser;
import com.embabel.agent.api.identity.User;
import com.embabel.chat.ChatSession;
import com.embabel.chat.Chatbot;
import com.embabel.chat.UserMessage;
import dev.jettro.knowledge.model.InitSessionRequest;
import dev.jettro.knowledge.model.InitSessionResponse;
import dev.jettro.knowledge.model.Request;
import dev.jettro.knowledge.model.Response;
import jakarta.servlet.http.HttpSession;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    public static final String CONVERSATION_ID_SESSION_ATTRIBUTE = "conversationId";

    private final Chatbot chatbot;

    public ChatController(Chatbot chatbot) {
        this.chatbot = chatbot;
    }

    @PostMapping(value = "/init", consumes = "application/json")
    public InitSessionResponse initialiseSession(@RequestBody InitSessionRequest request) {
        logger.info("Received request to initialise session for user: {}", request.userId());

        // TODO fetch user object
        User user = new SimpleUser(request.userId(), request.userId(), request.userId(), request.userId() + "@example.org");
        ChatSession chatSession = createOrFetchSession(request.conversationId(), user);

        return new InitSessionResponse(chatSession.getConversation().getId(), chatSession.getProcessId());
    }

    @PostMapping(value = "/message", consumes = "application/json")
    public Response chat(@RequestBody Request request) {
        logger.info("Received message: {}", request.message());

        var conversationId = request.conversationId();

        // Load the ChatSession using the conversationId or create a new one
        ChatSession chatSession = chatbot.findSession(conversationId);
        if (chatSession == null) { throw new IllegalArgumentException("Conversation not found for ID: " + conversationId);}

        // TODO Remove this in the end
        // Get hold of the output channel
        OutputChannel storedOutputChannel = chatSession.getOutputChannel();
        if (!(storedOutputChannel instanceof ControllerOutputChannel outputChannel)) {
            throw new IllegalStateException("Output channel is not a ControllerOutputChannel");
        }

        // Call the agent with the user message
        chatSession.onUserMessage(new UserMessage(request.message()));

        // Wait for the agent's response and return it
        var assistantResponse = outputChannel.waitForResponse(30, TimeUnit.SECONDS);

        return new Response(assistantResponse, chatSession.getProcessId());
    }

    @NotNull
    private ChatSession createOrFetchSession(Object conversationId, User user) {
        if (user == null) {
            user = new SimpleUser("default", "Default User", "default", "default@example.org");
        }

        ChatSession chatSession;
        if (conversationId == null || conversationId.equals("")) {
            logger.info("Creating new conversation for user: {}", user.getDisplayName());
            chatSession = chatbot.createSession(user, new ControllerOutputChannel(), null);
        } else {
            logger.info("Fetching conversation for ID: {} for user: {}", conversationId, user.getDisplayName());
            chatSession = chatbot.findSession((String) conversationId);
            if (chatSession == null) {
                throw new IllegalArgumentException("Conversation not found for ID: " + conversationId);
            }
            // Only required as we change the user within a session, which is not common.
            if (chatSession.getUser() != null && !chatSession.getUser().getId().equals(user.getId())) {
                chatSession = chatbot.createSession(user, new ControllerOutputChannel(), null);
            }
        }
        return chatSession;
    }

}
