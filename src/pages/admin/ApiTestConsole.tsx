import React from 'react';
import { ApiTestConsole as ApiTestConsoleComponent } from '../../features/api-test/ApiTestConsole';
import { PageHeader } from '../../components/layout';

const ApiTestConsolePage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="API Test Console"
        description="Run API tests and view detailed request/response information"
      />
      <div className="mt-6">
        <ApiTestConsoleComponent />
      </div>
    </div>
  );
};

export default ApiTestConsolePage;