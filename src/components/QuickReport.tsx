import { useState } from "react";
import { AlertTriangle, Clock, Users, Wrench, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Or use <textarea> styled
import { toast } from "@/hooks/use-toast";

interface QuickReportProps {
  userMode: "commuter" | "driver";
}

const QuickReport = ({ userMode }: QuickReportProps) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");

  const handleReport = (type: string, customText?: string) => {
    toast({
      title: "Report Submitted",
      description:
        customText && customText.trim().length > 0
          ? customText
          : `Your ${type.toLowerCase()} report has been sent to the control center.`,
    });

    // reset state after submission
    setShowOtherInput(false);
    setOtherText("");
  };

  const commuterReports = [
    { icon: Clock, label: "Bus Delay", color: "btn-warning", description: "Report late or missing bus" },
    { icon: Users, label: "Overcrowding", color: "btn-warning", description: "Bus is too full" },
    { icon: Wrench, label: "Breakdown", color: "bg-destructive text-destructive-foreground", description: "Bus mechanical issues" },
    { icon: MessageSquare, label: "Other Issue", color: "bg-muted text-muted-foreground hover:bg-muted/80", description: "General feedback (please write your report in the box below)" }
  ];

  const driverReports = [
    { icon: Wrench, label: "Vehicle Issue", color: "bg-destructive text-destructive-foreground", description: "Mechanical problems" },
    { icon: AlertTriangle, label: "Route Problem", color: "btn-warning", description: "Road blocks, accidents" },
    { icon: Users, label: "Passenger Issue", color: "bg-info text-info-foreground", description: "Disputes, assistance needed" },
    { icon: Clock, label: "Schedule Update", color: "btn-success", description: "Running ahead/behind" }
  ];

  const reports = userMode === "commuter" ? commuterReports : driverReports;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {reports.map((report, index) => (
          <Button
            key={index}
            variant="outline"
            className={`h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-300 ${report.color}`}
            onClick={() => {
              if (report.label === "Other Issue") {
                setShowOtherInput(true);
              } else {
                handleReport(report.label);
              }
            }}
          >
            <report.icon className="h-5 w-5" />
            <div className="text-center">
              <div className="text-sm font-medium">{report.label}</div>
              <div className="text-xs opacity-75 mt-1">{report.description}</div>
            </div>
          </Button>
        ))}
      </div>

      {showOtherInput && (
        <div className="mt-4 space-y-3">
          <textarea
            value={otherText}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/);
              if (words.length <= 200) {
                setOtherText(e.target.value);
              }
            }}
            placeholder="Describe your issue (max 200 words)"
            className="w-full border rounded-md p-2 text-sm"
            rows={4}
          />
          <div className="flex justify-center">
          <Button 
            className="w-full max-w-sm"
            disabled={otherText.trim().length === 0}
            onClick={() => handleReport("Other Issue", otherText)}
          >
            Submit
          </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReport;
