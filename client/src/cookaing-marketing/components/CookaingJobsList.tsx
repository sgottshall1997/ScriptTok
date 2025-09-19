import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, ListTodo } from 'lucide-react';

const CookaingJobsList: React.FC = () => {
  return (
    <Card className="w-full" data-testid="cookaing-jobs-list">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Content Generation Jobs
        </CardTitle>
        <CardDescription>
          This feature is being implemented to track and manage recipe content generation jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <ListTodo className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Jobs Management System Coming Soon
            </h3>
            <p className="text-sm text-purple-700 mb-4">
              This component will display all your recipe content generation jobs with their status and progress.
            </p>
            <Button 
              variant="outline" 
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              data-testid="button-jobs-coming-soon"
              onClick={() => {
                // Placeholder for future implementation
                console.log('Jobs management will be implemented here');
              }}
            >
              <Layers className="h-4 w-4 mr-2" />
              Implementation Coming Soon
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CookaingJobsList;