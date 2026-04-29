from flask import Blueprint, request, jsonify
import os, joblib
import numpy as np

ml_bp = Blueprint('ml', __name__)

# Symptom keyword mapping for rule-based fallback / feature engineering
EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'shortness of breath',
    'unconscious', 'seizure', 'severe bleeding', 'poisoning', 'choking', 'severe burn',
    'loss of consciousness', 'high fever', 'unresponsive', 'paralysis', 'convulsions',
    'anaphylaxis', 'allergic reaction', 'severe headache', 'sudden vision loss',
    'coughing blood', 'vomiting blood', 'trauma', 'accident'
]

NON_EMERGENCY_KEYWORDS = [
    'cold', 'cough', 'mild fever', 'headache', 'stomach ache', 'sore throat',
    'runny nose', 'fatigue', 'nausea', 'diarrhea', 'skin rash', 'itching',
    'joint pain', 'back pain', 'anxiety', 'insomnia', 'ear pain', 'eye irritation'
]

def predict_emergency(symptoms_text: str):
    """Rule-based ML-style emergency prediction with confidence score."""
    text_lower = symptoms_text.lower()
    emergency_score = 0
    non_emergency_score = 0

    matched_emergency = []
    matched_non_emergency = []

    for kw in EMERGENCY_KEYWORDS:
        if kw in text_lower:
            emergency_score += 1
            matched_emergency.append(kw)

    for kw in NON_EMERGENCY_KEYWORDS:
        if kw in text_lower:
            non_emergency_score += 1
            matched_non_emergency.append(kw)

    total = emergency_score + non_emergency_score
    if total == 0:
        is_emergency = False
        confidence = 0.5
    else:
        confidence = emergency_score / total
        is_emergency = confidence >= 0.4  # threshold

    severity = 'Critical' if confidence > 0.7 else 'Moderate' if confidence > 0.4 else 'Mild'

    return {
        'is_emergency': is_emergency,
        'confidence': round(confidence * 100, 1),
        'severity': severity,
        'matched_emergency': matched_emergency,
        'matched_non_emergency': matched_non_emergency,
        'recommendation': (
            '🚨 EMERGENCY: Please visit the nearest Emergency Room immediately!'
            if is_emergency else
            '✅ Non-Emergency: Schedule a regular appointment with a doctor.'
        )
    }


@ml_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    symptoms = data.get('symptoms', '').strip()
    age = data.get('age', 30)
    gender = data.get('gender', 'unknown')

    if not symptoms:
        return jsonify({'error': 'Please describe your symptoms'}), 400

    result = predict_emergency(symptoms)
    result['symptoms_input'] = symptoms
    result['age'] = age
    result['gender'] = gender

    return jsonify(result), 200


@ml_bp.route('/symptoms/categories', methods=['GET'])
def get_symptom_categories():
    return jsonify({
        'emergency_symptoms': EMERGENCY_KEYWORDS,
        'non_emergency_symptoms': NON_EMERGENCY_KEYWORDS
    }), 200
