import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, TrendingUp, ArrowRight, Activity, PieChart, BarChart2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    monthlyRevenue: '0',
    activeStaff: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [
          patientsRes,
          appointmentsRes,
          revenueRes,
          staffRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/getTPatient', { withCredentials: true }),
          axios.get('http://localhost:5000/api/admin/todayAppointment', { withCredentials: true }),
          axios.get('http://localhost:5000/api/admin/monthlyRevenue', { withCredentials: true }),
          axios.get('http://localhost:5000/api/admin/totalActiveStaff', { withCredentials: true })
        ]);

        setStats({
          totalPatients: patientsRes.data.totalPatients,
          appointmentsToday: appointmentsRes.data.totalAppointments,
          monthlyRevenue: revenueRes.data.monthlyTotalRevenue,
          activeStaff: staffRes.data.totalActiveStaff,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    { 
      id: 1, 
      title: 'Total Patients', 
      value: stats.totalPatients, 
      icon: <Users className="h-6 w-6 text-primary" /> 
    },
    { 
      id: 2, 
      title: 'Appointments Today', 
      value: stats.appointmentsToday, 
      icon: <Calendar className="h-6 w-6 text-secondary" /> 
    },
    { 
      id: 3, 
      title: 'Monthly Revenue', 
      value: `${Number(stats.monthlyRevenue).toLocaleString()} ETB`, 
      icon: <DollarSign className="h-6 w-6 text-accent" /> 
    },
    { 
      id: 4, 
      title: 'Active Staff', 
      value: stats.activeStaff, 
      icon: <Users className="h-6 w-6 text-green-600" /> 
    }
  ];
  
 
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }
  
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsData.map((stat) => (
          <Card key={stat.id} className="transform transition-all duration-200 hover:scale-105">
            <CardBody className="flex flex-col items-center p-8 text-center">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                {stat.icon}
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">{stat.title}</p>
              <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      
      {/* Quick Access Links */}
      <div className="mt-8">
        {/* Add quick access links here */}
      </div>
    </div>
  );
};


export default AdminDashboard;