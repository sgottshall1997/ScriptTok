import React from 'react';
import { AmazonAssociatesDisclosure } from './AmazonAssociatesDisclosure';

interface ComplianceWrapperProps {
  children: React.ReactNode;
  hasAffiliateLinks?: boolean;
  showDetailedDisclosure?: boolean;
  className?: string;
}

export const ComplianceWrapper: React.FC<ComplianceWrapperProps> = ({
  children,
  hasAffiliateLinks = false,
  showDetailedDisclosure = false,
  className = ""
}) => {
  return (
    <div className={className}>
      {hasAffiliateLinks && (
        <div className="mb-4">
          <AmazonAssociatesDisclosure 
            variant={showDetailedDisclosure ? 'detailed' : 'compact'} 
          />
        </div>
      )}
      {children}
      {hasAffiliateLinks && (
        <div className="mt-6">
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
            <p className="font-medium mb-1">Important Notice:</p>
            <p>
              This content is generated for affiliate marketing purposes. 
              All product links are affiliate links. I do not provide customer service 
              for Amazon purchases - please contact Amazon directly for any order issues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};