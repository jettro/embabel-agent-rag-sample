package dev.jettro.knowledge.ingest;

import com.embabel.agent.rag.ingestion.TikaHierarchicalContentReader;
import com.embabel.agent.rag.ingestion.policy.NeverRefreshExistingDocumentContentPolicy;
import com.embabel.agent.rag.lucene.LuceneSearchOperations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class IngestController {
    private static final Logger logger = LoggerFactory.getLogger(IngestController.class);

    private final LuceneSearchOperations searchOperations;

    public IngestController(LuceneSearchOperations searchOperations) {
        this.searchOperations = searchOperations;
    }

    @PostMapping("/ingest")
    public String ingestData() {
        var dataPath = Path.of("./data");
        int count = 0;
        try (var stream = Files.list(dataPath)) {
            var files = stream.filter(Files::isRegularFile).toList();
            for (Path file : files) {
                var fileUri = file.toAbsolutePath().toUri().toString();
                var ingested = NeverRefreshExistingDocumentContentPolicy.INSTANCE.ingestUriIfNeeded(
                        searchOperations,
                        new TikaHierarchicalContentReader(),
                        fileUri
                );
                if (ingested != null) {
                    count++;
                }
            }
        } catch (java.io.IOException e) {
            logger.error("Error reading data directory", e);
            return "Error reading data directory: " + e.getMessage();
        }

        return "Successfully ingested " + count + " files";
    }

}
