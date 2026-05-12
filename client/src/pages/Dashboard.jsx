import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { PenTool, Clock, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [myRequests, setMyRequests] = useState([]);
  
  // Request Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchMyRequests();
    }
  }, [currentUser]);

  const fetchMyRequests = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get('http://localhost:5000/api/requests/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!title || !description || !content || !category) {
      return toast.error("Please fill all required fields");
    }
    
    setIsSubmitting(true);
    try {
      const token = await currentUser.getIdToken();
      await axios.post('http://localhost:5000/api/requests', {
        title, description, content, category, thumbnail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post requested successfully!");
      setTitle(''); setDescription(''); setContent(''); setCategory(''); setThumbnail('');
      setActiveTab('requests');
      fetchMyRequests();
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="glass p-6 rounded-3xl sticky top-24 text-center">
            <img src={userData?.picture} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-gray-800 shadow-lg" />
            <h2 className="text-xl font-bold">{userData?.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{userData?.role}</p>
            
            <div className="flex flex-col space-y-2">
              <button onClick={() => setActiveTab('requests')} className={`px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>My Requests</button>
              <button onClick={() => setActiveTab('new-request')} className={`px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'new-request' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Request Post</button>
              <button onClick={() => setActiveTab('profile')} className={`px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Profile Settings</button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'requests' && (
            <div className="glass p-8 rounded-3xl min-h-[60vh]">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Clock /> My Post Requests</h2>
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  You haven't requested any posts yet.
                  <button onClick={() => setActiveTab('new-request')} className="block mx-auto mt-4 text-blue-600 hover:underline">Request your first post</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map(req => (
                    <div key={req.id} className="p-4 border dark:border-gray-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{req.title}</h3>
                        <p className="text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()} • {req.category}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                          req.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {req.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {req.status === 'pending' && <Clock className="w-3 h-3" />}
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new-request' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><PenTool /> Request a New Post</h2>
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Headline / Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Enter an engaging title" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Short Description *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24" placeholder="Brief summary of the article"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-800">
                      <option value="">Select Category</option>
                      <option value="Technology">Technology</option>
                      <option value="Programming">Programming</option>
                      <option value="Lifestyle">Lifestyle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                    <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://image.url" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Content *</label>
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700">
                    <ReactQuill theme="snow" value={content} onChange={setContent} className="h-64" />
                  </div>
                </div>
                <div className="pt-10">
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit Request for Approval'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
              <div className="space-y-4">
                <p><strong>Name:</strong> {userData?.name}</p>
                <p><strong>Email:</strong> {userData?.email}</p>
                <p><strong>Role:</strong> <span className="capitalize">{userData?.role}</span></p>
                <p><strong>Joined:</strong> {new Date(userData?.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
