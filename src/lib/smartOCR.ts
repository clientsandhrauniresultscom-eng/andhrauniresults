import Tesseract from 'tesseract.js';

export interface ExtractedData {
  studentName: string;
  rollNumber: string;
  year: string;
  subjects: {
    code: string;
    name: string;
    marksAwarded: number;
    passingMinimum: number;
    maximumMarks: number;
  }[];
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
  minimumMarks: number;
  percentage: number;
  sgpa?: string;
  cgpa?: string;
  totalCredits?: number;
  totalGradePoints?: number;
  confidence: number;
  source: 'tesseract' | 'ocr.space';
}

const parseMarksFromText = (text: string): ExtractedData => {
  let studentName = '';
  let rollNumber = '';
  let year = new Date().getFullYear().toString();
  let subjects: any[] = [];
  let totalMarks = 0;
  let obtainedMarks = 0;
  let passingMarks = 0;
  let minimumMarks = 35;
  let sgpa = '';
  let cgpa = '';
  let totalCredits = 0;
  let totalGradePoints = 0;
  let confidence = 0;

  // Extract Roll Number
  const rollMatch = text.match(/(?:roll|register|hall ticket|reg\.?|no\.?|rt\.?)\s*(?:no\.?|#)?\s*[:\-]?\s*([A-Z0-9]{6,15})/i);
  if (rollMatch) {
    rollNumber = rollMatch[1].toUpperCase();
    confidence += 20;
  }

  // Extract Student Name
  const nameMatch = text.match(/NAME OF THE CANDIDATE\s*[:\-]?\s*\n?([A-Za-z\s]+?)(?=\n|$)/i);
  if (nameMatch) {
    studentName = nameMatch[1].trim();
    confidence += 20;
  }

  // Extract Year
  const yearMatch = text.match(/(?:year|exam|passing)\s*(?:of)?\s*[:\-]?\s*(20\d{2})/i);
  if (yearMatch) {
    year = yearMatch[1];
    confidence += 10;
  }

  // Extract SGPA
  const sgpaMatch = text.match(/SGPA.*?:\s*([\d.]+)/i);
  if (sgpaMatch) sgpa = sgpaMatch[1];

  // Extract CGPA
  const cgpaMatch = text.match(/CGPA.*?:\s*([\d.]+)/i);
  if (cgpaMatch) cgpa = cgpaMatch[1];

  // Parse subjects with marks (tabular format)
  const lines = text.split('\n');
  let foundMarksTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect marks table
    if (line.toLowerCase().includes('subject') && (line.toLowerCase().includes('marks') || line.toLowerCase().includes('awarded'))) {
      foundMarksTable = true;
      continue;
    }
    
    if (foundMarksTable && line && !line.includes('TOTALS') && !line.includes('GRADE|') && 
        !line.includes('NOTE:') && !line.includes('GRADE POINTS') && !line.includes('GRADE|')) {
      
      // Try to parse subject line - looking for subject name and marks
      const parts = line.split(/\t|  +/).filter(p => p.trim());
      
      // Pattern: Subject Name | Marks Awarded | Max Marks | etc
      if (parts.length >= 2) {
        const name = parts[0]?.trim() || '';
        const marksStr = parts[1]?.trim() || '0';
        const maxStr = parts[2]?.trim() || '100';
        
        // Check if it looks like a valid entry
        if (name && !name.includes('TOTAL') && !name.includes('GRADE')) {
          const marksAwarded = parseInt(marksStr.replace(/[^0-9]/g, '')) || 0;
          const maxMarks = parseInt(maxStr.replace(/[^0-9]/g, '')) || 100;
          
          if (marksAwarded >= 0 && maxMarks > 0) {
            const subject: any = {
              code: '',
              name: name,
              marksAwarded: marksAwarded,
              passingMinimum: minimumMarks,
              maximumMarks: maxMarks
            };
            subjects.push(subject);
            obtainedMarks += marksAwarded;
            totalMarks += maxMarks;
          }
        }
      }
    }
  }

  // If no marks table found, try CGPA-based format
  if (subjects.length === 0 && (sgpa || cgpa)) {
    confidence += 20;
    // Parse subjects with grades
    let foundGrades = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toUpperCase().includes('SUBJECT') && trimmed.toUpperCase().includes('GRADE')) {
        foundGrades = true;
        continue;
      }
      
      if (foundGrades && trimmed && !trimmed.includes('TOTALS') && !trimmed.includes('NOTE:')) {
        const parts = trimmed.split(/\t|  +/).filter(p => p.trim());
        if (parts.length >= 2) {
          const gradePoints: Record<string, number> = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0, 'Ab': 0 };
          const grade = parts[1]?.trim().toUpperCase() || '';
          const points = gradePoints[grade] || 0;
          
          const subject: any = {
            code: '',
            name: parts[0] || '',
            credits: 0,
            grade: grade,
            points: points,
            totalGradePoints: points
          };
          subjects.push(subject);
          totalGradePoints += points;
        }
      }
    }
  }

  // Calculate passing marks
  if (subjects.length > 0) {
    passingMarks = subjects.length * minimumMarks;
    if (sgpa || cgpa) {
      passingMarks = 0;
    }
  }

  // Calculate percentage
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 10000) / 100 : 0;
  
  // Adjust confidence based on data found
  if (studentName) confidence += 10;
  if (rollNumber) confidence += 10;
  if (subjects.length > 0) confidence += 20;
  if (percentage > 0) confidence += 10;
  
  // Cap confidence at 100
  confidence = Math.min(confidence, 100);

  return {
    studentName,
    rollNumber,
    year,
    subjects,
    totalMarks,
    obtainedMarks,
    passingMarks,
    minimumMarks,
    percentage,
    sgpa: sgpa || undefined,
    cgpa: cgpa || undefined,
    totalCredits: totalCredits || undefined,
    totalGradePoints: totalGradePoints || undefined,
    confidence
  };
};

