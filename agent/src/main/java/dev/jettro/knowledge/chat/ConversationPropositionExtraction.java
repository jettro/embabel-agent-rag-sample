package dev.jettro.knowledge.chat;

import com.embabel.agent.core.DataDictionary;
import com.embabel.chat.Message;
import com.embabel.dice.common.EntityResolver;
import com.embabel.dice.common.KnownEntity;
import com.embabel.dice.common.SourceAnalysisContext;
import com.embabel.dice.common.resolver.KnownEntityResolver;
import com.embabel.dice.incremental.*;
import com.embabel.dice.incremental.proposition.PropositionIncrementalAnalyzer;
import com.embabel.dice.pipeline.ChunkPropositionResult;
import com.embabel.dice.pipeline.PropositionPipeline;
import com.embabel.dice.proposition.ReferencesEntities;
import dev.jettro.knowledge.security.KnowledgeUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ConversationPropositionExtraction {
    private static final Logger logger = LoggerFactory.getLogger(ConversationPropositionExtraction.class);

    private final IncrementalAnalyzer<Message, ChunkPropositionResult> analyzer;
    private final EntityResolver entityResolver;
    private final DataDictionary dataDictionary;
    private final ChunkHistoryStore chunkHistoryStore;

    public ConversationPropositionExtraction(EntityResolver entityResolver,
                                             DataDictionary dataDictionary,
                                             PropositionPipeline propositionPipeline, ChunkHistoryStore chunkHistoryStore) {
        this.entityResolver = entityResolver;
        this.dataDictionary = dataDictionary;
        this.chunkHistoryStore = chunkHistoryStore;

        var config = new WindowConfig();

        this.analyzer = new PropositionIncrementalAnalyzer<>(
                propositionPipeline,
                this.chunkHistoryStore,
                MessageFormatter.INSTANCE,
                config
        );
    }

    /**
     * Async event listener for conversation exchanges.
     * Extracts propositions in a separate thread to avoid blocking chat responses.
     */
    @Async
    @EventListener
    public void onConversationExchange(ConversationAnalysisRequestEvent event) {
        extractPropositions(event);
    }

    /**
     * Extract propositions from a conversation.
     * The analyzer decides if there's enough new content to process.
     */
    public void extractPropositions(ConversationAnalysisRequestEvent event) {
        logger.info("Starting proposition extraction for conversation with {} messages",
                event.conversation.getMessages().size());

        try {
            var messages = event.conversation.getMessages();
            if (messages.size() < 2) {
                logger.info("Not enough messages to extract propositions, need at least 2");
                return;
            }

            var context = SourceAnalysisContext
                    .withContextId(event.user.getCurrentContext())
                    .withEntityResolver(entityResolverForUser(event.user))
                    .withSchema(dataDictionary) // TODO check Relations
                    .withKnownEntities(KnownEntity.asCurrentUser(event.user))
                    .withPromptVariables(Map.of(
                            "user", event.user
                    ));

            // Wrap conversation as incremental source and analyze
            var source = new ConversationSource(event.conversation);
            var result = analyzer.analyze(source, context);

            if (result == null) {
                logger.info("Analysis skipped (not ready or already processed)");
                return;
            }

            if (result.getPropositions().isEmpty()) {
                logger.info("Analysis completed but no propositions extracted");
                return;
            }
            var resolvedCount = result.getPropositions().stream()
                    .filter(ReferencesEntities::isFullyResolved)
                    .count();

            logger.info(result.infoString(true, 1));
        } catch (Exception e) {
            logger.error("Error extracting propositions, don't break the chat loop", e);
        }
    }

    private EntityResolver entityResolverForUser(KnowledgeUser user) {
        return KnownEntityResolver.withKnownEntities(
                List.of(KnownEntity.asCurrentUser(user)), entityResolver
        );
    }
}
