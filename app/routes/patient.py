from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Hospital, Doctor, TimeSlot, Appointment

patient_bp = Blueprint('patient', __name__)

# --- Search hospitals ---
@patient_bp.route('/hospitals/search', methods=['GET'])
def search_hospitals():
    query = request.args.get('q', '').strip()
    h_type = request.args.get('type', '')      # government / private
    emergency = request.args.get('emergency', '')  # true / false
    city = request.args.get('city', '').strip()

    hospitals = Hospital.query

    if query:
        hospitals = hospitals.filter(Hospital.name.ilike(f'%{query}%'))
    if h_type in ['government', 'private']:
        hospitals = hospitals.filter_by(hospital_type=h_type)
    if emergency == 'true':
        hospitals = hospitals.filter_by(has_emergency=True)
    if city:
        hospitals = hospitals.filter(Hospital.city.ilike(f'%{city}%'))

    result = [h.to_dict() for h in hospitals.all()]
    return jsonify({'hospitals': result}), 200


# --- Get hospital details ---
@patient_bp.route('/hospitals/<int:hospital_id>', methods=['GET'])
def get_hospital(hospital_id):
    hospital = Hospital.query.get_or_404(hospital_id)
    doctors = [d.to_dict() for d in hospital.doctors]
    data = hospital.to_dict()
    data['doctors'] = doctors
    return jsonify({'hospital': data}), 200


# --- Get available slots for a doctor ---
@patient_bp.route('/doctors/<int:doctor_id>/slots', methods=['GET'])
def get_slots(doctor_id):
    date = request.args.get('date', '')
    slots_q = TimeSlot.query.filter_by(doctor_id=doctor_id, is_booked=False)
    if date:
        slots_q = slots_q.filter_by(slot_date=date)
    slots = [s.to_dict() for s in slots_q.all()]
    return jsonify({'slots': slots}), 200


# --- Book an appointment ---
@patient_bp.route('/appointments/book', methods=['POST'])
@jwt_required()
def book_appointment():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    slot_id = data.get('slot_id')
    notes = data.get('notes', '')

    slot = TimeSlot.query.get(slot_id)
    if not slot:
        return jsonify({'error': 'Slot not found'}), 404
    if slot.is_booked:
        return jsonify({'error': 'Slot already booked'}), 409

    slot.is_booked = True
    appt = Appointment(patient_id=user_id, slot_id=slot_id, notes=notes)
    db.session.add(appt)
    db.session.commit()

    return jsonify({'message': 'Appointment booked!', 'appointment': appt.to_dict()}), 201


# --- Get appointment history ---
@patient_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    user_id = int(get_jwt_identity())
    appts = Appointment.query.filter_by(patient_id=user_id).order_by(Appointment.created_at.desc()).all()
    return jsonify({'appointments': [a.to_dict() for a in appts]}), 200


# --- Cancel appointment ---
@patient_bp.route('/appointments/<int:appt_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_appointment(appt_id):
    user_id = int(get_jwt_identity())
    appt = Appointment.query.get_or_404(appt_id)

    if appt.patient_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    if appt.status == 'cancelled':
        return jsonify({'error': 'Already cancelled'}), 400

    appt.status = 'cancelled'
    slot = TimeSlot.query.get(appt.slot_id)
    if slot:
        slot.is_booked = False

    db.session.commit()
    return jsonify({'message': 'Appointment cancelled', 'appointment': appt.to_dict()}), 200


# --- Reschedule appointment ---
@patient_bp.route('/appointments/<int:appt_id>/reschedule', methods=['PUT'])
@jwt_required()
def reschedule_appointment(appt_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    new_slot_id = data.get('new_slot_id')

    appt = Appointment.query.get_or_404(appt_id)
    if appt.patient_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    if appt.status == 'cancelled':
        return jsonify({'error': 'Cannot reschedule a cancelled appointment'}), 400

    new_slot = TimeSlot.query.get(new_slot_id)
    if not new_slot or new_slot.is_booked:
        return jsonify({'error': 'New slot unavailable'}), 409

    # Free old slot
    old_slot = TimeSlot.query.get(appt.slot_id)
    if old_slot:
        old_slot.is_booked = False

    # Book new slot
    new_slot.is_booked = True
    appt.slot_id = new_slot_id
    appt.status = 'rescheduled'
    db.session.commit()

    return jsonify({'message': 'Appointment rescheduled', 'appointment': appt.to_dict()}), 200
