import React, { useState, useRef, useEffect } from 'react';
import { MedicalAnalysis, ChatMessage } from '../types';
import { AlertTriangle, CheckCircle, Info, ArrowRight, MessageCircle, Send, X } from 'lucide-react';
import { askFollowUpQuestion } from '../services/geminiService';

interface AnalysisResultProps {
  data: MedicalAnalysis;
  onNewUpload: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onNewUpload }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'chat'>('overview');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `I've analyzed your ${data.reportType}. Ask me anything about it!`, timestamp: Date.now() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeTab]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    const apiHistory = chatHistory.map(msg => ({ role: msg.role, text: msg.text }));
    const responseText = await askFollowUpQuestion(data, apiHistory, userMsg.text);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, modelMsg]);
    setIsChatLoading(false);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Normal':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Normal</span>;
      case 'Abnormal':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Abnormal</span>;
      case 'Critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Attention</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
      
      {/* Header Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{data.reportType}</h2>
            <p className="text-slate-500 text-sm mt-1">AI Generated Explanation • {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={onNewUpload}
            className="text-sm text-blue-600 font-medium hover:text-blue-800"
          >
            Upload Another
          </button>
        </div>
        <div className="mt-4 bg-blue-50 p-4 rounded-xl text-slate-700 leading-relaxed">
          <p>{data.summary}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Overview & Actions
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'details' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Detailed Breakdown
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'chat' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Ask AI
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        
        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Red Flags */}
            {data.redFlags.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Points of Attention</h3>
                </div>
                <ul className="space-y-2">
                  {data.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-red-800 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900">Suggested Next Steps</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.lifestyleRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 border border-slate-100">
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-slate-800">{data.parameters.length}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Parameters</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {data.parameters.filter(p => p.status === 'Normal').length}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Normal</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {data.parameters.filter(p => p.status === 'Abnormal').length}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Abnormal</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {data.parameters.filter(p => p.status === 'Critical').length}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Critical</div>
                </div>
            </div>
          </div>
        )}

        {/* VIEW: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-fade-in">
            {data.parameters.map((param, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">{param.name}</h4>
                    <p className="text-sm text-slate-500">Result: <span className="font-semibold text-slate-900">{param.value} {param.unit}</span></p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <StatusBadge status={param.status} />
                    <span className="text-xs text-slate-400">Ref: {param.referenceRange}</span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">What is it?</span>
                        <p className="text-sm text-slate-600">{param.explanation}</p>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Implication</span>
                        <p className="text-sm text-slate-600">{param.implication}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-[500px] flex flex-col animate-fade-in">
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 rounded-bl-none shadow-sm flex items-center gap-2">
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>
             
             <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
               <div className="flex gap-2">
                 <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about this report (e.g., 'Is my TSH dangerous?')"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                 />
                 <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        <p>{data.disclaimer}</p>
      </div>
    </div>
  );
};