export const extractWithTesseract = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ExtractedData> => {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    const text = result.data.text;
    console.log('Tesseract extracted text:', text);
    
    const extracted = parseMarksFromText(text);
    extracted.source = 'tesseract';
    
    return extracted;
  } catch (error) {
    console.error('Tesseract error:', error);
    throw error;
  }
};

export const extractWithOcrSpace = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ExtractedData> => {
  try {
    if (onProgress) onProgress(10);
    
    const formDataFile = new FormData();
    formDataFile.append('file', file);
    formDataFile.append('language', 'eng');
    formDataFile.append('isOverlayRequired', 'false');
    formDataFile.append('detectOrientation', 'true');
    formDataFile.append('scale', 'true');
    formDataFile.append('OCREngine', '2');

    if (onProgress) onProgress(30);

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'helloworld'
      },
      body: formDataFile
    });

    if (onProgress) onProgress(70);

    const data = await response.json();
    
    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage[0]);
    }

    const extractedText = data.ParsedResults[0]?.ParsedText || '';
    console.log('OCR.space extracted text:', extractedText);
    
    if (onProgress) onProgress(90);

    const extracted = parseMarksFromText(extractedText);
    extracted.source = 'ocr.space';
    
    if (onProgress) onProgress(100);
    
    return extracted;
  } catch (error) {
    console.error('OCR.space error:', error);
    throw error;
  }
};

export const smartExtract = async (
  file: File,
  onProgress?: (progress: number, source: string) => void
): Promise<ExtractedData> => {
  // Try Tesseract first (free, browser-based)
  try {
    if (onProgress) onProgress(0, 'tesseract');
    const result = await extractWithTesseract(file, onProgress);
    if (result.confidence >= 50 || result.studentName || result.rollNumber) {
      return result;
    }
  } catch (error) {
    console.warn('Tesseract failed, trying OCR.space:', error);
  }

  // Fallback to OCR.space
  try {
    if (onProgress) onProgress(0, 'ocr.space');
    const result = await extractWithOcrSpace(file, onProgress);
    return result;
  } catch (error) {
    console.error('OCR.space also failed:', error);
    throw new Error('All OCR methods failed. Please try uploading a clearer image.');
  }
};
