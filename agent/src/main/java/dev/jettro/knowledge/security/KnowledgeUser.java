package dev.jettro.knowledge.security;

import com.embabel.agent.api.identity.User;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class KnowledgeUser implements User {

    private final String id;
    private final String displayName;
    private final String username;
    private String email;
    private String processId;

    public KnowledgeUser(String id, String displayName, String username) {
        this.id = id;
        this.displayName = displayName;
        this.username = username;
    }

    @NotNull
    @Override
    public String getId() {
        return this.id;
    }

    @NotNull
    @Override
    public String getDisplayName() {
        return this.displayName;
    }

    @NotNull
    @Override
    public String getUsername() {
        return this.username;
    }

    @Nullable
    @Override
    public String getEmail() {
        return this.email;
    }

    @Nullable
    public String getProcessId() {
        return this.processId;
    }

    public void setProcessId(String processId) {
        this.processId = processId;
    }
}
