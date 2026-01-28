import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import type { Proposition, PropositionDto } from '../api';

interface PropositionCardProps {
  proposition: Proposition | PropositionDto;
  showMetadata?: boolean;
  showDeleteButton?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function PropositionCard({
  proposition,
  showMetadata = true,
  showDeleteButton = false,
  onDelete,
  isDeleting = false,
}: PropositionCardProps) {
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

  return (
    <Box
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
          <VStack align="stretch" gap={2}>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              Mentions:
            </Text>
            <HStack gap={3} wrap="wrap" pl={2}>
              {proposition.mentions.map((mention, idx) => (
                <Box key={idx}>
                  <HStack gap={2}>
                    <Badge colorPalette="cyan" size="sm">
                      {mention.role}
                    </Badge>
                    <Text fontSize="sm" fontWeight="medium">
                      {mention.name}
                    </Text>
                    <Badge colorPalette="gray" size="sm" variant="subtle">
                      {mention.type}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      ({mention.resolvedId})
                    </Text>
                  </HStack>
                </Box>
              ))}
            </HStack>
          </VStack>
        )}

        {/* Reasoning */}
        {proposition.reasoning && (
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
            <Text as="span" fontWeight="semibold">Reasoning:</Text> {proposition.reasoning}
          </Text>
        )}

        {/* Footer metadata */}
        {showMetadata && (
          <HStack justify="space-between" fontSize="xs" color="gray.500" pt={2}>
            <HStack gap={4}>
              <Text>ID: {proposition.id.substring(0, 8)}...</Text>
              <Text>Context: {proposition.contextId}</Text>
            </HStack>
            <HStack gap={4}>
              <Text>Created: {formatDate(proposition.created)}</Text>
              <Text>Decay: {proposition.decay.toFixed(2)}</Text>
              {showDeleteButton && onDelete && (
                <IconButton
                  aria-label="Delete proposition"
                  size="xs"
                  colorPalette="red"
                  variant="ghost"
                  onClick={() => onDelete(proposition.id)}
                  loading={isDeleting}
                >
                  <FiTrash2 />
                </IconButton>
              )}
            </HStack>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
