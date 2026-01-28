import { Box, HStack, Center, VStack, Text, Spinner } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { PropositionList } from './PropositionList';
import { PropositionExtractor } from './PropositionExtractor';
import { getContextId } from '../api';

export function PropositionsScreen() {
  const [contextId, setContextId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContextId();
  }, []);

  const loadContextId = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await getContextId();
      setContextId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load context ID');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Center flex={1}>
        <VStack gap={4}>
          <Spinner size="lg" colorPalette="blue" />
          <Text fontSize="lg" color="gray.400">
            Loading context...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error || !contextId) {
    return (
      <Center flex={1}>
        <Text fontSize="lg" color="red.500">
          Error: {error || 'Failed to load context'}
        </Text>
      </Center>
    );
  }

  return (
    <HStack gap={0} flex={1} align="stretch" overflow="hidden">
      <Box flex={1} h="full" overflow="hidden" borderRightWidth="1px">
        <PropositionList contextId={contextId} />
      </Box>
      <Box flex={1} h="full" overflow="hidden">
        <PropositionExtractor contextId={contextId} />
      </Box>
    </HStack>
  );
}
