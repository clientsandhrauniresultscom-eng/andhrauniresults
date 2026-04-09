import { Shield, Lock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-accent text-accent-foreground py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-lg mb-3">Andhra University</h3>
            <p className="text-sm opacity-90">
              Committed to academic excellence and innovative education since 1985.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">University Website</a></li>
              <li>• <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Academic Calendar</a></li>
              <li>• <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Examination Guidelines</a></li>
              <li>• <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Student Portal</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Security & Trust</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Data Protected</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-accent-foreground/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-90">
              © 2025 Andhra University. All Rights Reserved.
            </p>
            <p className="text-sm opacity-90">
              Website designed and maintained by Andhra University IT Cell
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
