import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Search, AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-24 w-24 text-destructive" />
        </div>
        
        <h1 className="text-6xl font-bold text-foreground">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/">
              <Search className="h-4 w-4 mr-2" />
              Search Results
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
