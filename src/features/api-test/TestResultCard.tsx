import React, { useState } from 'react';
import { TestResult } from './useApiTestRunner';
import { 
  Paper, 
  Group, 
  Title, 
  Text, 
  Badge, 
  ThemeIcon, 
  Collapse, 
  Grid, 
  Box, 
  Code, 
  Alert,
  ActionIcon
} from '@mantine/core';
import { IconCheck, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface TestResultCardProps {
  result: TestResult;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Paper 
      withBorder 
      p="md" 
      radius="md"
      bg={result.success ? 'green.0' : 'red.0'}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap">
          <ThemeIcon 
            color={result.success ? 'green' : 'red'} 
            variant="light" 
            size="lg" 
            radius="xl"
          >
            {result.success ? <IconCheck size={18} /> : <IconX size={18} />}
          </ThemeIcon>
          
          <div>
            <Text fw={500}>{result.name}</Text>
            <Text size="sm" c="dimmed">
              {result.method} {result.url}
            </Text>
          </div>
        </Group>
        
        <Group wrap="nowrap">
          {result.status && (
            <Badge 
              color={result.success ? 'green' : 'red'}
              variant="light"
            >
              {result.status} {result.statusText}
            </Badge>
          )}
          <Text size="sm" c="dimmed">{result.duration.toFixed(0)}ms</Text>
          <ActionIcon 
            onClick={() => setShowDetails(!showDetails)}
            variant="subtle"
          >
            {showDetails ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </ActionIcon>
        </Group>
      </Group>
      
      <Collapse in={showDetails}>
        <Box mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          {result.error && (
            <Alert color="red" title="Error" mb="md">
              {result.error}
            </Alert>
          )}
          
          {result.curlCommand && (
            <Box mb="md">
              <Title order={5} mb="xs">cURL Command</Title>
              <Paper p="xs" withBorder bg="blue.0">
                <Text size="xs" c="dimmed">Copy this command to test manually:</Text>
                <Code block style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {result.curlCommand}
                </Code>
              </Paper>
            </Box>
          )}
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={5} mb="xs">Request</Title>
              <Paper p="xs" withBorder bg="gray.0">
                <Text fw={500} ff="monospace" size="sm">
                  {result.method} {result.url}
                </Text>
                
                {result.requestData && (
                  <Box mt="xs">
                    <Text size="xs" c="dimmed">Request Data:</Text>
                    <Code block style={{ maxHeight: '200px', overflow: 'auto' }}>
                      {JSON.stringify(result.requestData, null, 2)}
                    </Code>
                  </Box>
                )}
              </Paper>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={5} mb="xs">Response</Title>
              <Paper p="xs" withBorder bg="gray.0">
                {result.status && (
                  <Text fw={500} ff="monospace" size="sm">
                    {result.status} {result.statusText}
                  </Text>
                )}
                
                {result.responseHeaders && (
                  <Box mt="xs">
                    <Text size="xs" c="dimmed">Headers:</Text>
                    <Code block style={{ maxHeight: '100px', overflow: 'auto' }}>
                      {JSON.stringify(result.responseHeaders, null, 2)}
                    </Code>
                  </Box>
                )}
                
                {result.responseData && (
                  <Box mt="xs">
                    <Text size="xs" c="dimmed">Response Body:</Text>
                    <Code block style={{ maxHeight: '200px', overflow: 'auto' }}>
                      {JSON.stringify(result.responseData, null, 2)}
                    </Code>
                  </Box>
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};