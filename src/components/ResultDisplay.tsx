import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Printer } from "lucide-react";
import html2pdf from "html2pdf.js";
import universityLogo from "@/assets/university-logo.png";
import controllerSignature from "@/assets/controller-signature.png";

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
  passingMarks?: number;
  minimumMarks?: number;
}

interface ResultDisplayProps {
  result: ResultData;
  onBack: () => void;
}

const ResultDisplay = ({ result, onBack }: ResultDisplayProps) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.querySelector('.result-card');
    const options = {
      margin: 0.5,
      filename: `${result.studentName}_${result.registerNo || result.rollNumber}_Result.pdf`,
      image: {
        type: 'jpeg',
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      }
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="watermark-background"></div>

      <div className="no-print sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-accent p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload} className="border-secondary text-secondary-foreground hover:bg-secondary">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <div className="no-print bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
          <p className="text-green-800 text-sm">
            ✓ <span className="font-semibold">Official Examination Result</span> - This result is authenticated and final. The university will also publish a copy on 
            <a href="https://www.andhrauniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="underline font-bold">www.andhrauniversity.edu.in</a> 
            {' '}for verification. For any discrepancies, contact the examination controller.
          </p>
        </div>
        <Card className="result-card shadow-2xl relative z-10">
          <CardHeader className="text-center border-b border-accent pb-6">
            <div className="flex items-center justify-center gap-6 mb-4">
              <img src={universityLogo} alt="University Logo" className="h-40 w-auto" style={{marginTop: '8px'}} />
              <div className="text-left">
                <CardTitle className="text-4xl font-bold text-primary tracking-wide">
                  ANDHRA UNIVERSITY
                </CardTitle>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold">OFFICIAL MEMORANDUM NO : {result.resultId}</p>
              <p className="text-sm">MEMORANDUM OF {result.subjects[0]?.marksAwarded ? 'MARKS' : 'GRADE FOR'} {result.course} DEGREE EXAMINATION</p>
              {result.college && <p className="text-sm">{result.college}</p>}
              <p className="text-sm">AT THE END OF {result.semester} - {result.year}</p>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex gap-8">
                <div className="flex gap-2">
                  <span className="font-semibold text-primary">NAME OF THE CANDIDATE :</span>
                  <span className="font-bold">{result.studentName}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">THE FOLLOWING MARKS WERE SECURED BY THE CANDIDATE</div>
                <div className="flex gap-2">
                  <span className="font-semibold text-primary">REGISTER NO:</span>
                  <span className="font-bold">{result.registerNo || result.rollNumber}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <Table className="border-2 border-accent">
                <TableHeader>
                  <TableRow className="border-accent">
                    <TableHead className="font-bold text-accent text-left border-r border-accent">Subjects</TableHead>
                    {result.subjects[0]?.marksAwarded ? (
                      <>
                        <TableHead className="font-bold text-accent text-center border-r border-accent">Marks<br />Awarded</TableHead>
                        <TableHead className="font-bold text-accent text-center border-r border-accent">Passing<br />Minimum<br />Marks</TableHead>
                        <TableHead className="font-bold text-accent text-center">Maximum<br />Marks</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="font-bold text-accent text-center border-r border-accent">SUBJECT<br />CREDITS</TableHead>
                        <TableHead className="font-bold text-accent text-center border-r border-accent">GRADE</TableHead>
                        <TableHead className="font-bold text-accent text-center border-r border-accent">POINTS</TableHead>
                        <TableHead className="font-bold text-accent text-center">TOTAL<br />GRADE<br />POINTS</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.subjects.map((subject, index) => (
                    <TableRow key={index} className="border-accent">
                      <TableCell className="font-medium border-r border-accent">{subject.name}</TableCell>
                      {subject.marksAwarded ? (
                        <>
                          <TableCell className="text-center border-r border-accent font-semibold">{subject.marksAwarded}</TableCell>
                          <TableCell className="text-center border-r border-accent">{subject.passingMinimum}</TableCell>
                          <TableCell className="text-center font-semibold">{subject.maximumMarks}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-center border-r border-accent">{subject.credits}</TableCell>
                          <TableCell className="text-center border-r border-accent font-semibold">{subject.grade}</TableCell>
                          <TableCell className="text-center border-r border-accent">{subject.points}</TableCell>
                          <TableCell className="text-center font-semibold">{subject.totalGradePoints}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  <TableRow className="border-accent border-t-2">
                    <TableCell className="font-bold border-r border-accent">TOTALS</TableCell>
                    {result.subjects[0]?.marksAwarded ? (
                      <>
                        <TableCell className="text-center font-bold border-r border-accent">{result.obtainedMarks || result.subjects.reduce((sum, s) => sum + (s.marksAwarded || 0), 0)}</TableCell>
                        <TableCell className="text-center font-bold border-r border-accent">{result.passingMarks || result.subjects.reduce((sum, s) => sum + (s.passingMinimum || 0), 0)}</TableCell>
                        <TableCell className="text-center font-bold">{result.totalMarks || result.subjects.reduce((sum, s) => sum + (s.maximumMarks || 0), 0)}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-center font-bold border-r border-accent">{result.totalCredits || result.subjects.reduce((sum, s) => sum + (s.credits || 0), 0)}</TableCell>
                        <TableCell className="border-r border-accent"></TableCell>
                        <TableCell className="border-r border-accent"></TableCell>
                        <TableCell className="text-center font-bold">{result.totalGradePoints || result.subjects.reduce((sum, s) => sum + (s.totalGradePoints || 0), 0)}</TableCell>
                      </>
                    )}
                  </TableRow>
                  {!result.subjects[0]?.marksAwarded && (
                    <TableRow className="border-accent">
                      <TableCell colSpan={5} className="py-2">
                        <div className="flex justify-between text-sm">
                          <span>SGPA (SEMESTER GRADE POINT AVERAGE) : <strong>{result.sgpa || ((result.totalCredits && result.totalGradePoints) ? (result.totalGradePoints / result.totalCredits).toFixed(2) : (result.subjects.reduce((sum, s) => sum + (s.totalGradePoints || 0), 0) / result.subjects.reduce((sum, s) => sum + (s.credits || 0), 0)).toFixed(2))}</strong></span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>CGPA (CUMULATIVE GRADE POINT AVERAGE) : <strong>{result.cgpa || '-'}</strong></span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mb-8 text-sm border border-accent p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="border-b border-accent pb-2 mb-2">
                    <span className="font-bold">GRADE</span>
                    <span className="ml-8">| 'O' | 'A+' | A | 'B+' | 'B' | 'C' | 'F' | 'Ab |</span>
                  </div>
                  <div>
                    <span className="font-bold">GRADE POINTS</span>
                    <span className="ml-2">| 10 | 9 | 8 | 7 | 6 | 5 | 0 | 0 |</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p><strong>NOTE:</strong> (1) MINIMUM GRADE FOR PASS IN THEORY : 'F'</p>
                <p className="ml-12">(2) MINIMUM GRADE FOR PASS IN PRACTICAL : 'C'</p>
                <p className="ml-12">(3) THE SESSIONAL MARKS OF THE FAILD SUBJECT WILL BE CARRIED</p>
                <p className="ml-16">TO THE NEXT EXAMINATION FOR THAT SUBJECT.</p>
              </div>
            </div>

            <div className="border-t border-accent pt-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-semibold">{result.place || "Visakhapatnam"}</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 relative">
                    <img 
                      src={controllerSignature}
                      alt="Controller Signature" 
                      className="h-12 w-auto mx-auto opacity-90 mix-blend-darken" 
                      style={{
                        filter: 'contrast(1.4) brightness(0.7) saturate(0.8) hue-rotate(-10deg)',
                        imageRendering: 'crisp-edges',
                        background: 'transparent'
                      }} 
                    />
                  </div>
                  <p className="text-sm font-semibold">For CONTROLLER OF EXAMINATIONS</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm">Date: {result.examDate || "07-08-2020"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultDisplay;
