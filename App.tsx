import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { AnalysisResult } from './components/AnalysisResult';
import { AppView, MedicalAnalysis } from './types';
import { analyzeMedicalReport } from './services/geminiService';
import { Upload, Camera, FileText, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [analysisData, setAnalysisData] = useState<MedicalAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setCurrentView(AppView.ANALYZING);
    setIsProcessing(true);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const result = await analyzeMedicalReport(base64String);
        setAnalysisData(result);
        setCurrentView(AppView.RESULTS);
      } catch (err) {
        setError("Failed to analyze the image. Please ensure it's a clear medical report and try again.");
        setCurrentView(AppView.UPLOAD);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleHomeClick = () => {
    setCurrentView(AppView.HOME);
    setAnalysisData(null);
    setError(null);
  };

  return (
    <Layout onHomeClick={handleHomeClick}>
      
      {/* HOME VIEW */}
      {currentView === AppView.HOME && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="max-w-3xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Understand Your <span className="text-blue-600">Medical Reports</span> in Seconds
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Don't stress over complex lab results. Upload a photo of your report and let our AI explain it in simple, plain language.
            </p>
            
            <div className="pt-8">
              <button 
                onClick={() => setCurrentView(AppView.UPLOAD)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg shadow-blue-200 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Upload className="w-5 h-5" />
                Explain My Report
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-12 text-left">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4 text-teal-600">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Instant Summary</h3>
                <p className="text-sm text-slate-500">Get a quick overview of your health status without the medical jargon.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Easy Upload</h3>
                <p className="text-sm text-slate-500">Simply take a photo or upload a PDF of your lab report to get started.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                 <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4 text-amber-600">
                  <Loader2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Smart Analysis</h3>
                <p className="text-sm text-slate-500">We highlight what matters and provide simple lifestyle tips.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD VIEW */}
      {currentView === AppView.UPLOAD && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-xl">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Upload Your Report</h2>
            
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 text-center">
                {error}
              </div>
            )}

            <label className="group flex flex-col items-center justify-center w-full h-80 border-2 border-slate-300 border-dashed rounded-3xl cursor-pointer bg-white hover:bg-slate-50 hover:border-blue-400 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-blue-500" />
                </div>
                <p className="mb-2 text-lg text-slate-700 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-500">JPEG, PNG or Screenshots</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
            
            <p className="text-center text-slate-400 text-sm mt-6">
              Ensure the image is clear and well-lit. We don't store your personal data permanently.
            </p>
          </div>
        </div>
      )}

      {/* ANALYZING VIEW */}
      {currentView === AppView.ANALYZING && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="text-center space-y-6 max-w-md">
             <div className="relative w-24 h-24 mx-auto">
               <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
               <ActivityIcon className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-pulse" />
             </div>
             
             <div>
               <h3 className="text-2xl font-bold text-slate-800">Analyzing Report...</h3>
               <p className="text-slate-500 mt-2">
                 Reading values, checking ranges, and preparing your simplified explanation. This may take a moment.
               </p>
             </div>
             
             <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium inline-block">
               Tip: Medical terms are being translated to plain English
             </div>
           </div>
        </div>
      )}

      {/* RESULTS VIEW */}
      {currentView === AppView.RESULTS && analysisData && (
        <AnalysisResult 
          data={analysisData} 
          onNewUpload={() => {
            setAnalysisData(null);
            setCurrentView(AppView.UPLOAD);
          }} 
        />
      )}

    </Layout>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default App;