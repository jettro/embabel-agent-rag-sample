import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Badge,
  Spinner,
  Center,
  Separator,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { extractPropositions, getContextId, type ExtractResponse } from '../api';

export function PropositionExtractor() {
  const [text, setText] = useState('');
  const [contextId, setContextId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContextId();
  }, []);

  const loadContextId = async () => {
    setIsLoadingContext(true);
    try {
      const id = await getContextId();
      setContextId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load context ID');
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleExtract = async () => {
    if (!text.trim() || !contextId) return;

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

  if (isLoadingContext) {
    return (
      <Center h="full">
        <VStack gap={4}>
          <Spinner size="lg" colorPalette="blue" />
          <Text fontSize="lg" color="gray.400">
            Loading context...
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack gap={0} align="stretch" h="full">
      {/* Header */}
      <Box px={6} py={4} borderBottomWidth="1px">
        <VStack align="stretch" gap={2}>
          <Text fontSize="xl" fontWeight="bold">
            Test Extraction Pipeline
          </Text>
          {contextId && (
            <Text fontSize="xs" color="gray.500">
              Context ID: {contextId}
            </Text>
          )}
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
            disabled={!text.trim() || !contextId}
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
                  <Badge colorPalette="green" size="lg">
                    {result.entities.created} Entities Created
                  </Badge>
                  {result.entities.updated > 0 && (
                    <Badge colorPalette="orange" size="lg">
                      {result.entities.updated} Entities Updated
                    </Badge>
                  )}
                  {result.entities.linked > 0 && (
                    <Badge colorPalette="purple" size="lg">
                      {result.entities.linked} Entities Linked
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
                      <Box
                        key={index}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        bg="gray.50"
                        _dark={{ bg: 'gray.800' }}
                      >
                        <VStack align="stretch" gap={2}>
                          {/* Proposition header */}
                          <HStack justify="space-between" wrap="wrap" gap={2}>
                            <Badge colorPalette="green" size="sm">
                              {prop.status}
                            </Badge>
                            <HStack gap={2}>
                              <Badge colorPalette="blue" size="sm">
                                Level {prop.level}
                              </Badge>
                              <Badge colorPalette="purple" size="sm">
                                {(prop.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            </HStack>
                          </HStack>

                          {/* Proposition text */}
                          <Text fontSize="md" fontWeight="medium">
                            {prop.text}
                          </Text>

                          {/* Mentions */}
                          {prop.mentions.length > 0 && (
                            <HStack gap={2} wrap="wrap">
                              <Text fontSize="xs" color="gray.500">
                                Mentions:
                              </Text>
                              {prop.mentions.map((mention, idx) => (
                                <Badge key={idx} colorPalette="cyan" size="sm">
                                  {mention.role}: {mention.entityId}
                                </Badge>
                              ))}
                            </HStack>
                          )}

                          {/* Reasoning */}
                          {prop.reasoning && (
                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                              <Text as="span" fontWeight="semibold">Reasoning:</Text> {prop.reasoning}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Revision Summary */}
              {result.revision && (result.revision.updated > 0 || result.revision.deprecated > 0) && (
                <Box p={4} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md">
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Revision Summary:
                  </Text>
                  <HStack gap={4}>
                    {result.revision.updated > 0 && (
                      <Text fontSize="sm">
                        {result.revision.updated} updated
                      </Text>
                    )}
                    {result.revision.deprecated > 0 && (
                      <Text fontSize="sm">
                        {result.revision.deprecated} deprecated
                      </Text>
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
