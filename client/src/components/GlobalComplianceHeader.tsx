import React from 'react';
import { AlertCircle } from 'lucide-react';

export const GlobalComplianceHeader: React.FC = () => {
  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="font-medium">
            Disclosure: As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
      </div>
    </div>
  );
};