import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Search, Calendar as CalendarIcon, Shield, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Subject {
  code: string;
  name: string;
  credits?: number;
  grade?: string;
  points?: number;
  totalGradePoints?: number;
  marksAwarded?: number;
  passingMinimum?: number;
  maximumMarks?: number;
}

interface ResultData {
  studentName: string;
  rollNumber: string;
  registerNo?: string;
  course: string;
  branch: string;
  semester: string;
  year: string;
  resultId: string;
  college?: string;
  subjects: Subject[];
  result: string;
  sgpa?: string;
  cgpa?: string;
  totalCredits?: number;
  totalGradePoints?: number;
  place?: string;
  examDate?: string;
  totalMarks?: number;
  obtainedMarks?: number;
  percentage?: number;
}

interface ResultLookupProps {
  onResultFound: (data: any) => void;
}

const ResultLookup = ({ onResultFound }: ResultLookupProps) => {
  const [hallTicket, setHallTicket] = useState("");
  const [yearOfPassout, setYearOfPassout] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaAnswer] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const generateNewCaptcha = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hallTicket || !yearOfPassout || !captcha) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (captcha.toUpperCase() !== captchaAnswer) {
      toast({
        title: "Invalid CAPTCHA",
        description: "Please enter the correct CAPTCHA code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: results, error } = await supabase
        .from('results')
        .select('*')
        .ilike('roll_number', hallTicket)
        .like('year', `%${yearOfPassout}%`)
        .limit(10);

      if (error || !results || results.length === 0) {
        toast({
          title: "Result Not Found",
          description: "No result found for the provided register number and year",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const result = results[0];
      
      const dbResult: ResultData = {
        studentName: result.student_name,
        rollNumber: result.roll_number,
        registerNo: result.register_number,
        course: result.course,
        branch: result.branch || '',
        semester: result.semester,
        year: result.year,
        resultId: result.result_id,
        college: result.college,
        subjects: result.subjects || [],
        result: result.result,
        sgpa: result.sgpa,
        cgpa: result.cgpa,
        totalCredits: result.total_credits,
        totalGradePoints: result.total_grade_points,
        place: result.place,
        examDate: result.exam_date,
        totalMarks: result.total_marks,
        obtainedMarks: result.obtained_marks,
        percentage: result.percentage
      };

      onResultFound(dbResult);
      
      toast({
        title: "Result Found!",
        description: "Your examination result has been retrieved successfully."
      });
    } catch (error) {
      console.error('Error fetching result:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching your result",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
      <Card className="w-full max-w-md result-card shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Search className="h-6 w-6" />
            Result Lookup
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to view examination results
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hallTicket" className="text-accent font-medium flex items-center gap-2">
                🎫 Register Number
              </Label>
              <Input
                id="hallTicket"
                type="text"
                placeholder="Enter your register number"
                value={hallTicket}
                onChange={(e) => setHallTicket(e.target.value)}
                className="border-accent focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-accent font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Year of Passout
              </Label>
              <Select value={yearOfPassout} onValueChange={setYearOfPassout}>
                <SelectTrigger className="border-accent focus:ring-primary">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 41 }, (_, i) => 2030 - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha" className="text-accent font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                CAPTCHA
                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="ml-auto text-xs text-primary hover:text-accent flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              </Label>
              <div className="flex items-center gap-3">
                <div className="bg-muted px-4 py-2 rounded border-2 border-accent font-mono text-lg font-bold tracking-wider">
                  {captchaAnswer}
                </div>
                <Input
                  id="captcha"
                  type="text"
                  placeholder="Enter CAPTCHA"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  className="border-accent focus:ring-primary"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "🔍 Searching..." : "📤 View Results"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6 p-4 bg-muted/50 rounded">
            Please enter valid credentials. All records are confidential and secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultLookup;
