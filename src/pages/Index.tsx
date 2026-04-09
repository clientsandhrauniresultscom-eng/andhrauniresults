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
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-accent/5 to-background overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-accent">Andhra University Examination Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Check Your Examination Results
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access your semester-wise examination results instantly. Enter your register number and year of passout to view your academic performance.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {[
              { label: "Total Students", value: "50,000+" },
              { label: "Courses Offered", value: "150+" },
              { label: "Results Published", value: "500+" },
              { label: "Pass Rate", value: "95%" },
            ].map((stat, i) => (
              <div key={i} className="bg-card/80 backdrop-blur-sm border border-accent/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
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
