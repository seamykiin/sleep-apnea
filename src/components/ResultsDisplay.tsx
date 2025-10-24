import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDown,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generatePDF } from "@/lib/pdfGenerator";

interface ResultsDisplayProps {
  prediction: any; // Define a stricter type if possible based on your API response
}

const ResultsDisplay = ({ prediction }: ResultsDisplayProps) => {
  // --- START MODIFICATION ---
  // Map the model's output severity to either "Mild" or "Severe" for display
  const getDisplaySeverity = (originalSeverity: string): "Mild" | "Severe" => {
    const severityLower = originalSeverity?.toLowerCase();
    if (severityLower === "severe" || severityLower === "moderate") {
      return "Severe";
    }
    // Treat "Normal" and "Mild" as "Mild" for this binary display
    return "Mild";
  };

  const displaySeverity = getDisplaySeverity(prediction.severity);
  // --- END MODIFICATION ---

  const getSeverityColor = (severity: "Mild" | "Severe") => {
    // Adjusted colors for the binary display
    switch (severity) {
      case "Mild": // Use warning color for Mild/Normal combined
        return "bg-warning text-warning-foreground";
      case "Severe": // Use destructive color for Moderate/Severe combined
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: "Mild" | "Severe") => {
    // Adjusted icons for the binary display
    switch (severity) {
      case "Mild":
        return <AlertCircle className="w-6 h-6" />; // Icon for Mild/Normal
      case "Severe":
        return <AlertTriangle className="w-6 h-6" />; // Icon for Moderate/Severe
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const handleDownloadPDF = () => {
    // Generate PDF with the *original* severity from the model
    generatePDF(prediction);
  };

  if (!prediction) return null; // Added check

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className="p-8 shadow-medium bg-gradient-subtle">
        <div className="text-center mb-6">
          {prediction.patientData?.name && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Patient Name</p>
              <h3 className="text-xl font-semibold text-foreground">
                {prediction.patientData.name}
              </h3>
            </div>
          )}
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Prediction Results
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Use the mapped severity for icon and badge */}
            {getSeverityIcon(displaySeverity)}
            <Badge
              className={`text-lg px-6 py-2 ${getSeverityColor(
                displaySeverity
              )}`}
            >
              {displaySeverity}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Confidence Score</span>
              <span className="font-semibold text-foreground">
                {prediction.confidence}%
              </span>
            </div>
            <Progress value={prediction.confidence} className="h-2" />
          </div>
          {prediction.predictedAHI != null && ( // Check if AHI exists and is not null/undefined
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Predicted AHI (Model Estimate)
              </p>
              {/* Display the original predicted AHI */}
              <p className="text-2xl font-bold text-primary">
                {prediction.predictedAHI.toFixed(1)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Risk Factors (Keep as is) */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning" />
          Key Risk Factors
        </h3>
        <ul className="space-y-2">
          {prediction.riskFactors?.map((factor: string, index: number) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-warning mt-0.5">•</span>
              <span className="text-muted-foreground">{factor}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Clinical Interpretation (Keep as is - maybe adjust text if needed) */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-lg mb-3 text-foreground">
          Clinical Interpretation
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {/* Display original interpretation */}
          {prediction.interpretation}
          {/* Optional: Add a note about the displayed severity */}
          <span className="block mt-2 text-xs italic">
            {" "}
            (Note: Displayed severity simplifies Moderate/Severe into 'Severe'
            and Normal/Mild into 'Mild'.)
          </span>
        </p>
      </Card>

      {/* Recommendations (Keep as is) */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          Recommendations
        </h3>
        <ul className="space-y-3">
          {prediction.recommendations?.map((rec: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-success text-xs font-semibold">
                  {index + 1}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Clinical Notes (Keep as is) */}
      {prediction.clinicalNotes && (
        <Card className="p-6 shadow-soft bg-muted/30">
          <h3 className="font-semibold text-lg mb-3 text-foreground">
            Clinical Notes
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            {prediction.clinicalNotes}
          </p>
        </Card>
      )}

      {/* Download Button (Keep as is - PDF will use original data) */}
      <Button
        onClick={handleDownloadPDF}
        className="w-full shadow-soft"
        size="lg"
      >
        <FileDown className="mr-2 h-5 w-5" />
        Download Detailed PDF Report
      </Button>

      {/* Disclaimer (Keep as is) */}
      <Card className="p-4 bg-warning/10 border-warning/20">
        <p className="text-xs text-center text-muted-foreground">
          <strong>Medical Disclaimer:</strong> This prediction is generated by
          AI and should not replace professional medical diagnosis. Always
          consult with qualified healthcare providers for proper evaluation and
          treatment.
        </p>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
