import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, FileText, Settings, Activity, Check, X, Eye } from 'lucide-react';

const AdminPanel = () => {
  const { currentUser, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ usersCount: 0, postsCount: 0 });
  
  // Since we don't have full admin endpoints written for all tabs in backend yet, 
  // we'll mock some data and use the available /stats endpoint.

  useEffect(() => {
    if (userData?.role === 'admin') {
      fetchStats();
    }
  }, [userData]);

  const fetchStats = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!currentUser || userData?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-wider mb-8">Admin</h2>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <Activity className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('requests')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FileText className="w-5 h-5" />
              <span className="font-medium">Post Requests</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <Users className="w-5 h-5" />
              <span className="font-medium">Users</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 p-8">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
                    <p className="text-3xl font-bold mt-1">{stats.usersCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Published Posts</p>
                    <p className="text-3xl font-bold mt-1">{stats.postsCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Requests</p>
                    <p className="text-3xl font-bold mt-1">2</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <p className="text-gray-500">Analytics charts will go here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Post Requests Management</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Title</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Author UID</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Date</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {/* Dummy row since we don't fetch all requests in this minimal example */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 font-medium">Example Post Request</td>
                    <td className="px-6 py-4 text-gray-500">uid_12345</td>
                    <td className="px-6 py-4 text-gray-500">2026-05-12</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending</span></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check className="w-4 h-4" /></button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
