import {
  Box,
  VStack,
  Heading,
  Button,
} from '@chakra-ui/react';
import { useState } from 'react';
import { reindexData } from '../api';

export function Sidebar() {
  const [isReindexing, setIsReindexing] = useState(false);

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      const result = await reindexData();
      alert(`Reindex Complete: ${result}`);
    } catch (error) {
      alert(`Reindex Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <Box
      w="280px"
      bg="gray.50"
      borderRight="1px"
      borderColor="gray.200"
      p={6}
    >
      <VStack gap={6} align="stretch">
        <VStack gap={3} align="stretch">
          <Heading size="sm" color="gray.600">
            Actions
          </Heading>
          <Button
            colorPalette="blue"
            size="md"
            onClick={handleReindex}
            loading={isReindexing}
            loadingText="Reindexing..."
          >
            Reindex Data
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
