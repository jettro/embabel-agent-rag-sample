package dev.jettro.knowledge;

import com.embabel.agent.core.AgentPlatform;
import com.embabel.agent.core.Verbosity;
import com.embabel.agent.rag.ingestion.ContentChunker;
import com.embabel.agent.rag.lucene.LuceneSearchOperations;
import com.embabel.chat.Chatbot;
import com.embabel.chat.agent.AgentProcessChatbot;
import com.embabel.common.ai.model.DefaultModelSelectionCriteria;
import com.embabel.common.ai.model.ModelProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;

@Configuration
public class ChatConfiguration {

    @Bean
    Chatbot chatbot(AgentPlatform agentPlatform) {
        return AgentProcessChatbot.utilityFromPlatform(agentPlatform, new Verbosity().showPrompts());
    }

    @Bean
    LuceneSearchOperations luceneSearchOperations(ModelProvider modelProvider) {
        var embeddingService = modelProvider.getEmbeddingService(DefaultModelSelectionCriteria.INSTANCE);
        return LuceneSearchOperations
                .withName("sources")
                .withEmbeddingService(embeddingService)
                .withChunkerConfig(new ContentChunker.DefaultConfig(800,100, false))
                .withIndexPath(Path.of("./.lucene-index"))
                .buildAndLoadChunks();
    }
}
