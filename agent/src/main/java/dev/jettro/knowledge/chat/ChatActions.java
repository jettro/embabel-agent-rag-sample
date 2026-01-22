package dev.jettro.knowledge.chat;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.EmbabelComponent;
import com.embabel.agent.api.common.ActionContext;
import com.embabel.agent.api.common.OperationContext;
import com.embabel.agent.rag.service.SearchOperations;
import com.embabel.agent.rag.tools.ToolishRag;
import com.embabel.chat.Conversation;
import com.embabel.chat.UserMessage;
import dev.jettro.knowledge.security.CustomUserDetails;
import dev.jettro.knowledge.security.KnowledgeUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;

import static dev.jettro.knowledge.chat.model.Roles.CHEAPEST;

@EmbabelComponent
public class ChatActions {
    private static final Logger logger = LoggerFactory.getLogger(ChatActions.class);

    private final ToolishRag toolishRag;
    private final ApplicationEventPublisher eventPublisher;

    public ChatActions(@Qualifier("luceneSearchOperations") SearchOperations searchOperations, ApplicationEventPublisher eventPublisher) {
        this.toolishRag = new ToolishRag(
                "sources",
                "sources for answering user questions",
                searchOperations);
        this.eventPublisher = eventPublisher;
    }

    @Action
    public KnowledgeUser bindUser(OperationContext context) {
        var forUser = context.getProcessContext().getProcessOptions().getIdentities().getForUser();
        if (forUser instanceof KnowledgeUser iu) {
            return iu;
        } else {
            logger.warn("bindUser: forUser is not an ImpromptuUser: {}", forUser);
            return null;
        }
    }


    @Action(canRerun = true, trigger = UserMessage.class)
    public void respond(Conversation conversation, KnowledgeUser user, ActionContext context) {
        var lastUserMessage = conversation.lastMessageIfBeFromUser();

        if (lastUserMessage != null) {
            logger.info("Received user message as last message: {}", lastUserMessage.getContent());
            var assistantMessage = context.ai()
                    .withLlmByRole(CHEAPEST.name())
                    .withReferences(toolishRag)
                    .withSystemPrompt("You are a helpful assistant. Answer questions concisely. Always address the current user by their name: " + user.getDisplayName() + ".")
                    .respond(conversation.getMessages());
            context.sendMessage(conversation.addMessage(assistantMessage));

            eventPublisher.publishEvent(new ConversationAnalysisRequestEvent(this, user, conversation));
        } else {
            logger.info("Received non-user message");
        }
    }
}
