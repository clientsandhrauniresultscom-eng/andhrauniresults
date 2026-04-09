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
