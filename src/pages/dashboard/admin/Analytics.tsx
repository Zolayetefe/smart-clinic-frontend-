import React from 'react';
import { BarChart2, PieChart } from 'lucide-react';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Revenue Trends</h3>
              <BarChart2 className="w-5 h-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-60 flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">[Bar Chart Placeholder]</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Patient Distribution</h3>
              <PieChart className="w-5 h-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-60 flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">[Pie Chart Placeholder]</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
