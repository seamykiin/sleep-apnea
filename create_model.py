import pandas as pd
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware
from pydantic import BaseModel, Field
from typing import Literal

# --- Pydantic Model for Input Data Validation ---
# This defines the structure and types expected in the request body from the frontend.
# Make sure the field names (or aliases) exactly match the keys in 'patientData' sent by PatientForm.tsx.
class PatientData(BaseModel):
    # Use aliases if frontend keys differ from your desired Python variable names
    # Example: pulseRate: float = Field(alias="pulse_rate")
    # If keys match, you don't need aliases. Match PatientForm.tsx's formData keys.
    name: str # Added name field based on PatientForm.tsx
    age: int
    gender: Literal["Male", "Female"]
    bmi: float
    pulseRate: float
    apneicEpisodes: int
    lowestSaturation: float
    odi: float
    snoring: Literal["Yes", "No"]
    arousalEpisodes: Literal["Yes", "No"]
    morningHeadache: Literal["Yes", "No"]
    waistCircumference: float
    weight: float
    height: float
    gasping: Literal["Yes", "No"]
    neckCircumference: float
    awakeSaturation: float

# --- FastAPI Application ---
app = FastAPI()

# --- Add CORS Middleware ---
# This allows your frontend (running on a different port/domain) to make requests to this backend.
# Adjust origins if your frontend URL is different or for production deployments.
origins = [
    "http://localhost:8080", # Default Vite dev server port
    "http://127.0.0.1:8080", # Also common for Vite dev server
    https://osa-prediction-api.onrender.com# Add your deployed frontend URL here if applicable
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)


# --- Load Model, Scaler, and Feature Order ---
# Load these once when the application starts for efficiency.
# Ensure the .pkl files are in the same directory as this script, or provide the full path.
try:
    model = joblib.load("osa_model.pkl")
    scaler = joblib.load("osa_scaler.pkl")
    # Load the EXACT feature order used during training
    feature_order = joblib.load("feature_order.pkl")
    print("Model, scaler, and feature order loaded successfully.")
    # --- ADDED: Print the loaded feature order for verification ---
    print("--- Expected Feature Order ---")
    print(feature_order)
    # --- END ADD ---
except FileNotFoundError as e:
    print(f"Error loading .pkl file: {e}. Make sure 'osa_model.pkl', 'osa_scaler.pkl', and 'feature_order.pkl' are in the correct directory.")
    exit()
except Exception as e:
    print(f"An unexpected error occurred loading .pkl files: {e}")
    exit()

# --- Prediction Endpoint ---
@app.post("/predict")
# Use 'async def' for FastAPI endpoints
async def predict_osa_endpoint(patient_data: PatientData):
    """
    Receives patient data via POST request, preprocesses it,
    predicts OSA severity using the loaded model, and returns the prediction.
    """
    # --- ADD THIS LOG ---
    print("--- Raw Data Received from Frontend ---")
    print(patient_data.dict())
    # --- END ADD ---

    try:
        # 1. Convert Pydantic model to a dictionary using EXACT keys from feature_order.pkl
        input_dict = {
            'Age': patient_data.age,
            'Gender': 1 if patient_data.gender == "Male" else 0,
            'BMI': patient_data.bmi, # Corrected key
            'Pulse_rate': patient_data.pulseRate, # Corrected key
            'Number_of_apneic_episodes': patient_data.apneicEpisodes, # Corrected key
            'Lowest_saturation': patient_data.lowestSaturation, # Corrected key
            'ODI': patient_data.odi,
            'Snoring_no': 1 if patient_data.snoring == "Yes" else 0, # Corrected key
            'Self_reported_episodes': 1 if patient_data.arousalEpisodes == "Yes" else 0, # Corrected key
            'Morning_headache': 1 if patient_data.morningHeadache == "Yes" else 0, # Corrected key
            'Waist_circumference': patient_data.waistCircumference, # Corrected key
            'Weight': patient_data.weight, # Corrected key
            'Height': patient_data.height, # Corrected key
            'Gasping_or_chocking': 1 if patient_data.gasping == "Yes" else 0, # Corrected key
            'Neck_circumference': patient_data.neckCircumference, # Corrected key
            'Awake_saturation': patient_data.awakeSaturation # Corrected key
        }
        # --- END CORRECTED BLOCK ---

        # --- ADD LOGGING ---
        print("--- Input Dictionary Created ---")
        print(input_dict)
        # --- END LOGGING ---

        # 2. Create DataFrame using the specific feature order from training
        input_df = pd.DataFrame([input_dict], columns=feature_order)

        # --- ADD LOGGING ---
        print("--- DataFrame Created ---")
        print(input_df.to_string())
        # --- END LOGGING ---

        # 3. Apply the scaler transformation
        input_scaled = scaler.transform(input_df)

        # --- ADD LOGGING ---
        print("--- Scaled Input ---")
        print(input_scaled)
        # --- END LOGGING ---

        # 4. Make prediction
        prediction_result = model.predict(input_scaled)[0] # Get the single prediction value

        # 5. Return the prediction result
        print(f"Prediction successful: {prediction_result}") # Log prediction
        return {
            "severity": prediction_result,
            # Add other fields the frontend expects, potentially with default values
            "confidence": 95, # Example default value
            "predictedAHI": None, # Example default value
            "riskFactors": ["Based on model inputs"], # Example default
            "interpretation": f"The model predicts '{prediction_result}' OSA severity based on the provided clinical parameters.", # Example default
            "recommendations": ["Consult a sleep specialist for further evaluation."], # Example default
            "clinicalNotes": "AI prediction based on Random Forest model." # Example default
            }

    except Exception as e:
        print(f"Error during prediction: {e}") # Log the error
        # Return an HTTP 500 error if something goes wrong
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

# --- Root endpoint (optional, for testing) ---
@app.get("/")
async def read_root():
    return {"message": "OSA Prediction API is running"}

# REMOVED the uvicorn.run block from here, run using:
# python3 -m uvicorn your_script_name:app --reload
