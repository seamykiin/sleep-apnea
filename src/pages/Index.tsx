import { useState } from "react";
import { Activity, FileDown, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PatientForm from "@/components/PatientForm";
import ResultsDisplay from "@/components/ResultsDisplay";

const Index = () => {
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrediction = async (prediction: any) => {
    setPrediction(prediction);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <header className="bg-gradient-primary text-primary-foreground py-16 px-4 shadow-medium">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Activity className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-bold text-center mb-4">
            OSA Detection System
          </h1>
          <p className="text-xl text-center text-primary-foreground/90 max-w-3xl mx-auto">
            Advanced AI-Powered Obstructive Sleep Apnea Prediction Using Clinical Parameters
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              <span>Clinical Grade</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              <span>PDF Reports</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <Card className="p-8 shadow-soft">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Patient Information
                </h2>
                <p className="text-muted-foreground">
                  Enter the patient's clinical parameters for OSA prediction
                </p>
              </div>
              <PatientForm onPrediction={handlePrediction} />
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {prediction ? (
              <ResultsDisplay prediction={prediction} />
            ) : (
              <Card className="p-12 shadow-soft border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">
                    Enter patient data and click "Analyze" to see the prediction results
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 bg-card shadow-soft">
            <h3 className="font-semibold text-lg mb-2 text-foreground">About OSA</h3>
            <p className="text-sm text-muted-foreground">
              Obstructive Sleep Apnea is a serious sleep disorder where breathing repeatedly 
              stops and starts during sleep, potentially leading to serious health complications.
            </p>
          </Card>
          <Card className="p-6 bg-card shadow-soft">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Severity Levels</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Normal: AHI &lt; 5</li>
              <li>• Mild: AHI 5-15</li>
              <li>• Moderate: AHI 15-30</li>
              <li>• Severe: AHI &gt; 30</li>
            </ul>
          </Card>
          <Card className="p-6 bg-card shadow-soft">
            <h3 className="font-semibold text-lg mb-2 text-foreground">AI Technology</h3>
            <p className="text-sm text-muted-foreground">
              This system uses advanced AI models trained on clinical data to provide 
              accurate OSA severity predictions based on patient parameters.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t border-border mt-16 py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center text-muted-foreground">
          <p className="text-sm">
            OSA Detection System • Advanced Medical AI Platform
          </p>
          <p className="text-xs mt-2">
            This system is for research and educational purposes. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
