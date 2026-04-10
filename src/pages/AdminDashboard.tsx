import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, LogOut, Trash2, Loader2, Upload, GraduationCap, Pencil, ChevronLeft, ChevronRight, Sparkles, X, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { smartExtract } from '@/lib/smartOCR';
import universityLogo from '@/assets/university-logo.png';

interface Result {
  id: string;
  student_name: string;
  roll_number: string;
  register_number: string;
  course: string;
  branch: string;
  semester: string;
  year: string;
  result_id: string;
  college: string;
  result: string;
  created_at: string;
  percentage?: number;
}

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

interface ResultFormData {
  studentName: string;
  rollNumber: string;
  registerNumber: string;
  course: string;
  branch: string;
  semester: string;
  year: string;
  resultId: string;
  college: string;
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passingMarks: number;
  minimumMarks: number;
  result: string;
  sgpa: string;
  cgpa: string;
  totalCredits: number;
  totalGradePoints: number;
  examDate: string;
  place: string;
}

const COURSE_TEMPLATES = [
  { course: 'B.A', branch: 'Arts', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Physics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Chemistry', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Mathematics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Computer Science', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Biotechnology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Microbiology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Zoology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Botany', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Statistics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Electronics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Home Science', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Fashion Technology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Agricultural Science', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Food Technology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'Nutrition & Dietetics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Sc', branch: 'MLT', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Com', branch: 'General', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Com', branch: 'Computers', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Com', branch: 'Taxation', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Com', branch: 'Finance', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Com', branch: 'Bank Management', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.B.A', branch: 'General', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.B.A', branch: 'Hospital Management', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.B.A', branch: 'Digital Marketing', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.C.A', branch: 'Computer Applications', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.C.A', branch: 'Cloud Computing', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.C.A', branch: 'Data Science', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.Lib', branch: 'Library Science', semesters: ['FIRST YEAR'] },
  { course: 'B.Ed', branch: 'Education', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'B.P.Ed', branch: 'Physical Education', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'B.Li.Sc', branch: 'Library Science', semesters: ['FIRST YEAR'] },
  { course: 'B.Tech', branch: 'Computer Science Engineering', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Tech', branch: 'Electronics & Communication Engineering', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Tech', branch: 'Electrical Engineering', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Tech', branch: 'Mechanical Engineering', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Tech', branch: 'Civil Engineering', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Tech', branch: 'Information Technology', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Tech', branch: 'Chemical Engineering', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Tech', branch: 'Biotechnology', semesters: ['FIRST SEMESTER', 'SECOND SEMESTER', 'THIRD SEMESTER', 'FOURTH SEMESTER', 'FIFTH SEMESTER', 'SIXTH SEMESTER', 'SEVENTH SEMESTER', 'EIGHTH SEMESTER'] },
  { course: 'B.Pharm', branch: 'Pharmacy', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR'] },
  { course: 'B.Sc Nursing', branch: 'Nursing', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR'] },
  { course: 'B.D.S', branch: 'Dental Surgery', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR', 'FIFTH YEAR'] },
  { course: 'B.A.M.S', branch: 'Ayurveda', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR', 'FIFTH YEAR'] },
  { course: 'B.U.M.S', branch: 'Unani', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR'] },
  { course: 'B.H.M.S', branch: 'Homeopathy', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR', 'FIFTH YEAR'] },
  { course: 'LL.B', branch: 'Law', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'LL.B', branch: 'Criminal Law', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'B.V.Sc', branch: 'Veterinary Science', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR', 'FIFTH YEAR'] },
  { course: 'B.F.Sc', branch: 'Fisheries Science', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR'] },
  { course: 'B.A.LL.B', branch: 'Law', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FOURTH YEAR', 'FIFTH YEAR'] },
  { course: 'M.A', branch: 'Telugu', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'English', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Hindi', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Sanskrit', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'History', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Economics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Political Science', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Sociology', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Psychology', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Philosophy', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Journalism & Mass Communication', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.A', branch: 'Social Work', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Physics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Chemistry', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Mathematics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Computer Science', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Biotechnology', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Microbiology', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Zoology', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Botany', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Statistics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Electronics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Environmental Science', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Data Science', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc', branch: 'Artificial Intelligence', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Com', branch: 'General', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Com', branch: 'Finance', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Com', branch: 'Taxation', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'General', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'Hospital Management', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'Human Resources', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'Finance', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'Marketing', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'Operations', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'Business Analytics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.B.A', branch: 'Digital Marketing', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.C.A', branch: 'Computer Applications', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.C.A', branch: 'Cloud Computing', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.C.A', branch: 'Data Science', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.Lib', branch: 'Library Science', semesters: ['FIRST YEAR'] },
  { course: 'M.Ed', branch: 'Education', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.P.Ed', branch: 'Physical Education', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'Computer Science Engineering', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'VLSI Design', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'Embedded Systems', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'Power Electronics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'Structural Engineering', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'Thermal Engineering', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'Data Science', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Tech', branch: 'Artificial Intelligence', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Pharm', branch: 'Pharmaceutics', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Pharm', branch: 'Pharmacology', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Pharm', branch: 'Pharmaceutical Chemistry', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Pharm', branch: 'Quality Assurance', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc Nursing', branch: 'Medical Surgical Nursing', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc Nursing', branch: 'Psychiatric Nursing', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc Nursing', branch: 'Child Health Nursing', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Sc Nursing', branch: 'Community Health Nursing', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'LL.M', branch: 'Law', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'LL.M', branch: 'Criminal Law', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'LL.M', branch: 'Constitutional Law', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.S', branch: 'General Surgery', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.S', branch: 'Orthopaedics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.S', branch: 'Ophthalmology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.S', branch: 'ENT', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'General Medicine', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Pediatrics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Dermatology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Psychiatry', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Anesthesiology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Radiology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Pathology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Microbiology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Biochemistry', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Anatomy', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Physiology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Pharmacology', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D', branch: 'Community Medicine', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D.S', branch: 'Oral Surgery', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D.S', branch: 'Orthodontics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D.S', branch: 'Periodontics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D.S', branch: 'Conservative Dentistry', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D.S', branch: 'Pedodontics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.D.S', branch: 'Prosthodontics', semesters: ['FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR'] },
  { course: 'M.V.Sc', branch: 'Veterinary Science', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
  { course: 'M.Phil', branch: 'Arts', semesters: ['FIRST YEAR'] },
  { course: 'M.Phil', branch: 'Science', semesters: ['FIRST YEAR'] },
  { course: 'P.G.D.C.A', branch: 'Computer Applications', semesters: ['FIRST YEAR'] },
  { course: 'P.G.D.B.M', branch: 'Management', semesters: ['FIRST YEAR'] },
  { course: 'D.Pharm', branch: 'Pharmacy', semesters: ['FIRST YEAR', 'SECOND YEAR'] },
];

const generateResultId = () => {
  const num = Math.floor(Math.random() * 900) + 100;
  return `${num}(1)/${new Date().getFullYear()}`;
};

const generateVerificationCode = (rollNumber: string, year: string) => {
  return `AU${year.slice(-2)}VER${rollNumber}`;
};

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrSource, setOcrSource] = useState('tesseract');
  const [assessmentType, setAssessmentType] = useState<'marks' | 'credits'>('marks');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<ResultFormData>({
    studentName: '',
    rollNumber: '',
    registerNumber: '',
    course: '',
    branch: '',
    semester: '',
    year: new Date().getFullYear().toString(),
    resultId: '',
    college: '',
    subjects: [],
    totalMarks: 0,
    obtainedMarks: 0,
    percentage: 0,
    passingMarks: 0,
    minimumMarks: 35,
    result: 'PASS',
    sgpa: '',
    cgpa: '',
    totalCredits: 0,
    totalGradePoints: 0,
    examDate: '',
    place: 'Visakhapatnam'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchResults();
  }, [isAuthenticated]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({ title: 'Error', description: 'Failed to fetch results', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCourseSelect = (courseKey: string) => {
    const template = COURSE_TEMPLATES[parseInt(courseKey)];
    if (template) {
      setFormData({
        ...formData,
        course: template.course,
        branch: template.branch,
        semester: template.semesters[0]
      });
      setSelectedCourse(courseKey);
    }
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalCredits = formData.subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
      const totalGradePoints = formData.subjects.reduce((sum, s) => sum + (s.totalGradePoints || 0), 0);
      
      const { error } = await supabase.from('results').insert({
        student_name: formData.studentName,
        roll_number: formData.rollNumber,
        register_number: formData.registerNumber || formData.rollNumber,
        course: formData.course,
        branch: formData.branch,
        semester: formData.semester,
        year: formData.year,
        result_id: formData.resultId || generateResultId(),
        college: formData.college,
        subjects: formData.subjects as any,
        total_marks: formData.totalMarks,
        obtained_marks: formData.obtainedMarks,
        percentage: formData.percentage,
        result: formData.result,
        sgpa: formData.sgpa ? parseFloat(formData.sgpa) : null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        total_credits: totalCredits,
        total_grade_points: totalGradePoints,
        verification_code: generateVerificationCode(formData.rollNumber, formData.year)
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Result added successfully' });
      setIsAddDialogOpen(false);
      fetchResults();
      resetForm();
    } catch (error: any) {
      console.error('Error adding result:', error);
      toast({ title: 'Error', description: 'Failed to add result', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setOcrProgress(0);
    
    try {
      const extracted = await smartExtract(file, (progress, source) => {
        setOcrProgress(progress);
        setOcrSource(source);
      });

      setFormData({
        ...formData,
        studentName: extracted.studentName || formData.studentName,
        rollNumber: extracted.rollNumber || formData.rollNumber,
        year: extracted.year || formData.year,
        subjects: extracted.subjects || formData.subjects,
        totalMarks: extracted.totalMarks || formData.totalMarks,
        obtainedMarks: extracted.obtainedMarks || formData.obtainedMarks,
        percentage: extracted.percentage || formData.percentage,
      });

      toast({ title: 'Data Extracted', description: 'Found student data. Please verify.' });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({ title: 'OCR Failed', description: 'Could not extract data automatically.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    try {
      const { error } = await supabase.from('results').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Result deleted successfully' });
      fetchResults();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete result', variant: 'destructive' });
    }
  };

  const handleEditResult = (result: any) => {
    setFormData({
      studentName: result.student_name || '',
      rollNumber: result.roll_number || '',
      registerNumber: result.register_number || '',
      course: result.course || '',
      branch: result.branch || '',
      semester: result.semester || '',
      year: result.year || '',
      resultId: result.result_id || '',
      college: result.college || '',
      subjects: result.subjects || [],
      totalMarks: result.total_marks || 0,
      obtainedMarks: result.obtained_marks || 0,
      percentage: result.percentage || 0,
      passingMarks: result.passing_marks || 0,
      minimumMarks: result.minimum_marks || 35,
      result: result.result || 'PASS',
      sgpa: result.sgpa || '',
      cgpa: result.cgpa || '',
      totalCredits: result.total_credits || 0,
      totalGradePoints: result.total_grade_points || 0,
      examDate: result.exam_date || '',
      place: result.place || 'Visakhapatnam'
    });
    setEditingId(result.id);
    setIsEditDialogOpen(true);
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setIsSubmitting(true);

    try {
      const totalCredits = formData.subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
      const totalGradePoints = formData.subjects.reduce((sum, s) => sum + (s.totalGradePoints || 0), 0);
      
      const { error } = await supabase.from('results').update({
        student_name: formData.studentName,
        roll_number: formData.rollNumber,
        course: formData.course,
        semester: formData.semester,
        year: formData.year,
        subjects: formData.subjects as any,
        total_marks: formData.totalMarks,
        obtained_marks: formData.obtainedMarks,
        percentage: formData.percentage,
        result: formData.result,
        sgpa: formData.sgpa ? parseFloat(formData.sgpa) : null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        total_credits: totalCredits,
        total_grade_points: totalGradePoints
      }).eq('id', editingId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Result updated successfully' });
      setIsEditDialogOpen(false);
      setEditingId(null);
      fetchResults();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update result', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCourse('');
    setSelectedYearLevel('');
    setSelectedSemester('');
    setFormData({
      studentName: '', rollNumber: '', registerNumber: '', course: '', branch: '', semester: '',
      year: new Date().getFullYear().toString(), resultId: '', college: '', subjects: [],
      totalMarks: 0, obtainedMarks: 0, percentage: 0, passingMarks: 0, minimumMarks: 35,
      result: 'PASS', sgpa: '', cgpa: '', totalCredits: 0, totalGradePoints: 0, examDate: '', place: 'Visakhapatnam'
    });
  };

  const addSubject = () => {
    const newSubject = { name: '', code: '', credits: 0, grade: '', points: 0, totalGradePoints: 0, marksAwarded: 0, maximumMarks: 100 };
    setFormData({ ...formData, subjects: [...formData.subjects, newSubject as any] });
  };

  const removeSubject = (index: number) => {
    const updated = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: updated });
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const updated = [...formData.subjects];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'credits') {
      updated[index].totalGradePoints = value * (updated[index].points || 0);
    } else if (field === 'grade') {
      const gradePoints: Record<string, number> = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0, 'Ab': 0 };
      updated[index].points = gradePoints[value] || 0;
      updated[index].totalGradePoints = (updated[index].credits || 0) * (gradePoints[value] || 0);
    }
    setFormData({ ...formData, subjects: updated });
  };

  const renderGradeSelect = (index: number, subject: any, className: string) => (
    <Select value={subject.grade || ''} onValueChange={(v) => updateSubject(index, 'grade', v)}>
      <SelectTrigger className={className}><SelectValue placeholder="Grade" /></SelectTrigger>
      <SelectContent>
        {['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'Ab'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const filteredResults = results.filter(r => 
    r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.roll_number.includes(searchTerm) || 
    r.course.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(r => resultFilter === 'all' || r.result === resultFilter);

  const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src={universityLogo} alt="Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Andhra University</h1>
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardHeader><CardTitle className="text-sm font-medium">Total Results</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{results.length}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm font-medium">Pass Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{results.length > 0 ? `${Math.round((results.filter(r => r.result === 'PASS').length / results.length) * 100)}%` : '0%'}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm font-medium">Recent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{results.slice(0, 5).length}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Results Repository</CardTitle></div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Result</Button></DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Add New Result</DialogTitle></DialogHeader>
                  <div className="space-y-6 mt-4">
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-primary/30 bg-primary/5'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}>
                      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-lg font-semibold text-primary">Upload & Drop File Here</p>
                          <p className="text-sm text-muted-foreground">PDF, PNG, JPG (Max 10MB)</p>
                        </div>
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                          {isUploading ? 'Processing...' : 'Select File to Auto-Extract Data'}
                        </Button>
                      </div>
                    </div>
                    <form onSubmit={handleAddResult} className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} required /></div>
                        <div className="space-y-2"><Label>Roll No</Label><Input value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value.toUpperCase()})} required /></div>
                        <div className="space-y-2"><Label>Year of Passout</Label><Input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required /></div>
                        <div className="space-y-2"><Label>Course</Label><Select value={selectedCourse} onValueChange={(val) => { setSelectedCourse(val); setSelectedBranch(''); const template = COURSE_TEMPLATES[parseInt(val)]; if (template) { setFormData({...formData, course: template.course, branch: template.branch, semester: template.semesters[0]}); } }}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select Course" /></SelectTrigger>
                          <SelectContent>
                            {COURSE_TEMPLATES.map((t, i) => <SelectItem key={i} value={i.toString()}>{t.course} - {t.branch}</SelectItem>)}
                          </SelectContent>
                        </Select></div>
                        <div className="space-y-2"><Label>Year/Sem</Label><Select value={selectedYearLevel} onValueChange={(val) => { setSelectedYearLevel(val); setSelectedSemester(''); setFormData({...formData, semester: ''}); }}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select Year" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIRST YEAR">FIRST YEAR</SelectItem>
                            <SelectItem value="SECOND YEAR">SECOND YEAR</SelectItem>
                            <SelectItem value="THIRD YEAR">THIRD YEAR</SelectItem>
                            <SelectItem value="FOURTH YEAR">FOURTH YEAR</SelectItem>
                            <SelectItem value="FIFTH YEAR">FIFTH YEAR</SelectItem>
                          </SelectContent>
                        </Select></div>
                        <div className="space-y-2"><Label>Semester</Label><Select value={selectedSemester} onValueChange={(val) => { setSelectedSemester(val); setFormData({...formData, semester: `${selectedYearLevel} - ${val}`}); }} disabled={!selectedYearLevel}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                          <SelectContent>
                            {selectedYearLevel === 'FIRST YEAR' && (<><SelectItem value="SEM 1">SEM 1 (Odd)</SelectItem><SelectItem value="SEM 2">SEM 2 (Even)</SelectItem></>)}
                            {selectedYearLevel === 'SECOND YEAR' && (<><SelectItem value="SEM 3">SEM 3 (Odd)</SelectItem><SelectItem value="SEM 4">SEM 4 (Even)</SelectItem></>)}
                            {selectedYearLevel === 'THIRD YEAR' && (<><SelectItem value="SEM 5">SEM 5 (Odd)</SelectItem><SelectItem value="SEM 6">SEM 6 (Even)</SelectItem></>)}
                            {selectedYearLevel === 'FOURTH YEAR' && (<><SelectItem value="SEM 7">SEM 7 (Odd)</SelectItem><SelectItem value="SEM 8">SEM 8 (Even)</SelectItem></>)}
                            {selectedYearLevel === 'FIFTH YEAR' && (<><SelectItem value="SEM 9">SEM 9 (Odd)</SelectItem><SelectItem value="SEM 10">SEM 10 (Even)</SelectItem></>)}
                          </SelectContent>
                        </Select></div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Label className="font-medium">Assessment Type:</Label>
                        <Select value={assessmentType} onValueChange={(val) => { setAssessmentType(val as 'marks' | 'credits'); setFormData({...formData, subjects: []}); }}>
                          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="marks">Marks Based</SelectItem><SelectItem value="credits">Credit Based (CGPA)</SelectItem></SelectContent>
                        </Select>
                      </div>
                      
                      {assessmentType === 'credits' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>SGPA (Current Semester)</Label>
                            <Input 
                              value={formData.sgpa} 
                              onChange={(e) => setFormData({...formData, sgpa: e.target.value})} 
                              placeholder="e.g. 8.5"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CGPA (Overall)</Label>
                            <Input 
                              value={formData.cgpa} 
                              onChange={(e) => setFormData({...formData, cgpa: e.target.value})} 
                              placeholder="e.g. 8.7"
                            />
                          </div>
                        </div>
                      )}
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center"><Label className="text-base font-semibold">Subjects</Label><Button type="button" variant="outline" size="sm" onClick={addSubject}>Add Subject</Button></div>
                        {assessmentType === 'credits' && (
                          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2">
                            <div className="col-span-3">Subject</div>
                            <div className="col-span-2">Credits</div>
                            <div className="col-span-2">Grade</div>
                            <div className="col-span-1">Points</div>
                            <div className="col-span-2">Total GP</div>
                            <div className="col-span-1"></div>
                            <div className="col-span-1"></div>
                          </div>
                        )}
                        {assessmentType === 'marks' && (
                          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2">
                            <div className="col-span-8">Subject</div>
                            <div className="col-span-3">Marks</div>
                            <div className="col-span-1"></div>
                          </div>
                        )}
                        {formData.subjects.map((s, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 items-center">
                            {assessmentType === 'credits' ? (
                              <>
                                <div className="col-span-3"><Input placeholder="Subject Name" value={s.name} onChange={(e) => updateSubject(i, 'name', e.target.value)} /></div>
                                <div className="col-span-2"><Input type="number" placeholder="Credits" value={s.credits ?? ''} onChange={(e) => updateSubject(i, 'credits', parseInt(e.target.value) || 0)} /></div>
                                <div className="col-span-2"><Select value={s.grade || ''} onValueChange={(v) => updateSubject(i, 'grade', v)}>
                                  <SelectTrigger className="w-full"><SelectValue placeholder="Grade" /></SelectTrigger>
                                  <SelectContent>{['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'Ab'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                                </Select></div>
                                <div className="col-span-1"><Input type="number" placeholder="Pts" value={s.points ?? ''} onChange={(e) => { updateSubject(i, 'points', parseInt(e.target.value) || 0); updateSubject(i, 'totalGradePoints', (s.credits || 0) * (parseInt(e.target.value) || 0)); }} /></div>
                                <div className="col-span-2"><Input type="number" placeholder="Total" value={s.totalGradePoints ?? ''} readOnly className="bg-muted" /></div>
                                <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => removeSubject(i)}><X className="h-4 w-4 text-destructive" /></Button></div>
                              </>
                            ) : (
                              <>
                                <div className="col-span-8"><Input placeholder="Subject" value={s.name} onChange={(e) => updateSubject(i, 'name', e.target.value)} /></div>
                                <div className="col-span-3"><Input type="number" placeholder="Marks" value={s.marksAwarded || ''} onChange={(e) => updateSubject(i, 'marksAwarded', parseInt(e.target.value) || 0)} /></div>
                                <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => removeSubject(i)}><X className="h-4 w-4 text-destructive" /></Button></div>
                              </>
                            )}
                          </div>
                        ))}
                        {assessmentType === 'credits' && (
                          <div className="flex justify-end gap-8 pt-2 border-t">
                            <div className="text-sm"><span className="text-muted-foreground">Total Credits:</span> <span className="font-medium">{formData.subjects.reduce((sum, s) => sum + (s.credits || 0), 0)}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Total Grade Points:</span> <span className="font-medium">{formData.subjects.reduce((sum, s) => sum + (s.totalGradePoints || 0), 0)}</span></div>
                          </div>
                        )}
                        {assessmentType === 'marks' && (
                          <div className="flex justify-end gap-8 pt-2 border-t">
                            <div className="text-sm"><span className="text-muted-foreground">Total Marks:</span> <span className="font-medium">{formData.subjects.reduce((sum, s) => sum + (s.marksAwarded || 0), 0)}</span></div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancel</Button><Button type="submit" disabled={isSubmitting}>Save Result</Button></div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <Select value={resultFilter} onValueChange={setResultFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="PASS">Pass</SelectItem><SelectItem value="FAIL">Fail</SelectItem></SelectContent></Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Roll No</TableHead><TableHead>Course</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paginatedResults.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>{res.student_name}</TableCell><TableCell>{res.roll_number}</TableCell><TableCell>{res.course}</TableCell><TableCell>{res.year}</TableCell>
                      <TableCell><Badge variant={res.result === 'PASS' ? 'default' : 'destructive'}>{res.result}</Badge></TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => handleEditResult(res)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteResult(res.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>Edit Result</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdateResult} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Roll No</Label><Input value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value.toUpperCase()})} required /></div>
                <div className="space-y-2"><Label>SGPA</Label><Input value={formData.sgpa} onChange={(e) => setFormData({...formData, sgpa: e.target.value})} /></div>
                <div className="space-y-2"><Label>CGPA</Label><Input value={formData.cgpa} onChange={(e) => setFormData({...formData, cgpa: e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>Update</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}