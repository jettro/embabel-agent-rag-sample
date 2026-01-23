import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getPropositions, type Proposition } from '../api';

export function PropositionList() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPropositions();
  }, []);

  const loadPropositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPropositions();
      setPropositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load propositions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'gray';
      case 'DEPRECATED':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Center h="full">
        <VStack gap={4}>
          <Spinner size="lg" colorPalette="blue" />
          <Text fontSize="lg" color="gray.400">
            Loading propositions...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="full">
        <VStack gap={4}>
          <Text fontSize="lg" color="red.500">
            Error: {error}
          </Text>
        </VStack>
      </Center>
    );
  }

  if (propositions.length === 0) {
    return (
      <Center h="full">
        <Text fontSize="lg" color="gray.400">
          No propositions found
        </Text>
      </Center>
    );
  }

  return (
    <VStack gap={0} align="stretch" h="full">
      {/* Header */}
      <Box px={6} py={4} borderBottomWidth="1px">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            Propositions ({propositions.length})
          </Text>
        </HStack>
      </Box>

      {/* List */}
      <Box flex={1} overflowY="auto" px={6} py={4}>
        <VStack gap={3} align="stretch">
          {propositions.map((proposition) => (
            <Box
              key={proposition.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
            >
              <VStack align="stretch" gap={2}>
                {/* Header row */}
                <HStack justify="space-between" wrap="wrap" gap={2}>
                  <Badge colorPalette={getStatusColor(proposition.status)} size="sm">
                    {proposition.status}
                  </Badge>
                  <HStack gap={2}>
                    <Badge colorPalette="blue" size="sm">
                      Level {proposition.level}
                    </Badge>
                    <Badge colorPalette="purple" size="sm">
                      Confidence: {(proposition.confidence * 100).toFixed(0)}%
                    </Badge>
                  </HStack>
                </HStack>

                {/* Main text */}
                <Text fontSize="md" fontWeight="medium">
                  {proposition.text}
                </Text>

                {/* Mentions */}
                {proposition.mentions.length > 0 && (
                  <HStack gap={2} wrap="wrap">
                    <Text fontSize="xs" color="gray.500">
                      Mentions:
                    </Text>
                    {proposition.mentions.map((mention, idx) => (
                      <Badge key={idx} colorPalette="cyan" size="sm">
                        {mention.role}: {mention.entityId}
                      </Badge>
                    ))}
                  </HStack>
                )}

                {/* Reasoning */}
                {proposition.reasoning && (
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    <Text as="span" fontWeight="semibold">Reasoning:</Text> {proposition.reasoning}
                  </Text>
                )}

                {/* Footer metadata */}
                <HStack justify="space-between" fontSize="xs" color="gray.500" pt={2}>
                  <HStack gap={4}>
                    <Text>ID: {proposition.id.substring(0, 8)}...</Text>
                    <Text>Context: {proposition.contextId}</Text>
                  </HStack>
                  <HStack gap={4}>
                    <Text>Created: {formatDate(proposition.created)}</Text>
                    {proposition.grounding.length > 0 && (
                      <Text>Grounding: {proposition.grounding.length}</Text>
                    )}
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}
