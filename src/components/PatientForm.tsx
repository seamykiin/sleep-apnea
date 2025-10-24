import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
// Remove the Supabase import: import { supabase } from "@/integrations/supabase/client";

interface PatientFormProps {
  onPrediction: (prediction: any) => void;
}

const PatientForm = ({ onPrediction }: PatientFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    bmi: "",
    pulseRate: "",
    apneicEpisodes: "",
    lowestSaturation: "",
    odi: "",
    snoring: "",
    arousalEpisodes: "",
    morningHeadache: "",
    waistCircumference: "",
    weight: "",
    height: "",
    gasping: "",
    neckCircumference: "",
    awakeSaturation: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate all required fields
      const requiredFields = Object.keys(formData);
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof typeof formData]
      );

      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: `Please fill in all patient data fields. Missing: ${missingFields.join(
            ", "
          )}`, // Added detail
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Convert form data to appropriate types for the API
      const patientData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bmi: parseFloat(formData.bmi),
        pulseRate: parseFloat(formData.pulseRate),
        apneicEpisodes: parseInt(formData.apneicEpisodes),
        lowestSaturation: parseFloat(formData.lowestSaturation),
        odi: parseFloat(formData.odi),
        snoring: formData.snoring,
        arousalEpisodes: formData.arousalEpisodes,
        morningHeadache: formData.morningHeadache,
        waistCircumference: parseFloat(formData.waistCircumference),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gasping: formData.gasping,
        neckCircumference: parseFloat(formData.neckCircumference),
        awakeSaturation: parseFloat(formData.awakeSaturation),
      };

      // --- START: REPLACE SUPABASE WITH FETCH ---
      // Construct the full API endpoint URL from environment variable
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/predict`; // Make sure VITE_API_BASE_URL is set in .env

      console.log("Sending data to API:", apiUrl, patientData); // Add console log for debugging

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData), // Send patientData in the body
      });

      console.log("API Response Status:", response.status); // Log response status

      if (!response.ok) {
        // Handle HTTP errors (like 404, 500)
        let errorData;
        try {
          errorData = await response.json(); // Try to parse JSON error detail
          console.error("API Error Data:", errorData); // Log error data
        } catch (jsonError) {
          console.error("Failed to parse error response as JSON:", jsonError);
          errorData = {
            detail: `Server error: ${response.status} ${response.statusText}`,
          }; // Fallback error message
        }
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const predictionResult = await response.json(); // Get the prediction from FastAPI
      console.log("API Prediction Result:", predictionResult); // Log successful result

      // Assuming FastAPI returns the prediction result directly
      // Adjust based on your actual FastAPI response structure
      if (predictionResult && predictionResult.severity !== undefined) {
        // Pass the necessary data to the ResultsDisplay component
        onPrediction({
          ...predictionResult, // Spread the result from FastAPI
          timestamp: new Date().toISOString(), // Add timestamp on frontend
          patientData, // Pass the original patient data too
        });

        toast({
          title: "Analysis Complete",
          description: "OSA prediction has been generated successfully.",
        });
      } else {
        throw new Error(
          "Received an unexpected response structure from the server."
        );
      }
      // --- END: REPLACE SUPABASE WITH FETCH ---
    } catch (error: any) {
      console.error("Prediction error:", error);
      toast({
        title: "Prediction Error",
        description:
          error.message ||
          "Failed to connect to the prediction server or generate prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the form JSX remains the same...
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Demographics */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Demographics</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Patient Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., John Doe"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="e.g., 45"
                min="0" // Added min validation
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
                required // Added required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Physical Measurements */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Physical Measurements</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0" // Added min validation
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder="e.g., 75.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="height">Height (m)</Label>
            <Input
              id="height"
              type="number"
              step="0.01"
              min="0" // Added min validation
              value={formData.height}
              onChange={(e) => handleChange("height", e.target.value)}
              placeholder="e.g., 1.75"
              required
            />
          </div>
          <div>
            <Label htmlFor="bmi">BMI (kg/m²)</Label>
            <Input
              id="bmi"
              type="number"
              step="0.1"
              min="0" // Added min validation
              value={formData.bmi}
              onChange={(e) => handleChange("bmi", e.target.value)}
              placeholder="e.g., 24.7"
              required
            />
          </div>
          <div>
            <Label htmlFor="waistCircumference">Waist Circumference (cm)</Label>
            <Input
              id="waistCircumference"
              type="number"
              min="0" // Added min validation
              value={formData.waistCircumference}
              onChange={(e) =>
                handleChange("waistCircumference", e.target.value)
              }
              placeholder="e.g., 85"
              required
            />
          </div>
          <div>
            <Label htmlFor="neckCircumference">Neck Circumference (cm)</Label>
            <Input
              id="neckCircumference"
              type="number"
              min="0" // Added min validation
              value={formData.neckCircumference}
              onChange={(e) =>
                handleChange("neckCircumference", e.target.value)
              }
              placeholder="e.g., 38"
              required
            />
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Vital Signs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pulseRate">Pulse Rate (BPM)</Label>
            <Input
              id="pulseRate"
              type="number"
              min="0" // Added min validation
              value={formData.pulseRate}
              onChange={(e) => handleChange("pulseRate", e.target.value)}
              placeholder="e.g., 72"
              required
            />
          </div>
          <div>
            <Label htmlFor="awakeSaturation">Awake Saturation (%)</Label>
            <Input
              id="awakeSaturation"
              type="number"
              min="0" // Added min validation
              max="100" // Added max validation
              value={formData.awakeSaturation}
              onChange={(e) => handleChange("awakeSaturation", e.target.value)}
              placeholder="e.g., 96"
              required
            />
          </div>
        </div>
      </div>

      {/* Sleep Parameters */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Sleep Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="apneicEpisodes">Apneic Episodes</Label>
            <Input
              id="apneicEpisodes"
              type="number"
              min="0" // Added min validation
              value={formData.apneicEpisodes}
              onChange={(e) => handleChange("apneicEpisodes", e.target.value)}
              placeholder="e.g., 150"
              required
            />
          </div>
          <div>
            <Label htmlFor="lowestSaturation">Lowest Saturation (%)</Label>
            <Input
              id="lowestSaturation"
              type="number"
              min="0" // Added min validation
              max="100" // Added max validation
              value={formData.lowestSaturation}
              onChange={(e) => handleChange("lowestSaturation", e.target.value)}
              placeholder="e.g., 85"
              required
            />
          </div>
          <div>
            <Label htmlFor="odi">ODI</Label>
            <Input
              id="odi"
              type="number"
              step="0.1"
              min="0" // Added min validation
              value={formData.odi}
              onChange={(e) => handleChange("odi", e.target.value)}
              placeholder="e.g., 12.5"
              required
            />
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Symptoms</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="snoring">Snoring</Label>
            <Select
              value={formData.snoring}
              onValueChange={(value) => handleChange("snoring", value)}
              required // Added required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="arousalEpisodes">Arousal Episodes</Label>
            <Select
              value={formData.arousalEpisodes}
              onValueChange={(value) => handleChange("arousalEpisodes", value)}
              required // Added required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="morningHeadache">Morning Headache</Label>
            <Select
              value={formData.morningHeadache}
              onValueChange={(value) => handleChange("morningHeadache", value)}
              required // Added required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gasping">Gasping/Choking</Label>
            <Select
              value={formData.gasping}
              onValueChange={(value) => handleChange("gasping", value)}
              required // Added required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze Patient Data"
        )}
      </Button>
    </form>
  );
};

export default PatientForm;
