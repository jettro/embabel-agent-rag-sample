package dev.jettro.knowledge.security;

import com.embabel.agent.api.identity.User;
import com.embabel.agent.rag.model.NamedEntity;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class KnowledgeUser implements User, NamedEntity {

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

    @NotNull
    public String getCurrentContext() {
        return "%s_default_context".formatted(this.getId());
    }

    public void setProcessId(String processId) {
        this.processId = processId;
    }

    // TODO check if this is correct in the example user
    @Override
    public @NotNull String getName() {
        return this.getDisplayName();
    }

    @Override
    public @NotNull String getDescription() {
        return "Description for " + this.getName();
    }
}
