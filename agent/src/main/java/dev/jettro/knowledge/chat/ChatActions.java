package dev.jettro.knowledge.chat;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.EmbabelComponent;
import com.embabel.agent.api.common.ActionContext;
import com.embabel.agent.api.common.OperationContext;
import com.embabel.agent.api.tool.Tool;
import com.embabel.agent.rag.service.SearchOperations;
import com.embabel.agent.rag.tools.ToolishRag;
import com.embabel.chat.Conversation;
import com.embabel.chat.UserMessage;
import com.embabel.dice.agent.Memory;
import com.embabel.dice.projection.memory.MemoryProjector;
import com.embabel.dice.proposition.PropositionRepository;
import dev.jettro.knowledge.security.KnowledgeUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;

import java.util.LinkedList;

import static dev.jettro.knowledge.chat.model.Roles.CHEAPEST;

@EmbabelComponent
public class ChatActions {
    private static final Logger logger = LoggerFactory.getLogger(ChatActions.class);

    private final ToolishRag toolishRag;
    private final ApplicationEventPublisher eventPublisher;
    private final PropositionRepository propositionRepository;
    private final MemoryProjector memoryProjector;

    public ChatActions(@Qualifier("luceneSearchOperations") SearchOperations searchOperations,
                       ApplicationEventPublisher eventPublisher,
                       PropositionRepository propositionRepository,
                       MemoryProjector memoryProjector) {
        this.toolishRag = new ToolishRag(
                "sources",
                "sources for answering user questions",
                searchOperations);
        this.eventPublisher = eventPublisher;
        this.propositionRepository = propositionRepository;
        this.memoryProjector = memoryProjector;
    }

    @Action
    public KnowledgeUser bindUser(OperationContext context) {
        var forUser = context.getProcessContext().getProcessOptions().getIdentities().getForUser();
        if (forUser instanceof KnowledgeUser iu) {
            return iu;
        } else {
            logger.warn("bindUser: forUser is not an KnowledgeUser: {}", forUser);
            return null;
        }
    }


    @Action(canRerun = true, trigger = UserMessage.class)
    public void respond(Conversation conversation, KnowledgeUser user, ActionContext context) {
        var lastUserMessage = conversation.lastMessageIfBeFromUser();

        if (lastUserMessage != null) {
            var memory = Memory.forContext(user.getCurrentContext())
                    .withRepository(propositionRepository)
                    .withProjector(memoryProjector);

            var tools = new LinkedList<Tool>();
            tools.add(memory);

            logger.info("Received user message as last message: {}", lastUserMessage.getContent());
            var assistantMessage = context.ai()
                    .withLlmByRole(CHEAPEST.name())
                    .withTools(tools)
                    .withReferences(toolishRag) // TODO check if this is still what we need to do in the docs
                    .withSystemPrompt("You are a helpful assistant. Answer questions concisely. Always address the current user by their name: " + user.getDisplayName() + ".")
                    .respond(conversation.getMessages());

            context.sendMessage(conversation.addMessage(assistantMessage));

            eventPublisher.publishEvent(new ConversationAnalysisRequestEvent(this, user, conversation));
        } else {
            logger.info("Received non-user message");
        }
    }
}
