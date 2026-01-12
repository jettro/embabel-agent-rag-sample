import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { reindexData } from '../api';
import { toaster } from './ui/toaster';
import { FiDatabase, FiRefreshCw } from 'react-icons/fi';

export function AdminScreen() {
  const [isReindexing, setIsReindexing] = useState(false);
  const [lastIndexResult, setLastIndexResult] = useState<string | null>(null);

  const handleReindex = async () => {
    setIsReindexing(true);
    setLastIndexResult(null);

    try {
      const result = await reindexData();
      setLastIndexResult(result);
      
      toaster.create({
        title: 'Reindex Complete',
        description: result,
        type: 'success',
        duration: 5000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toaster.create({
        title: 'Reindex Failed',
        description: errorMessage,
        type: 'error',
        duration: 7000,
      });
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <Box
      flex={1}
      h="full"
      overflowY="auto"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
    >
      <Box maxW="6xl" mx="auto" p={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={2} align="flex-start">
            <Heading size="2xl">Administration</Heading>
            <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.400' }}>
              Manage your knowledge base and system settings
            </Text>
          </VStack>

          {/* Data Ingestion Section */}
          <Card.Root>
            <Card.Header>
              <HStack gap={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bg="blue.100"
                  _dark={{ bg: 'blue.900' }}
                >
                  <FiDatabase size={24} />
                </Box>
                <VStack gap={1} align="flex-start">
                  <Heading size="lg">Data Ingestion</Heading>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    Reindex your knowledge base documents
                  </Text>
                </VStack>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Text color="gray.700" _dark={{ color: 'gray.300' }}>
                  This process will scan the <code>./data</code> directory and ingest all 
                  supported document files into the knowledge base. Existing documents 
                  will not be re-processed unless they have been modified.
                </Text>

                <Box
                  p={4}
                  borderRadius="md"
                  bg="blue.50"
                  borderWidth="1px"
                  borderColor="blue.200"
                  _dark={{ bg: 'blue.950', borderColor: 'blue.800' }}
                >
                  <VStack gap={2} align="flex-start">
                    <Text fontSize="sm" fontWeight="bold" color="blue.800" _dark={{ color: 'blue.200' }}>
                      What happens during ingestion:
                    </Text>
                    <VStack gap={1} align="flex-start" pl={4}>
                      <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.300' }}>
                        • Scans all files in the data directory
                      </Text>
                      <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.300' }}>
                        • Extracts text content using Apache Tika
                      </Text>
                      <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.300' }}>
                        • Creates searchable indexes with Lucene
                      </Text>
                      <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.300' }}>
                        • Skips documents that are already indexed
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                {lastIndexResult && (
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="green.50"
                    borderWidth="1px"
                    borderColor="green.200"
                    _dark={{ bg: 'green.950', borderColor: 'green.800' }}
                  >
                    <Text fontSize="sm" color="green.800" _dark={{ color: 'green.200' }}>
                      <strong>Last Result:</strong> {lastIndexResult}
                    </Text>
                  </Box>
                )}

                <HStack gap={3}>
                  <Button
                    colorPalette="blue"
                    size="lg"
                    onClick={handleReindex}
                    disabled={isReindexing}
                    loading={isReindexing}
                  >
                    {isReindexing ? (
                      <>
                        <Spinner size="sm" />
                        Reindexing...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw />
                        Start Reindex
                      </>
                    )}
                  </Button>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Placeholder for Future Features */}
          <Card.Root opacity={0.6}>
            <Card.Header>
              <Heading size="lg">Additional Settings</Heading>
            </Card.Header>
            <Card.Body>
              <Text color="gray.500" fontStyle="italic">
                More administrative features coming soon...
              </Text>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}
