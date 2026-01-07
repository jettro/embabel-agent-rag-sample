package dev.jettro.knowledge;

import com.embabel.agent.api.channel.*;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class ControllerOutputChannel implements OutputChannel {
    private static final Logger logger = LoggerFactory.getLogger(ControllerOutputChannel.class);

    private CompletableFuture<String> futureResponse = new CompletableFuture<>();

    @Override
    public void send(@NotNull OutputChannelEvent event) {
        switch (event) {
            case MessageOutputChannelEvent messageOutputChannelEvent -> {
                String content = messageOutputChannelEvent.getMessage().getContent();
                logger.info("Response MessageOutputChannelEvent: {}", content);
                futureResponse.complete(content);
            }
            case ContentOutputChannelEvent contentOutputChannelEvent ->
                    logger.info("Response ContentOutputChannelEvent: {}", contentOutputChannelEvent.getContent());
            case ProgressOutputChannelEvent progressOutputChannelEvent ->
                    logger.info("Response ProgressOutputChannelEvent: {}", progressOutputChannelEvent.getMessage());
            case LoggingOutputChannelEvent loggingOutputChannelEvent ->
                    logger.info("Response LoggingOutputChannelEvent: {}", loggingOutputChannelEvent.getMessage());
            default -> logger.info("Response UnknownOutputChannelEvent: {}", event.getClass().getSimpleName());
        }

    }

    public String waitForResponse(int timeout, TimeUnit timeUnit) {
        try {
            logger.info("Waiting for chatbot response...");
            String result = futureResponse.get(timeout, timeUnit);
            // Reset for the next message if the session is reused
            futureResponse = new CompletableFuture<>();
            logger.info("Chatbot response received: {}", result.substring(0, Math.min(result.length(), 50)));
            return result;
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            logger.error("Error waiting for chatbot response", e);
            // Reset on error so a stuck future doesn't block future attempts
            futureResponse = new CompletableFuture<>();
            return "Error: " + e.getMessage();
        }
    }
}
