import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { useSSE } from '../hooks/useSSE';
import { useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { AgentProcessEvent } from '../types/events';
import { Dialog } from './ui/dialog';

interface EventStreamProps {
  conversationId: string | null;
}

export function EventStream({ conversationId }: EventStreamProps) {
  const { events, isConnected, error } = useSSE(conversationId);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<AgentProcessEvent | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const [showAllExpanded, setShowAllExpanded] = useState(false);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const shortEventType = (type: string) => {
    // strip after last .
    const stripped = type.split('.').slice(-1)[0];

    // trim to 20 characters
    return stripped.length > 20 ? stripped.slice(0, 20) + '...' : stripped;
  }

  const toggleEventExpansion = (index: number) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvents(newExpanded);
  };

  const toggleExpandAll = () => {
    if (showAllExpanded) {
      setExpandedEvents(new Set());
    } else {
      setExpandedEvents(new Set(events.map((_, i) => i)));
    }
    setShowAllExpanded(!showAllExpanded);
  };

  if (!conversationId) {
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
        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.500">
            Conversation: {conversationId.substring(0, 8)}...
          </Text>
          {events.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              onClick={toggleExpandAll}
            >
              {showAllExpanded ? <FiChevronUp /> : <FiChevronDown />}
              {showAllExpanded ? 'Collapse All' : 'Expand All'}
            </Button>
          )}
        </HStack>
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
          {events.map((event, index) => {
            const isExpanded = expandedEvents.has(index);
            const eventColor = "gray";
            
            return (
              <Box
                key={index}
                bg="white"
                _dark={{ bg: 'gray.700' }}
                borderRadius="md"
                borderWidth="1px"
                borderLeftWidth="4px"
                borderLeftColor={`${eventColor}.500`}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ shadow: 'md' }}
              >
                <HStack
                  p={3}
                  justify="space-between"
                  cursor="pointer"
                  onClick={() => toggleEventExpansion(index)}
                >
                  <HStack gap={2} flex={1}>
                    <Badge colorPalette={eventColor} size="sm">
                      {shortEventType(event.type) || 'Unknown Event'}
                    </Badge>
                    <Text fontSize="2xs" color="gray.500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </Text>
                  </HStack>
                  <HStack gap={1}>
                    <IconButton
                      aria-label="View details"
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      <FiMaximize2 />
                    </IconButton>
                    <IconButton
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      size="xs"
                      variant="ghost"
                    >
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </IconButton>
                  </HStack>
                </HStack>
                {isExpanded && (
                  <Box
                    p={3}
                    pt={0}
                    fontSize="2xs"
                  >
                    <Box
                      as="pre"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      color="gray.700"
                      bg="gray.50"
                      _dark={{ color: 'gray.300', bg: 'gray.800' }}
                      p={2}
                      borderRadius="md"
                    >
                      {JSON.stringify(event, null, 2)}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
          <div ref={eventsEndRef} />
        </VStack>
      </Box>

      {/* Modal for event details */}
      <Dialog.Root
        open={selectedEvent !== null}
        onOpenChange={(e) => !e.open && setSelectedEvent(null)}
        size="lg"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                Event Details
                {selectedEvent && (
                  <Badge colorPalette={"gray"} ml={2}>
                    {selectedEvent.type}
                  </Badge>
                )}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              {selectedEvent && (
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                      Timestamp:
                    </Text>
                    <Text fontSize="sm">
                      {new Date(selectedEvent.timestamp).toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                      Event Type:
                    </Text>
                    <Text fontSize="sm">{selectedEvent.type || 'Unknown Event'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                      Full Event Data:
                    </Text>
                    <Box
                      as="pre"
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      color="gray.700"
                      bg="gray.50"
                      _dark={{ color: 'gray.300', bg: 'gray.800' }}
                      p={4}
                      borderRadius="md"
                      maxH="400px"
                      overflowY="auto"
                    >
                      {JSON.stringify(selectedEvent, null, 2)}
                    </Box>
                  </Box>
                </VStack>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}
