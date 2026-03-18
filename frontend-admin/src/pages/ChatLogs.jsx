import { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Clock, Search } from 'lucide-react';
import apiAuth from '../utils/apiAuth';
import Skeleton from 'react-loading-skeleton';

export default function ChatLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      const { data } = await apiAuth.get('/ai/logs');
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch AI logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8"><Skeleton count={8} height={80} className="mb-4" /></div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">AI Interaction Logs</h1>
           <p className="text-gray-500 mt-1">Monitor how customers are interacting with the Gemini-powered assistant.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white shadow-sm transition"
           />
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-blue-200 transition duration-300">
             <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <Clock size={14} />
                      <span>{new Date(log.timestamp || Date.now()).toLocaleString()}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 text-gray-500 rounded-lg mt-1">
                         <User size={16} />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none flex-1">
                         <p className="text-gray-800 leading-relaxed font-medium">{log.question}</p>
                      </div>
                   </div>

                   <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1 order-2 ml-3">
                         <Bot size={16} />
                      </div>
                      <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none flex-1 order-1">
                         <p className="text-white leading-relaxed">{log.answer}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
             <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-500 font-bold italic">No chat logs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
