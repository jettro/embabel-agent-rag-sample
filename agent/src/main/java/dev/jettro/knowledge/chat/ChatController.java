package dev.jettro.knowledge.chat;

import com.embabel.agent.api.identity.SimpleUser;
import com.embabel.agent.api.identity.User;
import com.embabel.chat.ChatSession;
import com.embabel.chat.Chatbot;
import com.embabel.chat.UserMessage;
import dev.jettro.knowledge.chat.model.InitSessionRequest;
import dev.jettro.knowledge.chat.model.InitSessionResponse;
import dev.jettro.knowledge.chat.model.Request;
import dev.jettro.knowledge.chat.model.Response;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    // Map from processId to a list of SseEmitters
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> processEmitters =
            new ConcurrentHashMap<>();

    private final Chatbot chatbot;

    public ChatController(Chatbot chatbot) {
        this.chatbot = chatbot;
    }

    @PostMapping(value = "/init", consumes = "application/json")
    public InitSessionResponse initialiseSession(@RequestBody InitSessionRequest request, Authentication authentication) {

        User user = getUser(authentication);
        logger.info("Received request to initialise session for user: {}", user.getId());

        ChatSession chatSession = createOrFetchSession(request.conversationId(), user);

        var conversationId = chatSession.getConversation().getId();
        var processId = chatSession.getProcessId();

        logger.info("Created or loaded a session for conversation ID: {} and process ID: {}", conversationId,
                processId);

        return new InitSessionResponse(chatSession.getConversation().getId(), chatSession.getProcessId());
    }

    @GetMapping(value = "/stream/{processId}")
    public SseEmitter streamMessages(@PathVariable(name = "processId") String processId, Authentication authentication) {
        logger.info("Starting message streaming for process ID: {}", processId);

        var emitter = new SseEmitter(Long.MAX_VALUE);

        processEmitters.computeIfAbsent(processId, id -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> processEmitters.get(processId).remove(emitter));
        emitter.onError(throwable -> processEmitters.get(processId).remove(emitter));
        emitter.onTimeout(() -> processEmitters.get(processId).remove(emitter));

        User user = getUser(authentication);

        var outputChannel = createOrFetchSession(processId, user).getOutputChannel();
        if (outputChannel instanceof SseEmitterOutputChannel sseEmitterOutputChannel) {
            sseEmitterOutputChannel.setEmitter(emitter, processId);
        } else {
            throw new IllegalStateException("Output channel is not a SseEmitterOutputChannel");
        }

        return emitter;
    }

    @PostMapping(value = "/message", consumes = "application/json")
    public Response chat(@RequestBody Request request) {
        logger.info("Received message: {}", request.message());

        var conversationId = request.conversationId();

        // Load the ChatSession using the conversationId or create a new one
        ChatSession chatSession = chatbot.findSession(conversationId);
        if (chatSession == null) {
            throw new IllegalArgumentException("Conversation not found for ID: " + conversationId);
        }

        // Call the agent with the user message
        chatSession.onUserMessage(new UserMessage(request.message()));

        return new Response("You should receive a response soon", chatSession.getProcessId());
    }

    @NotNull
    private ChatSession createOrFetchSession(String conversationId, User user) {
        if (user == null) {
            user = new SimpleUser("default", "Default User", "default", "default@example.org");
        }

        ChatSession chatSession;
        if (conversationId == null || conversationId.isEmpty()) {
            logger.info("Creating new conversation for user: {}", user.getDisplayName());
            chatSession = chatbot.createSession(user, new SseEmitterOutputChannel(), null);
        } else {
            logger.info("Fetching conversation for ID: {} for user: {}", conversationId, user.getDisplayName());
            chatSession = chatbot.findSession(conversationId);
            if (chatSession == null) {
                throw new IllegalArgumentException("Conversation not found for ID: " + conversationId);
            }
        }
        return chatSession;
    }

    private User getUser(Authentication authentication) {
        return new SimpleUser(authentication.getName(), authentication.getName(), authentication.getName(), authentication.getName() + "@example" +
                ".org");
    }

}
