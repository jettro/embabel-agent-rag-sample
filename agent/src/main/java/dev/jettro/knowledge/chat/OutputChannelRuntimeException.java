package dev.jettro.knowledge.chat;

public class OutputChannelRuntimeException extends RuntimeException {
    public OutputChannelRuntimeException(String message) {
        super(message);
    }

    public OutputChannelRuntimeException(String message, Throwable cause) {
        super(message, cause);
    }
}
