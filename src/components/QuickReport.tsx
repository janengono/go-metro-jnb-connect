import { useState } from "react";
import { AlertTriangle, Clock, Wrench, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { db } from "../lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { BusType } from "@/components/types";
import { AppUser } from "@/context/AuthContext";

interface QuickReportProps {
  userMode: "commuter" | "driver";
  bus: BusType | null;
  user: AppUser | null;
}

const QuickReport = ({ bus, user }: QuickReportProps) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");

  // Map report type → bus status
  const statusMap: Record<string, string> = {
    Delay: "Delayed",
    Breakdown: "Broken",
    Emergency: "Emergency",
    Other: "Other",
  };

  const handleReport = async (type: string, customText?: string) => {
    if (!bus?.id) {
      console.warn("No bus selected for reporting");
      return;
    }

    const reportRef = doc(db, "reports", bus.id); // use bus.id as document ID
    const reportData = {
      busId: bus.id,
      type,
      details: customText?.trim() || type,
      timestamp: new Date().toISOString(),
      reporterId: user?.uid || null,
    };

    try {
      // Upsert report (create if missing, update if exists)
      await setDoc(reportRef, reportData, { merge: true });

      // Update bus status
      const status = statusMap[type] || "Other";
      await updateDoc(doc(db, "buses", bus.id), { status });

      toast({
        title: "Report Submitted",
        description: customText?.trim() || `Report "${type}" successfully sent.`,
      });

      // Reset "Other" input if used
      if (type === "Other") {
        setOtherText("");
        setShowOtherInput(false);
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast({
        title: "Error",
        description: "Could not send the report. Please try again.",
      });
    }
  };

  const reportOptions = [
    {
      icon: Clock,
      label: "Delay",
      color: "btn-warning",
      description: "Bus late or missing",
    },
    {
      icon: Wrench,
      label: "Breakdown",
      color: "bg-destructive text-destructive-foreground",
      description: "Bus mechanical issue",
    },
    {
      icon: AlertTriangle,
      label: "Emergency",
      color: "bg-destructive text-destructive-foreground",
      description: "Critical incident",
    },
    {
      icon: MessageSquare,
      label: "Other",
      color: "bg-muted text-muted-foreground hover:bg-muted/80",
      description: "General feedback",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {reportOptions.map((report, index) => (
          <Button
            key={index}
            variant="outline"
            className={`h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-300 ${report.color}`}
            onClick={() => {
              if (report.label === "Other") {
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
              onClick={() => handleReport("Other", otherText)}
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
