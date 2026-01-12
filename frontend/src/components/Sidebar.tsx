import {
  Box,
  VStack,
  Heading,
  Text,
} from '@chakra-ui/react';

export function Sidebar() {
  return (
    <Box
      w="280px"
      bg="gray.50"
      _dark={{ bg: 'gray.800' }}
      borderRightWidth="1px"
      p={6}
      h="full"
    >
      <VStack gap={6} align="stretch">
        <VStack gap={3} align="stretch">
          <Heading size="sm">
            Chat History
          </Heading>
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            Conversation history coming soon...
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
