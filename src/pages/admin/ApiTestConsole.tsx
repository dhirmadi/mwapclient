import React from 'react';
import { ApiTestConsole as ApiTestConsoleComponent } from '../../features/api-test/ApiTestConsole';
import MainLayout from '../../components/layout/MainLayout';

const ApiTestConsolePage: React.FC = () => {
  return (
    <MainLayout>
      <ApiTestConsoleComponent />
    </MainLayout>
  );
};

export default ApiTestConsolePage;