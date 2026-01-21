package dev.jettro.knowledge.chat.model;

public enum Roles {
    CHEAPEST,
    STANDARD,
    BEST,
    FAST,
    ACCURATE;

    @Override
    public String toString() {
        return name().toLowerCase();
    }
}
