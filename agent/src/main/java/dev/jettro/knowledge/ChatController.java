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
import com.embabel.chat.support.console.ConsoleOutputChannel;
import dev.jettro.knowledge.model.Request;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@RestController
public class ChatController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ChatController.class);

    private final Chatbot chatbot;
    private final LuceneSearchOperations searchOperations;

    public ChatController(Chatbot chatbot, LuceneSearchOperations searchOperations) {
        this.chatbot = chatbot;
        this.searchOperations = searchOperations;
    }

    @PostMapping("/chat")
    public String chat(@RequestBody Request request, HttpSession session) {
        LOGGER.info("Received message: {}", request.message());

        CompletableFuture<String> futureResponse = new CompletableFuture<>();

        OutputChannel outputChannel = event -> {
            switch (event) {
                case MessageOutputChannelEvent messageOutputChannelEvent -> {
                    String content = messageOutputChannelEvent.getMessage().getContent();
                    LOGGER.info("Response MessageOutputChannelEvent: {}", content);
                    futureResponse.complete(content);
                }
                case ContentOutputChannelEvent contentOutputChannelEvent ->
                        LOGGER.info("Response ContentOutputChannelEvent: {}", contentOutputChannelEvent.getContent());
                case ProgressOutputChannelEvent progressOutputChannelEvent ->
                        LOGGER.info("Response ProgressOutputChannelEvent: {}", progressOutputChannelEvent.getMessage());
                case LoggingOutputChannelEvent loggingOutputChannelEvent ->
                        LOGGER.info("Response LoggingOutputChannelEvent: {}", loggingOutputChannelEvent.getMessage());
                default -> LOGGER.info("Response UnknownOutputChannelEvent: {}", event.getClass().getSimpleName());
            }
        };

        User user = (User) session.getAttribute("user");
        if (user == null) {
            user = new SimpleUser("default", "Default User", "default", "default@example.org");
        }
        ChatSession chatSession = chatbot.createSession(user, outputChannel, null);
        chatSession.onUserMessage(new UserMessage(request.message()));


        try {
            return futureResponse.get(30, TimeUnit.SECONDS);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            LOGGER.error("Error waiting for chatbot response", e);
            return "Error: " + e.getMessage();
        }
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
            LOGGER.error("Error reading data directory", e);
            return "Error reading data directory: " + e.getMessage();
        }

        return "Successfully ingested " + count + " files";
    }
}
