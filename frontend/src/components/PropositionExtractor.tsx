import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Badge,
  Separator,
} from '@chakra-ui/react';
import { useState } from 'react';
import { extractPropositions, type ExtractResponse } from '../api';
import { PropositionCard } from './PropositionCard';

interface PropositionExtractorProps {
  contextId: string;
}

export function PropositionExtractor({ contextId }: PropositionExtractorProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await extractPropositions(contextId, text);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract propositions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack gap={0} align="stretch" h="full">
      {/* Header */}
      <Box px={6} py={4} borderBottomWidth="1px">
        <VStack align="stretch" gap={2}>
          <Text fontSize="xl" fontWeight="bold">
            Test Extraction Pipeline
          </Text>
          <Text fontSize="xs" color="gray.500">
            Context ID: {contextId}
          </Text>
        </VStack>
      </Box>

      {/* Input Area */}
      <Box flex={1} overflowY="auto" px={6} py={4}>
        <VStack gap={4} align="stretch">
          {/* Text Input */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Enter text to extract propositions:
            </Text>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to analyze for proposition extraction..."
              minH="150px"
              size="lg"
            />
          </Box>

          {/* Extract Button */}
          <Button
            colorPalette="blue"
            size="lg"
            onClick={handleExtract}
            loading={isLoading}
            disabled={!text.trim()}
          >
            Extract Propositions
          </Button>

          {/* Error Display */}
          {error && (
            <Box p={4} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md" borderWidth="1px" borderColor="red.200">
              <Text color="red.600" _dark={{ color: 'red.200' }}>
                Error: {error}
              </Text>
            </Box>
          )}

          {/* Results Display */}
          {result && (
            <VStack gap={4} align="stretch">
              <Separator />
              
              {/* Summary */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Extraction Results
                </Text>
                <HStack gap={4} wrap="wrap">
                  <Badge colorPalette="blue" size="lg">
                    {result.propositions.length} Propositions
                  </Badge>
                  {result.entities.created.length > 0 && (
                    <Badge colorPalette="green" size="lg">
                      {result.entities.created.length} Entities Created
                    </Badge>
                  )}
                  {result.entities.resolved.length > 0 && (
                    <Badge colorPalette="purple" size="lg">
                      {result.entities.resolved.length} Entities Resolved
                    </Badge>
                  )}
                  {result.entities.failed.length > 0 && (
                    <Badge colorPalette="red" size="lg">
                      {result.entities.failed.length} Entities Failed
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Chunk ID: {result.chunkId}
                </Text>
              </Box>

              {/* Propositions List */}
              {result.propositions.length > 0 && (
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Extracted Propositions:
                  </Text>
                  <VStack gap={3} align="stretch">
                    {result.propositions.map((prop, index) => (
                      <PropositionCard
                        key={index}
                        proposition={prop}
                        showMetadata={true}
                        showDeleteButton={false}
                      />
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Revision Summary */}
              {result.revision && (
                <Box p={4} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md">
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Revision Summary:
                  </Text>
                  <HStack gap={4} wrap="wrap">
                    {result.revision.created > 0 && (
                      <Badge colorPalette="green" size="sm">{result.revision.created} created</Badge>
                    )}
                    {result.revision.merged > 0 && (
                      <Badge colorPalette="blue" size="sm">{result.revision.merged} merged</Badge>
                    )}
                    {result.revision.reinforced > 0 && (
                      <Badge colorPalette="purple" size="sm">{result.revision.reinforced} reinforced</Badge>
                    )}
                    {result.revision.contradicted > 0 && (
                      <Badge colorPalette="red" size="sm">{result.revision.contradicted} contradicted</Badge>
                    )}
                    {result.revision.generalized > 0 && (
                      <Badge colorPalette="orange" size="sm">{result.revision.generalized} generalized</Badge>
                    )}
                  </HStack>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}
