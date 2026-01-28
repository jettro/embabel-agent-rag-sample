import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getPropositions, deleteProposition, type Proposition } from '../api';
import { PropositionCard } from './PropositionCard';

interface PropositionListProps {
  contextId: string;
}

export function PropositionList({ contextId }: PropositionListProps) {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPropositions();
  }, [contextId]);

  const loadPropositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPropositions(contextId);
      setPropositions(data.propositions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load propositions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propositionId: string) => {
    if (!contextId) return;
    if (!confirm('Are you sure you want to delete this proposition?')) return;

    setDeletingIds(prev => new Set(prev).add(propositionId));
    try {
      await deleteProposition(contextId, propositionId);
      setPropositions(prev => prev.filter(p => p.id !== propositionId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete proposition');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(propositionId);
        return next;
      });
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

  return (
    <VStack gap={0} align="stretch" h="full">
      {/* Header */}
      <Box px={6} py={4} borderBottomWidth="1px">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            Propositions ({propositions.length})
          </Text>
          <IconButton
            aria-label="Refresh propositions"
            size="sm"
            variant="ghost"
            onClick={() => loadPropositions()}
            loading={isLoading}
          >
            <FiRefreshCw />
          </IconButton>
        </HStack>
      </Box>

      {/* List */}
      {propositions.length === 0 ? (
        <Center flex={1}>
          <Text fontSize="lg" color="gray.400">
            No propositions found
          </Text>
        </Center>
      ) : (
      <Box flex={1} overflowY="auto" px={6} py={4}>
        <VStack gap={3} align="stretch">
          {propositions.map((proposition) => (
            <PropositionCard
              key={proposition.id}
              proposition={proposition}
              showMetadata={true}
              showDeleteButton={true}
              onDelete={handleDelete}
              isDeleting={deletingIds.has(proposition.id)}
            />
          ))}
        </VStack>
      </Box>
      )}
    </VStack>
  );
}
