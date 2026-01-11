package dev.jettro.knowledge;

import com.embabel.agent.api.channel.*;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

public class ControllerOutputChannel implements OutputChannel {
    private static final Logger logger = LoggerFactory.getLogger(ControllerOutputChannel.class);

    private SseEmitter emitter;

    public void setEmitter(SseEmitter emitter) {
        logger.info("Setting emitter: {}", emitter);

        this.emitter = emitter;

        SseEmitter.SseEventBuilder builder = SseEmitter.event();
        var sseEvent = builder
                .id("unknown")
                .name("Connected")
                .data("{\"message\": \"Connected\"}")
                .build();

        try {
            emitter.send(sseEvent);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void send(@NotNull OutputChannelEvent event) {

        if (emitter == null) {
            logger.warn("No emitter set, dropping event: {}", event);
            return;
        }

        SseEmitter.SseEventBuilder builder = SseEmitter.event();
        var sseEvent = builder
                .id(event.getProcessId())
                .name(event.getClass().getSimpleName())
                .data(event)
                .build();

        try {
            emitter.send(sseEvent);
        } catch (IOException e) {
            logger.error("Error sending event to client", e);
        }
    }
}
