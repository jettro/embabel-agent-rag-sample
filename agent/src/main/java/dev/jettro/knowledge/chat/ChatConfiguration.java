package dev.jettro.knowledge.chat;

import com.embabel.agent.api.common.AiBuilder;
import com.embabel.agent.core.AgentPlatform;
import com.embabel.agent.core.DataDictionary;
import com.embabel.agent.core.Verbosity;
import com.embabel.agent.rag.ingestion.ContentChunker;
import com.embabel.agent.rag.ingestion.InMemoryContentChunker;
import com.embabel.agent.rag.ingestion.transform.AddTitlesChunkTransformer;
import com.embabel.agent.rag.lucene.LuceneSearchOperations;
import com.embabel.chat.Chatbot;
import com.embabel.chat.agent.AgentProcessChatbot;
import com.embabel.common.ai.model.*;
import com.embabel.dice.common.EntityResolver;
import com.embabel.dice.common.SchemaAdherence;
import com.embabel.dice.common.SchemaRegistry;
import com.embabel.dice.common.resolver.InMemoryEntityResolver;
import com.embabel.dice.common.support.InMemorySchemaRegistry;
import com.embabel.dice.incremental.ChunkHistoryStore;
import com.embabel.dice.incremental.InMemoryChunkHistoryStore;
import com.embabel.dice.pipeline.PropositionPipeline;
import com.embabel.dice.proposition.PropositionExtractor;
import com.embabel.dice.proposition.PropositionRepository;
import com.embabel.dice.proposition.extraction.LlmPropositionExtractor;
import com.embabel.dice.proposition.revision.LlmPropositionReviser;
import com.embabel.dice.proposition.revision.PropositionReviser;
import com.embabel.dice.proposition.store.InMemoryPropositionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.kotlin.KotlinModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.nio.file.Path;

import static dev.jettro.knowledge.chat.model.Roles.FAST;
import static dev.jettro.knowledge.chat.model.Roles.STANDARD;

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
                .withEmbeddingService(modelProvider.getEmbeddingService(ByRoleModelSelectionCriteria.Companion.byRole(FAST.name())))
                .withChunkerConfig(new ContentChunker.Config(800,100, 100))
                .withChunkTransformer(AddTitlesChunkTransformer.INSTANCE)
                .withIndexPath(Path.of("./.lucene-index"))
                .buildAndLoadChunks();
    }

    @Bean
    PropositionRepository propositionRepository(ModelProvider modelProvider) {
        return new InMemoryPropositionRepository(modelProvider.getEmbeddingService(ByRoleModelSelectionCriteria.Companion.byRole(FAST.name())));
    }

    @Bean
    PropositionPipeline propositionPipeline(
            PropositionExtractor propositionExtractor, PropositionReviser propositionReviser, PropositionRepository propositionRepository) {
        return PropositionPipeline.withExtractor(propositionExtractor)
                .withRevision(propositionReviser, propositionRepository);
    }

    @Bean
    SchemaRegistry schemaRegistry(DataDictionary defaultSchema) {
        return new InMemorySchemaRegistry(defaultSchema);
    }

    @Bean
    PropositionReviser propositionReviser(
            AiBuilder aiBuilder) {
        var ai = aiBuilder
                .withShowPrompts(true)
                .withShowLlmResponses(true)
                .ai();
        return LlmPropositionReviser
                .withLlm(LlmOptions.withLlmForRole(STANDARD.name()))
                .withAi(ai);
    }

    /**
     * LLM-based proposition extractor using the dice library.
     */
    @Bean
    LlmPropositionExtractor llmPropositionExtractor(
            AiBuilder aiBuilder,
            PropositionRepository propositionRepository) {
        var ai = aiBuilder
                .withShowPrompts(true)
                .withShowLlmResponses(true)
                .ai();
        return LlmPropositionExtractor
                .withLlm(LlmOptions.withLlmForRole(STANDARD.name()))
                .withAi(ai)
                .withPropositionRepository(propositionRepository)
                .withSchemaAdherence(SchemaAdherence.DEFAULT)
                .withTemplate("extract_user_propositions");
    }

    @Bean
    EntityResolver entityResolver() {
        return new InMemoryEntityResolver();
    }

    @Bean
    ChunkHistoryStore chunkHistoryStore() {
        return new InMemoryChunkHistoryStore();
    }
}
