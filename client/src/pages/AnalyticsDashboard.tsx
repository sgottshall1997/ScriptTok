import React from 'react';
import AnalyticsDashboardComponent from '@/components/AnalyticsDashboard';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      <AnalyticsDashboardComponent />
    </div>
  );
};

export default AnalyticsDashboard;