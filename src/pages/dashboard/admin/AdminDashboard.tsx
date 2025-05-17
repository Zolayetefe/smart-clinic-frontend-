import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, TrendingUp, ArrowRight, Activity, PieChart, BarChart2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data for statistics
  const stats = [
    { 
      id: 1, 
      title: 'Total Patients', 
      value: 1248, 
      change: 12, 
      trend: 'up', 
      icon: <Users className="h-6 w-6 text-primary" /> 
    },
    { 
      id: 2, 
      title: 'Appointments Today', 
      value: 42, 
      change: 8, 
      trend: 'up', 
      icon: <Calendar className="h-6 w-6 text-secondary" /> 
    },
    { 
      id: 3, 
      title: 'Monthly Revenue', 
      value: '$48,350', 
      change: 5, 
      trend: 'up', 
      icon: <DollarSign className="h-6 w-6 text-accent" /> 
    },
    { 
      id: 4, 
      title: 'Active Staff', 
      value: 28, 
      change: 0, 
      trend: 'neutral', 
      icon: <Users className="h-6 w-6 text-green-600" /> 
    }
  ];
  
  // Mock data for recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'New Patient',
      description: 'Jane Smith registered as a new patient',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'Appointment',
      description: 'Dr. Johnson completed a consultation with Michael Brown',
      time: '4 hours ago'
    },
    {
      id: '3',
      type: 'Staff Update',
      description: 'Dr. Roberts updated their availability for next month',
      time: '5 hours ago'
    },
    {
      id: '4',
      type: 'Finance',
      description: 'Monthly financial report has been generated',
      time: 'Yesterday'
    }
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-accent to-accent-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {user?.name}</h2>
            <p className="mt-1 text-white/80">Here's what's happening at the clinic today</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/admin/analytics">
              <button className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50">
                View Full Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.id}>
            <CardBody className="flex items-center p-6">
              <div className="p-3 rounded-full bg-gray-100">
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.trend !== 'neutral' && (
                    <span 
                      className={`ml-2 flex items-center text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                      )}
                      {stat.change}%
                    </span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      
      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Demographics Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Patient Demographics</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
              <div className="text-center">
                <Activity className="h-10 w-10 text-gray-300 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Patient age distribution chart</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Average Age</p>
                <p className="text-lg font-semibold text-gray-900">42 years</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Gender Ratio</p>
                <p className="text-lg font-semibold text-gray-900">58% F / 42% M</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Monthly Appointments Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Monthly Appointments</h3>
              <BarChart2 className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
              <div className="text-center">
                <Activity className="h-10 w-10 text-gray-300 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Appointment trends chart</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-lg font-semibold text-gray-900">528</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">vs Last Month</p>
                <p className="text-lg font-semibold text-green-600">+12.5%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <Link 
                to="#"
                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                        {activity.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-colors">
          <CardBody className="p-6">
            <div className="p-3 bg-primary/10 inline-flex rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Staff Management</h3>
            <p className="mt-1 text-sm text-gray-600">Manage doctors, nurses and other staff members</p>
            <Link 
              to="/admin/staff"
              className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
            >
              Manage Staff
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 hover:from-secondary/15 hover:to-secondary/10 transition-colors">
          <CardBody className="p-6">
            <div className="p-3 bg-secondary/10 inline-flex rounded-full">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Appointment Overview</h3>
            <p className="mt-1 text-sm text-gray-600">View and manage upcoming appointments</p>
            <Link 
              to="#"
              className="mt-4 inline-flex items-center text-sm font-medium text-secondary hover:text-secondary-dark"
            >
              View Appointments
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/15 hover:to-accent/10 transition-colors">
          <CardBody className="p-6">
            <div className="p-3 bg-accent/10 inline-flex rounded-full">
              <DollarSign className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Financial Reports</h3>
            <p className="mt-1 text-sm text-gray-600">Generate and view financial reports</p>
            <Link 
              to="#"
              className="mt-4 inline-flex items-center text-sm font-medium text-accent hover:text-accent-dark"
            >
              View Reports
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;