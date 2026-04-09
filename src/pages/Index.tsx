import { useState } from "react";
import Header from "@/components/Header";
import ResultLookup from "@/components/ResultLookup";
import ResultDisplay from "@/components/ResultDisplay";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SubscriptionBlocker from "@/components/SubscriptionBlocker";
import { SUBSCRIPTION_CONFIG } from "@/lib/config";

const Index = () => {
  const [currentView, setCurrentView] = useState<"lookup" | "result">("lookup");
  const [resultData, setResultData] = useState(null);

  const handleResultFound = (data: any) => {
    setResultData(data);
    setCurrentView("result");
  };

  const handleBackToSearch = () => {
    setCurrentView("lookup");
    setResultData(null);
  };

  if (!SUBSCRIPTION_CONFIG.isActive) {
    return <SubscriptionBlocker />;
  }

  if (currentView === "result" && resultData) {
    return (
      <div className="min-h-screen flex flex-col" style={{ zoom: '100%' }}>
        <Header />
        <ResultDisplay result={resultData} onBack={handleBackToSearch} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ zoom: '100%' }}>
      <Header />
      
      {/* Technical Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="text-amber-800 text-sm font-medium">
            ⚠️ Due to technical issues, results are temporarily available here. 
            <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-900 hover:text-amber-700 ml-1">
              Check official portal
            </a> 
            {' '}after a few weeks for final results.
          </span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
        <div className="flex-1">
          <ResultLookup onResultFound={handleResultFound} />
        </div>
        
        <div className="lg:w-80">
          <Sidebar />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
