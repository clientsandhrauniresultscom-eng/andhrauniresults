const officialLogo = "/lovable-uploads/1985a4f2-89fc-4924-9d69-0b6204adfaf4.png";

const Header = () => {
  return (
    <div className="w-full">
      <header className="bg-background border-b-2 border-accent py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer">
              <img 
                src={officialLogo} 
                alt="Andhra University Logo" 
                className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            </a>
            <div>
              <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer">
                <h1 className="text-2xl md:text-3xl font-bold text-primary hover:text-accent transition-colors">
                  Andhra University
                </h1>
              </a>
              <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer">
                <p className="text-lg text-accent font-semibold hover:text-primary transition-colors cursor-pointer">
                  OFFICIAL EXAMINATION RESULT
                </p>
              </a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">University Home</a>
            <a href="https://www.andhrauniversity.edu.in/examinations" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Examinations</a>
            <a href="https://www.andhrauniversity.edu.in/results" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Results</a>
            <a href="https://www.andhrauniversity.edu.in/contact" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </header>

      <div className="university-gradient py-2 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="scroll-marquee">
            <span className="text-primary-foreground font-medium">
              📢 Results for Winter 2024 examinations are now available • 
              📅 Revaluation applications close on 31st January 2025 • 
              🎓 Convocation ceremony scheduled for March 2025 • 
              📞 For queries, contact: andhrauniresult@edumail.edu.pl
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
