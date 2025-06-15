import React from 'react';
import { useApiTestRunner, ApiTest } from './useApiTestRunner';
import { TestResultCard } from './TestResultCard';
import { Button, Text, Title, Group, Checkbox, Stack, Paper, Badge, Loader } from '@mantine/core';

export const ApiTestConsole: React.FC = () => {
  const { 
    results, 
    isRunning, 
    runAllTests, 
    predefinedTests,
    selectedTests,
    toggleTestSelection
  } = useApiTestRunner();

  return (
    <div>
      <Paper p="md" mb="lg" withBorder>
        <Group justify="space-between" mb="md">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            color="blue"
            leftSection={isRunning ? <Loader size="xs" color="white" /> : null}
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          {results.length > 0 && (
            <Group>
              <Badge color="green" size="lg">
                {results.filter(r => r.success).length} Passed
              </Badge>
              <Badge color="red" size="lg">
                {results.filter(r => !r.success).length} Failed
              </Badge>
            </Group>
          )}
        </Group>
        
        <div>
          <Title order={4} mb="sm">Available Tests</Title>
          <Group>
            {predefinedTests.map((test) => (
              <Checkbox
                key={test.id}
                label={test.name}
                checked={selectedTests.includes(test.id)}
                onChange={() => toggleTestSelection(test.id)}
              />
            ))}
          </Group>
        </div>
      </Paper>
      
      {results.length > 0 && (
        <div>
          <Title order={3} mb="md">Test Results</Title>
          <Stack spacing="md">
            {results.map((result) => (
              <TestResultCard key={result.id} result={result} />
            ))}
          </Stack>
        </div>
      )}
    </div>
  );
};