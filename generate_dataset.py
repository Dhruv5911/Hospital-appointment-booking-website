import pandas as pd
import numpy as np
import random

# Generate realistic synthetic data for emergency triage
np.random.seed(42)
num_samples = 1000

data = {
    'age': np.random.randint(1, 95, num_samples),
    'heart_rate': np.random.randint(50, 180, num_samples),
    'blood_pressure_systolic': np.random.randint(80, 200, num_samples),
    'oxygen_saturation': np.random.randint(85, 100, num_samples),
    'temperature': np.random.uniform(96.0, 105.0, num_samples).round(1),
    'pain_level': np.random.randint(0, 11, num_samples)
}

df = pd.DataFrame(data)

# Logic to assign triage levels based on vitals
def assign_triage(row):
    if row['oxygen_saturation'] < 90 or row['heart_rate'] > 150 or row['blood_pressure_systolic'] < 90 or row['temperature'] > 104:
        return 'Critical'
    elif row['oxygen_saturation'] < 95 or row['heart_rate'] > 120 or row['blood_pressure_systolic'] > 180 or row['pain_level'] >= 8 or row['temperature'] > 102:
        return 'High'
    elif row['heart_rate'] > 100 or row['blood_pressure_systolic'] > 140 or row['pain_level'] >= 5 or row['temperature'] > 100:
        return 'Medium'
    else:
        return 'Low'

df['triage_level'] = df.apply(assign_triage, axis=1)

# Save to CSV
csv_path = 'd:/health/triage_dataset.csv'
df.to_csv(csv_path, index=False)
print(f"Dataset generated successfully at {csv_path} with {len(df)} records.")
