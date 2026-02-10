package dev.jettro.knowledge.chat;

import com.embabel.chat.ChatSession;
import com.embabel.chat.Chatbot;
import com.embabel.chat.UserMessage;
import dev.jettro.knowledge.chat.model.InitSessionResponse;
import dev.jettro.knowledge.chat.model.Request;
import dev.jettro.knowledge.chat.model.Response;
import dev.jettro.knowledge.security.CustomUserDetails;
import dev.jettro.knowledge.security.KnowledgeUser;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @GetMapping(value = "/init", consumes = "application/json")
    public InitSessionResponse initialiseSession(@AuthenticationPrincipal CustomUserDetails authentication) {
        KnowledgeUser user = authentication.getUser();
        logger.info("Received request to initialise session for user: {}", user.getId());

        ChatSession chatSession = createOrFetchSession(user);

        var conversationId = chatSession.getConversation().getId();
        var processId = chatSession.getProcessId();

        logger.info("Created or loaded a session for conversation ID: {} and process ID: {}", conversationId,
                processId);

        return new InitSessionResponse(chatSession.getConversation().getId());
    }

    @GetMapping(value = "/stream")
    public SseEmitter streamMessages(@AuthenticationPrincipal CustomUserDetails authentication) {
        var processId = authentication.getUser().getProcessId();
        logger.info("Starting message streaming for process ID: {}", processId);

        var emitter = new SseEmitter(Long.MAX_VALUE);

        processEmitters.computeIfAbsent(processId, id -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> processEmitters.get(processId).remove(emitter));
        emitter.onError(throwable -> processEmitters.get(processId).remove(emitter));
        emitter.onTimeout(() -> processEmitters.get(processId).remove(emitter));

        KnowledgeUser user = authentication.getUser();

        var outputChannel = createOrFetchSession(user).getOutputChannel();
        if (outputChannel instanceof SseEmitterOutputChannel sseEmitterOutputChannel) {
            sseEmitterOutputChannel.setEmitter(emitter, processId);
        } else {
            throw new IllegalStateException("Output channel is not a SseEmitterOutputChannel");
        }

        return emitter;
    }

    @PostMapping(value = "/message", consumes = "application/json")
    public Response chat(@RequestBody Request request, @AuthenticationPrincipal CustomUserDetails authentication) {
        logger.info("Received message: {}", request.message());

        var processId = authentication.getUser().getProcessId();
        if (processId == null || processId.isEmpty()) {
            throw new IllegalArgumentException("User is not authenticated or has no matching process ID");
        }

        // Load the ChatSession using the conversationId or create a new one
        ChatSession chatSession = chatbot.findSession(processId);
        if (chatSession == null) {
            throw new IllegalArgumentException("Conversation not found for ID: " + processId);
        }

        // Call the agent with the user message
        chatSession.onUserMessage(new UserMessage(request.message()));

        return new Response("You should receive a response soon", chatSession.getProcessId());
    }

    @NotNull
    private ChatSession createOrFetchSession(KnowledgeUser user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null, it should be authenticated");
        }

        var processId = user.getProcessId();

        ChatSession chatSession;
        if (processId == null || processId.isEmpty()) {
            logger.info("Creating new conversation for user: {}", user.getDisplayName());
            chatSession = chatbot.createSession(user, new SseEmitterOutputChannel(), null, null);
            processId = chatSession.getProcessId();
            user.setProcessId(processId);
        } else {
            logger.info("Fetching conversation for ID: {} for user: {}", processId, user.getDisplayName());
            chatSession = chatbot.findSession(processId);
            if (chatSession == null) {
                throw new IllegalArgumentException("Process not found for ID: " + processId);
            }
        }
        return chatSession;
    }

}
