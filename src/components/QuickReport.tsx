import { AlertTriangle, Clock, Users, Wrench, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface QuickReportProps {
  userMode: "commuter" | "driver";
}

const QuickReport = ({ userMode }: QuickReportProps) => {
  const handleReport = (type: string) => {
    toast({
      title: "Report Submitted",
      description: `Your ${type.toLowerCase()} report has been sent to the control center.`,
    });
  };

  const commuterReports = [
    {
      icon: Clock,
      label: "Bus Delay",
      color: "btn-warning",
      description: "Report late or missing bus"
    },
    {
      icon: Users,
      label: "Overcrowding",
      color: "btn-warning",
      description: "Bus is too full"
    },
    {
      icon: Wrench,
      label: "Breakdown",
      color: "bg-destructive text-destructive-foreground",
      description: "Bus mechanical issues"
    },
    {
      icon: MessageSquare,
      label: "Other Issue",
      color: "bg-muted text-muted-foreground hover:bg-muted/80",
      description: "General feedback"
    }
  ];

  const driverReports = [
    {
      icon: Wrench,
      label: "Vehicle Issue",
      color: "bg-destructive text-destructive-foreground",
      description: "Mechanical problems"
    },
    {
      icon: AlertTriangle,
      label: "Route Problem",
      color: "btn-warning",
      description: "Road blocks, accidents"
    },
    {
      icon: Users,
      label: "Passenger Issue",
      color: "bg-info text-info-foreground",
      description: "Disputes, assistance needed"
    },
    {
      icon: Clock,
      label: "Schedule Update",
      color: "btn-success",
      description: "Running ahead/behind"
    }
  ];

  const reports = userMode === "commuter" ? commuterReports : driverReports;

  return (
    <div className="grid grid-cols-2 gap-3">
      {reports.map((report, index) => (
        <Button
          key={index}
          variant="outline"
          className={`h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-300 ${report.color}`}
          onClick={() => handleReport(report.label)}
        >
          <report.icon className="h-5 w-5" />
          <div className="text-center">
            <div className="text-sm font-medium">{report.label}</div>
            <div className="text-xs opacity-75 mt-1">{report.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default QuickReport;