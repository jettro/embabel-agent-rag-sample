package dev.jettro.knowledge.model;

public enum Roles {
    CHEAPEST,
    STANDARD,
    BEST;

    @Override
    public String toString() {
        return name().toLowerCase();
    }
}
