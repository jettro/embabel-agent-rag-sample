package dev.jettro.knowledge.chat;

import com.embabel.agent.api.common.AiBuilder;
import com.embabel.agent.core.AgentPlatform;
import com.embabel.agent.core.DataDictionary;
import com.embabel.agent.core.Verbosity;
import com.embabel.agent.rag.ingestion.ContentChunker;
import com.embabel.agent.rag.ingestion.transform.AddTitlesChunkTransformer;
import com.embabel.agent.rag.lucene.LuceneSearchOperations;
import com.embabel.agent.rag.service.NamedEntityDataRepository;
import com.embabel.agent.rag.service.support.InMemoryNamedEntityDataRepository;
import com.embabel.chat.Chatbot;
import com.embabel.chat.agent.AgentProcessChatbot;
import com.embabel.chat.support.InMemoryConversationFactory;
import com.embabel.common.ai.model.*;
import com.embabel.dice.common.EntityResolver;
import com.embabel.dice.common.SchemaAdherence;
import com.embabel.dice.common.SchemaRegistry;
import com.embabel.dice.common.resolver.InMemoryEntityResolver;
import com.embabel.dice.common.support.InMemorySchemaRegistry;
import com.embabel.dice.incremental.ChunkHistoryStore;
import com.embabel.dice.incremental.InMemoryChunkHistoryStore;
import com.embabel.dice.pipeline.PropositionPipeline;
import com.embabel.dice.projection.memory.MemoryProjector;
import com.embabel.dice.projection.memory.support.DefaultMemoryProjector;
import com.embabel.dice.proposition.PropositionExtractor;
import com.embabel.dice.proposition.PropositionRepository;
import com.embabel.dice.proposition.extraction.LlmPropositionExtractor;
import com.embabel.dice.proposition.revision.LlmPropositionReviser;
import com.embabel.dice.proposition.revision.PropositionReviser;
import com.embabel.dice.proposition.store.InMemoryPropositionRepository;
import dev.jettro.knowledge.proposition.Product;
import dev.jettro.knowledge.proposition.ProgrammingLanguage;
import dev.jettro.knowledge.security.KnowledgeUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.nio.file.Path;

import static dev.jettro.knowledge.chat.model.Roles.FAST;
import static dev.jettro.knowledge.chat.model.Roles.STANDARD;

@Configuration
public class ChatConfiguration {
    private static final Logger logger = LoggerFactory.getLogger(ChatConfiguration.class);


    @Bean
    Chatbot chatbot(AgentPlatform agentPlatform) {
        return AgentProcessChatbot.utilityFromPlatform(agentPlatform, new InMemoryConversationFactory(),
                new Verbosity().withShowPrompts(true));
    }

    @Bean
    LuceneSearchOperations luceneSearchOperations(ModelProvider modelProvider) {
        return LuceneSearchOperations
                .withName("sources")
                .withEmbeddingService(modelProvider.getEmbeddingService(ByRoleModelSelectionCriteria.Companion.byRole(FAST.name())))
                .withChunkerConfig(new ContentChunker.Config(800, 100, 100))
                .withChunkTransformer(AddTitlesChunkTransformer.INSTANCE)
                .withIndexPath(Path.of("./.lucene-index"))
                .buildAndLoadChunks();
    }

    @Bean
    PropositionRepository propositionRepository(ModelProvider modelProvider) {
        return new InMemoryPropositionRepository(
                modelProvider.getEmbeddingService(ByRoleModelSelectionCriteria.Companion.byRole(FAST.name()))
        );
    }

    @Bean
    PropositionPipeline propositionPipeline(
            PropositionExtractor propositionExtractor,
            PropositionReviser propositionReviser,
            PropositionRepository propositionRepository) {

        return PropositionPipeline.withExtractor(propositionExtractor)
                .withRevision(propositionReviser, propositionRepository);
    }

    @Bean
    @Primary
    DataDictionary blogDataDictionary() {
        var schema = DataDictionary.fromClasses("blog",
                Product.class,
                ProgrammingLanguage.class,
                KnowledgeUser.class
        );
        logger.info("Initialized data dictionary with classes: Product, ProgrammingLanguage");
        return schema;
    }

    @Bean
    SchemaRegistry schemaRegistry(DataDictionary blogDataDictionary) {
        var registry = new InMemorySchemaRegistry(blogDataDictionary);
        logger.info("Initialized schema registry with classes: Product, ProgrammingLanguage");
        return registry;
    }

    @Bean
    PropositionReviser propositionReviser(AiBuilder aiBuilder) {
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

    @Bean
    NamedEntityDataRepository namedEntityDataRepository(DataDictionary dataDictionary, ModelProvider modelProvider) {
        return new InMemoryNamedEntityDataRepository(
                dataDictionary,
                modelProvider.getEmbeddingService(ByRoleModelSelectionCriteria.Companion.byRole(FAST.name()))
        );
    }

    @Bean
    MemoryProjector memoryProjector() {
        return DefaultMemoryProjector.DEFAULT;
    }
}
