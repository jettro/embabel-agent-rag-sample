package dev.jettro.knowledge;

public class OutputChannelRuntimeException extends RuntimeException {
    public OutputChannelRuntimeException(String message) {
        super(message);
    }

    public OutputChannelRuntimeException(String message, Throwable cause) {
        super(message, cause);
    }
}
