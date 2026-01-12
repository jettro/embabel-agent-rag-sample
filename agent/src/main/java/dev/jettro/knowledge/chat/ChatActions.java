package dev.jettro.knowledge.chat;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.EmbabelComponent;
import com.embabel.agent.api.common.ActionContext;
import com.embabel.agent.rag.service.SearchOperations;
import com.embabel.agent.rag.tools.ToolishRag;
import com.embabel.chat.Conversation;
import com.embabel.chat.UserMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static dev.jettro.knowledge.chat.model.Roles.CHEAPEST;

@EmbabelComponent
public class ChatActions {
    private static final Logger logger = LoggerFactory.getLogger(ChatActions.class);

    private final ToolishRag toolishRag;

    public ChatActions(SearchOperations searchOperations) {
        this.toolishRag = new ToolishRag(
                "sources",
                "sources for answering user questions",
                searchOperations);
    }


    @Action(canRerun = true, trigger = UserMessage.class)
    public void respond(Conversation conversation, ActionContext context) {
        var lastUserMessage = conversation.lastMessageIfBeFromUser();

        if (lastUserMessage != null) {
            logger.info("Received user message as last message: {}", lastUserMessage.getContent());
            var assistantMessage = context.ai()
                    .withLlmByRole(CHEAPEST.name())
                    .withReferences(toolishRag)
                    .withSystemPrompt("You are a helpful assistant. Answer questions concisely.")
                    .respond(conversation.getMessages());
            context.sendMessage(conversation.addMessage(assistantMessage));
        } else {
            logger.info("Received non-user message");
        }
    }
}
