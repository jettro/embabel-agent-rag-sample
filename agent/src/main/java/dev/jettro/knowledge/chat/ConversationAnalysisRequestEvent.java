package dev.jettro.knowledge.chat;

import com.embabel.chat.Conversation;
import dev.jettro.knowledge.security.KnowledgeUser;
import org.springframework.context.ApplicationEvent;

/**
 * Event published after a conversation exchange (user message + assistant response).
 * Used to trigger async proposition extraction.
 */
public class ConversationAnalysisRequestEvent extends ApplicationEvent {

    public final KnowledgeUser user;
    public final Conversation conversation;

    public ConversationAnalysisRequestEvent(
            Object source,
            KnowledgeUser user,
            Conversation conversation) {
        super(source);
        this.user = user;
        this.conversation = conversation;
    }
}