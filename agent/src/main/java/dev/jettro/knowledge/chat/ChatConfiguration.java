package dev.jettro.knowledge.chat;

import com.embabel.agent.core.AgentPlatform;
import com.embabel.agent.core.Verbosity;
import com.embabel.agent.rag.ingestion.ContentChunker;
import com.embabel.agent.rag.ingestion.InMemoryContentChunker;
import com.embabel.agent.rag.ingestion.transform.AddTitlesChunkTransformer;
import com.embabel.agent.rag.lucene.LuceneSearchOperations;
import com.embabel.chat.Chatbot;
import com.embabel.chat.agent.AgentProcessChatbot;
import com.embabel.common.ai.model.DefaultModelSelectionCriteria;
import com.embabel.common.ai.model.ModelProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.kotlin.KotlinModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.nio.file.Path;

@Configuration
public class ChatConfiguration {

    @Bean
    Chatbot chatbot(AgentPlatform agentPlatform) {
        return AgentProcessChatbot.utilityFromPlatform(agentPlatform, new Verbosity().showPrompts());
    }

    @Bean
    LuceneSearchOperations luceneSearchOperations(ModelProvider modelProvider) {
        return LuceneSearchOperations
                .withName("sources")
                .withEmbeddingService(modelProvider.getEmbeddingService(DefaultModelSelectionCriteria.INSTANCE))
                .withChunkerConfig(new ContentChunker.Config(800,100, 100))
                .withChunkTransformer(AddTitlesChunkTransformer.INSTANCE)
                .withIndexPath(Path.of("./.lucene-index"))
                .buildAndLoadChunks();
    }
}
