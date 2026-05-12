import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, TrendingUp, ChevronRight, User } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 text-white mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 px-8 py-20 md:py-32 md:px-16 flex flex-col md:w-2/3">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium mb-4 w-fit">Featured</span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
            Discover Stories That Matter
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
            A premium modern platform for writers and readers. Explore ideas, share your thoughts, and connect with a global audience.
          </p>
          <div className="flex space-x-4">
            <Link to="/login" className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg">Start Reading</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 border-b dark:border-gray-800 pb-4">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="text-blue-500" /> Latest Articles
            </h2>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col sm:flex-row gap-6 p-4 border dark:border-gray-800 rounded-2xl">
                  <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  <div className="flex-1 space-y-4 py-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No posts available yet. Be the first to request one!</div>
          ) : (
            <div className="space-y-8">
              {posts.map(post => (
                <div key={post.id} className="group flex flex-col sm:flex-row gap-6 p-5 glass rounded-2xl card-hover">
                  <div className="w-full sm:w-56 h-56 sm:h-auto overflow-hidden rounded-xl">
                    <img src={post.thumbnail || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span className="flex items-center text-gray-500 dark:text-gray-400 font-normal"><Clock className="w-3 h-3 mr-1" /> 5 min read</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      <Link to={`/post/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Author Name</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{new Date(post.publishDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link to={`/post/${post.id}`} className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                        <ChevronRight />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Categories Widget */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 border-b dark:border-gray-700 pb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['Technology', 'Programming', 'Lifestyle', 'Business', 'Design', 'Health'].map(cat => (
                <span key={cat} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Newsletter Widget */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white text-center shadow-lg">
            <h3 className="text-xl font-bold mb-2">Subscribe to Newsletter</h3>
            <p className="text-blue-100 text-sm mb-4">Get the latest posts delivered right to your inbox.</p>
            <input type="email" placeholder="Your email address" className="w-full px-4 py-2 rounded-lg text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-white" />
            <button className="w-full py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
