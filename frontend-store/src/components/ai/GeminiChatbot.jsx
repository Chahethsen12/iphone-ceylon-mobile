import { useState, useRef, useEffect } from 'react';
import { FaApple, FaChevronDown, FaRobot, FaPaperPlane } from 'react-icons/fa';
import api from '../../utils/api';

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am the icm Assistant. How can I help you find the perfect device today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat when new messages appear
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Call your backend AI route
      const response = await api.post('/ai/chat', { prompt: userMessage });
      
      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'ai', text: response.data.answer }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to my database right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-2xl hover:bg-gray-200 transition-all z-50 flex items-center justify-center group"
        >
          <FaApple className="w-6 h-6 mr-2" />
          <span className="font-semibold pr-2">Ask AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] glass-dark rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-black/90 p-4 border-b border-gray-800 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <FaApple className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">icm Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <FaChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1c1c1e]">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-[#2c2c2e] text-gray-200 rounded-bl-sm'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }} // Preserves bullet points from AI
                >
                  {msg.role === 'ai' && <FaRobot className="inline-block mr-2 mb-1 opacity-50" />}
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2c2c2e] text-gray-400 p-3 rounded-2xl rounded-bl-sm text-sm flex space-x-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black border-t border-gray-800">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our products..." 
                className="flex-1 bg-[#2c2c2e] text-white rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-white text-black p-2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition"
              >
                <FaPaperPlane className="w-4 h-4 ml-[-2px]" />
              </button>
            </form>
          </div>
          
        </div>
      )}
    </>
  );
}
