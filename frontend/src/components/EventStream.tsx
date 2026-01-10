import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
} from '@chakra-ui/react';
import { useSSE } from '../hooks/useSSE';
import { useEffect, useRef } from 'react';

interface EventStreamProps {
  processId: string | null;
}

export function EventStream({ processId }: EventStreamProps) {
  const { events, isConnected, error } = useSSE(processId);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  if (!processId) {
    return null;
  }

  return (
    <Box
      w="350px"
      bg="gray.50"
      _dark={{ bg: 'gray.800' }}
      borderLeftWidth="1px"
      h="full"
      display="flex"
      flexDirection="column"
    >
      <Box p={4} borderBottomWidth="1px">
        <HStack justify="space-between" mb={2}>
          <Heading size="sm">Agent Events</Heading>
          <Badge colorPalette={isConnected ? 'green' : 'gray'} size="sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </HStack>
        <Text fontSize="xs" color="gray.500">
          Process: {processId.substring(0, 8)}...
        </Text>
      </Box>

      <Box flex={1} overflowY="auto" p={3}>
        {error && (
          <Box
            p={3}
            mb={2}
            bg="red.50"
            _dark={{ bg: 'red.900' }}
            borderRadius="md"
            borderLeftWidth="3px"
            borderLeftColor="red.500"
          >
            <Text fontSize="sm" color="red.700" _dark={{ color: 'red.200' }}>
              {error}
            </Text>
          </Box>
        )}

        {events.length === 0 && !error && (
          <Text fontSize="sm" color="gray.400" textAlign="center" mt={4}>
            Waiting for events...
          </Text>
        )}

        <VStack gap={2} align="stretch">
          {events.map((event, index) => (
            <Box
              key={index}
              p={3}
              bg="white"
              _dark={{ bg: 'gray.700' }}
              borderRadius="md"
              borderWidth="1px"
              fontSize="xs"
            >
              <HStack justify="space-between" mb={2}>
                <Badge colorPalette="blue" size="sm">
                  {event.eventType}
                </Badge>
                <Text fontSize="2xs" color="gray.500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </Text>
              </HStack>
              <Box
                as="pre"
                fontSize="2xs"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                color="gray.700"
                _dark={{ color: 'gray.300' }}
              >
                {JSON.stringify(event, null, 2)}
              </Box>
            </Box>
          ))}
          <div ref={eventsEndRef} />
        </VStack>
      </Box>
    </Box>
  );
}
