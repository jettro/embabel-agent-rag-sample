package dev.jettro.knowledge.chat;

import com.embabel.agent.api.channel.*;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

/**
 * Implementation of {@link OutputChannel} that uses Spring's {@link SseEmitter} for Server-Sent Events (SSE).
 * <p>
 * When an emitter is set, it sends a {@code "Connected"} event indicating that the channel is ready
 * to receive events. On reconnecting a client, the OutputChannel can receive a new emitter.
 * </p>
 * <p>
 * Individual {@link OutputChannelEvent} instances are sent sequentially to the client.
 * </p>
 */
public class SseEmitterOutputChannel implements OutputChannel {
    private static final Logger logger = LoggerFactory.getLogger(SseEmitterOutputChannel.class);

    private SseEmitter emitter;

    /**
     * Sets the SSE emitter to use for sending events. The output channel can receive new  emitters.
     *
     * @param emitter The active Sse emitter for sending the events.
     */
    public void setEmitter(SseEmitter emitter, String processId) {
        logger.info("Setting emitter for process: {}", processId);
        this.emitter = emitter;

        // Create the connected event to send to the client
        var sseEvent = SseEmitter.event()
                .id(processId)
                .name("Connected")
                .data(new SseEmitterOutputChannel.ConnectedOutputChannelEvent(processId))
                .build();

        // Send the connected event to the client to let it know that the channel is ready
        try {
            emitter.send(sseEvent);
        } catch (IOException e) {
            throw new OutputChannelRuntimeException("Problem sending the sse stream connected event.", e);
        }
    }

    @Override
    public void send(@NotNull OutputChannelEvent event) {

        if (emitter == null) {
            logger.warn("No emitter set, dropping event: {}", event);
            return;
        }

        // Create the event to send to the client
        var sseEvent = SseEmitter.event()
                .id(event.getProcessId())
                .name(event.getClass().getSimpleName())
                .data(event)
                .build();

        // Send the event to the client
        try {
            emitter.send(sseEvent);
        } catch (IOException e) {
            logger.error("Error sending event to client for processId: {}", event.getProcessId(), e);
            throw new OutputChannelRuntimeException("Error sending event to client", e);
        }
    }

    /**
     * Event for notifying the client that the OutputChannel is ready to receive events.
     */
    public static class ConnectedOutputChannelEvent implements OutputChannelEvent {

        private final String processId;
        private final String message;

        public ConnectedOutputChannelEvent(String processId) {
            this.processId = processId;
            this.message = "Connected OutputChannel SSE Emitter";
        }

        @NotNull
        @Override
        public String getProcessId() {
            return this.processId;
        }

        @NotNull
        public String getMessage() {
            return this.message;
        }
    }
}
