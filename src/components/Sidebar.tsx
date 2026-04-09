import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Phone, Mail, Clock, AlertCircle, BookOpen, GraduationCap, Award, Users } from "lucide-react";

const Sidebar = () => {
  const announcements = [
    {
      title: "Winter 2024 Results Published",
      date: "15 Jan 2025",
      content: "Results for all courses are now available online."
    },
    {
      title: "Revaluation Process",
      date: "10 Jan 2025", 
      content: "Applications accepted until 31st January 2025."
    },
    {
      title: "Convocation Ceremony",
      date: "05 Jan 2025",
      content: "Grand convocation scheduled for March 2025."
    }
  ];

  const importantDates = [
    { event: "Revaluation Deadline", date: "31 Jan 2025" },
    { event: "Next Semester Registration", date: "15 Feb 2025" },
    { event: "Summer Exams Begin", date: "01 May 2025" },
    { event: "Convocation Ceremony", date: "15 Mar 2025" }
  ];

  const quickLinks = [
    { icon: GraduationCap, label: "Student Portal", href: "#" },
    { icon: Award, label: "Certificate Verification", href: "#" },
    { icon: Users, label: "Faculty Directory", href: "#" },
  ];

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Quick Links */}
      <Card className="border-accent/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <link.icon className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">{link.label}</span>
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Latest Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {announcements.map((announcement, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-accent">{announcement.title}</h4>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{announcement.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{announcement.content}</p>
              {index < announcements.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card className="border-accent/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {importantDates.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
              <span className="text-sm font-medium text-accent">{item.event}</span>
              <span className="text-sm text-primary font-semibold bg-accent/10 px-2 py-1 rounded">{item.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Helpdesk */}
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Helpdesk Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email Support</p>
                <p className="text-sm font-medium">examinations@andhrauniversity.ac.in</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Working Hours</p>
                <p className="text-sm font-medium">Mon-Fri: 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <span className="text-sm font-semibold text-accent block mb-2">Need Help?</span>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your register number carefully</li>
              <li>• Enter your correct year of passout</li>
              <li>• Results are updated in real-time</li>
              <li>• Contact support for discrepancies</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
