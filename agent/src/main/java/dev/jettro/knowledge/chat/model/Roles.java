package dev.jettro.knowledge.chat.model;

public enum Roles {
    CHEAPEST,
    STANDARD,
    BEST;

    @Override
    public String toString() {
        return name().toLowerCase();
    }
}
