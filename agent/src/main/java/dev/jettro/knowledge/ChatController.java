package dev.jettro.knowledge;

import com.embabel.agent.api.channel.*;
import com.embabel.agent.api.identity.SimpleUser;
import com.embabel.agent.api.identity.User;
import com.embabel.agent.rag.ingestion.NeverRefreshExistingDocumentContentPolicy;
import com.embabel.agent.rag.ingestion.TikaHierarchicalContentReader;
import com.embabel.agent.rag.lucene.LuceneSearchOperations;
import com.embabel.chat.ChatSession;
import com.embabel.chat.Chatbot;
import com.embabel.chat.UserMessage;
import dev.jettro.knowledge.model.Request;
import jakarta.servlet.http.HttpSession;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@RestController
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    public static final String CONVERSATION_ID_SESSION_ATTRIBUTE = "conversationId";

    private final Chatbot chatbot;
    private final LuceneSearchOperations searchOperations;

    public ChatController(Chatbot chatbot, LuceneSearchOperations searchOperations) {
        this.chatbot = chatbot;
        this.searchOperations = searchOperations;
    }

    @PostMapping("/chat")
    public String chat(@RequestBody Request request, HttpSession session) {
        logger.info("Received message: {}", request.message());

        // Read parameters from the HttpSession
        User user = (User) session.getAttribute("user");
        var conversationId = session.getAttribute(CONVERSATION_ID_SESSION_ATTRIBUTE);

        // Load the ChatSession using the conversationId or create a new one
        ChatSession chatSession = createOrFetchSession(conversationId, user);

        // Store the conversation ID in the session
        session.setAttribute(CONVERSATION_ID_SESSION_ATTRIBUTE, chatSession.getConversation().getId());

        // Get hold of the output channel
        OutputChannel storedOutputChannel = chatSession.getOutputChannel();
        if (!(storedOutputChannel instanceof ControllerOutputChannel outputChannel)) {
            throw new IllegalStateException("Output channel is not a ControllerOutputChannel");
        }

        // Call the agent with the user message
        chatSession.onUserMessage(new UserMessage(request.message()));

        // Wait for the agent's response and return it
        return outputChannel.waitForResponse(30, TimeUnit.SECONDS);
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

    @PostMapping("/ingest")
    public String ingestData() {
        var dataPath = Path.of("./data");
        int count = 0;
        try (var stream = java.nio.file.Files.list(dataPath)) {
            var files = stream.filter(java.nio.file.Files::isRegularFile).toList();
            for (Path file : files) {
                var fileUri = file.toAbsolutePath().toUri().toString();
                var ingested = NeverRefreshExistingDocumentContentPolicy.INSTANCE.ingestUriIfNeeded(
                        searchOperations,
                        new TikaHierarchicalContentReader(),
                        fileUri
                );
                if (ingested != null) {
                    count++;
                }
            }
        } catch (java.io.IOException e) {
            logger.error("Error reading data directory", e);
            return "Error reading data directory: " + e.getMessage();
        }

        return "Successfully ingested " + count + " files";
    }
}
