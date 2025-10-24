import jsPDF from "jspdf";

export const generatePDF = (prediction: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.5 + 5;
  };

  // Header
  doc.setFillColor(0, 119, 182);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("OSA Detection Report", pageWidth / 2, 25, { align: "center" });
  
  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Report Date
  addText(`Report Generated: ${new Date(prediction.timestamp).toLocaleString()}`, 10, true);
  yPosition += 5;

  // Main Prediction
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Prediction Result", margin + 5, yPosition + 12);
  doc.setFontSize(20);
  
  // Color code severity
  let severityColor: [number, number, number] = [0, 0, 0];
  switch (prediction.severity.toLowerCase()) {
    case "normal":
      severityColor = [34, 139, 34];
      break;
    case "mild":
      severityColor = [255, 165, 0];
      break;
    case "moderate":
      severityColor = [255, 140, 0];
      break;
    case "severe":
      severityColor = [220, 20, 60];
      break;
  }
  
  doc.setTextColor(...severityColor);
  doc.text(prediction.severity.toUpperCase(), margin + 5, yPosition + 22);
  doc.setTextColor(0, 0, 0);
  
  yPosition += 40;

  // Confidence Score
  addText(`Confidence Score: ${prediction.confidence}%`, 12, true);
  
  if (prediction.predictedAHI) {
    addText(`Predicted AHI: ${prediction.predictedAHI.toFixed(1)}`, 12, true);
  }
  
  yPosition += 5;

  // Patient Data Section
  addText("Patient Information", 14, true);
  yPosition += 2;
  
  const patientData = prediction.patientData;
  if (patientData) {
    if (patientData.name) {
      addText(`Patient Name: ${patientData.name}`, 10, true);
    }
    addText(`Age: ${patientData.age} years | Gender: ${patientData.gender}`, 10);
    addText(`BMI: ${patientData.bmi} kg/m² | Weight: ${patientData.weight} kg | Height: ${patientData.height} m`, 10);
    addText(`Pulse Rate: ${patientData.pulseRate} BPM`, 10);
    addText(`Waist Circumference: ${patientData.waistCircumference} cm | Neck Circumference: ${patientData.neckCircumference} cm`, 10);
    addText(`Apneic Episodes: ${patientData.apneicEpisodes}`, 10);
    addText(`Lowest Saturation: ${patientData.lowestSaturation}% | Awake Saturation: ${patientData.awakeSaturation}%`, 10);
    addText(`ODI: ${patientData.odi}`, 10);
    addText(`Snoring: ${patientData.snoring} | Morning Headache: ${patientData.morningHeadache}`, 10);
    addText(`Arousal Episodes: ${patientData.arousalEpisodes} | Gasping/Choking: ${patientData.gasping}`, 10);
  }
  
  yPosition += 5;

  // Risk Factors
  addText("Key Risk Factors", 14, true);
  yPosition += 2;
  
  if (prediction.riskFactors && prediction.riskFactors.length > 0) {
    prediction.riskFactors.forEach((factor: string, index: number) => {
      addText(`${index + 1}. ${factor}`, 10);
    });
  }
  
  yPosition += 5;

  // Clinical Interpretation
  addText("Clinical Interpretation", 14, true);
  yPosition += 2;
  addText(prediction.interpretation, 10);
  yPosition += 5;

  // Recommendations
  addText("Recommendations", 14, true);
  yPosition += 2;
  
  if (prediction.recommendations && prediction.recommendations.length > 0) {
    prediction.recommendations.forEach((rec: string, index: number) => {
      addText(`${index + 1}. ${rec}`, 10);
    });
  }
  
  yPosition += 5;

  // Clinical Notes
  if (prediction.clinicalNotes) {
    addText("Clinical Notes", 14, true);
    yPosition += 2;
    addText(prediction.clinicalNotes, 10);
    yPosition += 5;
  }

  // Severity Reference
  addText("OSA Severity Classification Reference", 14, true);
  yPosition += 2;
  addText("• Normal: AHI < 5 events per hour", 10);
  addText("• Mild: AHI 5-15 events per hour", 10);
  addText("• Moderate: AHI 15-30 events per hour", 10);
  addText("• Severe: AHI > 30 events per hour", 10);
  yPosition += 5;

  // Disclaimer
  doc.setFillColor(255, 248, 220);
  const disclaimerHeight = 25;
  
  if (yPosition + disclaimerHeight > pageHeight - margin) {
    doc.addPage();
    yPosition = margin;
  }
  
  doc.rect(margin, yPosition, pageWidth - 2 * margin, disclaimerHeight, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICAL DISCLAIMER", margin + 5, yPosition + 8);
  doc.setFont("helvetica", "normal");
  const disclaimerText = doc.splitTextToSize(
    "This report is generated by an AI system for research and educational purposes only. " +
    "It should not be used as a substitute for professional medical advice, diagnosis, or treatment. " +
    "Always seek the advice of your physician or other qualified health provider with any questions " +
    "regarding a medical condition.",
    pageWidth - 2 * margin - 10
  );
  doc.text(disclaimerText, margin + 5, yPosition + 14);

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("OSA Detection System - Advanced Medical AI Platform", pageWidth / 2, footerY, { align: "center" });

  // Save the PDF
  const fileName = `OSA_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
