import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("OSA_final.csv")

for col in df.select_dtypes(include='object').columns:
    df[col] = df[col].str.strip()

df['Gender'] = df['Gender'].map({'Female': 0, 'Male': 1})

yes_no_cols = ['Morning_headache', 'Snoring_no', 'Self_reported_episodes', 'Gasping_or_chocking']
for col in yes_no_cols:
    df[col] = df[col].map({'Yes': 1, 'No': 0})

numeric_cols = ['Age','BMI','Pulse_rate','Number_of_apneic_episodes',
                'Lowest_saturation','ODI','Waist_circumference','Weight',
                'Height','Neck_circumference','Awake_saturation']
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')
    df[col] = df[col].fillna(df[col].median())

feature_cols = [
    'Age', 'Gender', 'BMI', 'Pulse_rate', 'Number_of_apneic_episodes',
    'Lowest_saturation', 'ODI', 'Snoring_no', 'Self_reported_episodes',
    'Morning_headache', 'Waist_circumference', 'Weight', 'Height',
    'Gasping_or_chocking', 'Neck_circumference', 'Awake_saturation'
]

X = df[feature_cols]
y = df['OSA_severity']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)


joblib.dump(model, "osa_model.pkl")
joblib.dump(scaler, "osa_scaler.pkl")
joblib.dump(feature_cols, "feature_order.pkl")

def predict_osa(
    age, gender, bmi, pulse_rate, num_apneic_episodes, lowest_saturation,
    odi, snoring, arousal_episodes, morning_headache, waist, weight,
    height, gasping, neck, awake_saturation
):
    """
    Predict OSA severity using trained Random Forest model.
    Inputs:
    - gender: 0=Female, 1=Male
    - Yes/No fields: 0/1
    """
    model = joblib.load("osa_model.pkl")
    scaler = joblib.load("osa_scaler.pkl")
    feature_order = joblib.load("feature_order.pkl")

    input_dict = {
        'Age': age,
        'Gender': gender,
        'BMI': bmi,
        'Pulse_rate': pulse_rate,
        'Number_of_apneic_episodes': num_apneic_episodes,
        'Lowest_saturation': lowest_saturation,
        'ODI': odi,
        'Snoring_no': snoring,
        'Self_reported_episodes': arousal_episodes,
        'Morning_headache': morning_headache,
        'Waist_circumference': waist,
        'Weight': weight,
        'Height': height,
        'Gasping_or_chocking': gasping,
        'Neck_circumference': neck,
        'Awake_saturation': awake_saturation
    }

    input_df = pd.DataFrame([input_dict], columns=feature_order)

    input_scaled = scaler.transform(input_df)

    prediction = model.predict(input_scaled)[0]

    return prediction
