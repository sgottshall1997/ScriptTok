import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Footer: React.FC = () => {
  return (
    <footer className="mt-8">
      {/* Amazon Associates Disclosure */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 italic text-center">
            <strong>Disclosure:</strong> As an Amazon Associate, I earn from qualifying purchases.
          </p>
        </CardContent>
      </Card>
    </footer>
  );
};

export default Footer;