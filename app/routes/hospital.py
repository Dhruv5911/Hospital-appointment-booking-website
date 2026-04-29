from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Hospital, Doctor, TimeSlot, Appointment, User

hospital_bp = Blueprint('hospital', __name__)

def get_current_hospital(user_id):
    return Hospital.query.filter_by(admin_id=user_id).first()

# --- Create / Update Hospital ---
@hospital_bp.route('/profile', methods=['POST', 'PUT'])
@jwt_required()
def upsert_hospital():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Access denied. Admins only.'}), 403

    data = request.get_json()
    hospital = get_current_hospital(user_id)

    if hospital is None:
        hospital = Hospital(admin_id=user_id)
        db.session.add(hospital)

    hospital.name = data.get('name', hospital.name)
    hospital.hospital_type = data.get('hospital_type', hospital.hospital_type)
    hospital.has_emergency = data.get('has_emergency', hospital.has_emergency)
    hospital.address = data.get('address', hospital.address)
    hospital.city = data.get('city', hospital.city)
    hospital.lat = data.get('lat', hospital.lat)
    hospital.lng = data.get('lng', hospital.lng)
    hospital.phone = data.get('phone', hospital.phone)
    hospital.description = data.get('description', hospital.description)
    hospital.rating = data.get('rating', hospital.rating)
    hospital.image_url = data.get('image_url', hospital.image_url)

    db.session.commit()
    return jsonify({'message': 'Hospital saved', 'hospital': hospital.to_dict()}), 200


# --- Get Own Hospital ---
@hospital_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_hospital_profile():
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    if not hospital:
        return jsonify({'hospital': None}), 200
    data = hospital.to_dict()
    data['doctors'] = [d.to_dict() for d in hospital.doctors]
    return jsonify({'hospital': data}), 200


# --- Add Doctor ---
@hospital_bp.route('/doctors', methods=['POST'])
@jwt_required()
def add_doctor():
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    if not hospital:
        return jsonify({'error': 'Hospital not found'}), 404

    data = request.get_json()
    doctor = Doctor(
        hospital_id=hospital.id,
        name=data.get('name', ''),
        specialty=data.get('specialty', ''),
        qualification=data.get('qualification', ''),
        experience_years=data.get('experience_years', 0),
        fee=data.get('fee', 500),
        available_days=data.get('available_days', 'Mon,Tue,Wed,Thu,Fri'),
        image_url=data.get('image_url', '')
    )
    db.session.add(doctor)
    db.session.commit()
    return jsonify({'message': 'Doctor added', 'doctor': doctor.to_dict()}), 201


# --- Update Doctor ---
@hospital_bp.route('/doctors/<int:doctor_id>', methods=['PUT'])
@jwt_required()
def update_doctor(doctor_id):
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    doctor = Doctor.query.get_or_404(doctor_id)
    if doctor.hospital_id != hospital.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    for field in ['name', 'specialty', 'qualification', 'experience_years', 'fee', 'available_days', 'image_url']:
        if field in data:
            setattr(doctor, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Doctor updated', 'doctor': doctor.to_dict()}), 200


# --- Delete Doctor ---
@hospital_bp.route('/doctors/<int:doctor_id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(doctor_id):
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    doctor = Doctor.query.get_or_404(doctor_id)
    if doctor.hospital_id != hospital.id:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(doctor)
    db.session.commit()
    return jsonify({'message': 'Doctor deleted'}), 200


# --- Add Time Slots ---
@hospital_bp.route('/doctors/<int:doctor_id>/slots', methods=['POST'])
@jwt_required()
def add_slots(doctor_id):
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    doctor = Doctor.query.get_or_404(doctor_id)
    if doctor.hospital_id != hospital.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    slot_date = data.get('slot_date')
    slot_times = data.get('slot_times', [])  # list of time strings

    created = []
    for t in slot_times:
        # Avoid duplicate slots
        existing = TimeSlot.query.filter_by(doctor_id=doctor_id, slot_date=slot_date, slot_time=t).first()
        if not existing:
            slot = TimeSlot(doctor_id=doctor_id, slot_date=slot_date, slot_time=t)
            db.session.add(slot)
            created.append(t)
    db.session.commit()
    return jsonify({'message': f'{len(created)} slot(s) added', 'added': created}), 201


# --- View Slots for a Doctor (Admin) ---
@hospital_bp.route('/doctors/<int:doctor_id>/slots', methods=['GET'])
@jwt_required()
def get_doctor_slots(doctor_id):
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    doctor = Doctor.query.get_or_404(doctor_id)
    if doctor.hospital_id != hospital.id:
        return jsonify({'error': 'Unauthorized'}), 403

    date = request.args.get('date', '')
    slots_q = TimeSlot.query.filter_by(doctor_id=doctor_id)
    if date:
        slots_q = slots_q.filter_by(slot_date=date)
    slots_q = slots_q.order_by(TimeSlot.slot_date, TimeSlot.slot_time)
    slots = [s.to_dict() for s in slots_q.all()]
    return jsonify({'slots': slots}), 200


# --- Delete a Time Slot ---
@hospital_bp.route('/slots/<int:slot_id>', methods=['DELETE'])
@jwt_required()
def delete_slot(slot_id):
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    slot = TimeSlot.query.get_or_404(slot_id)
    doctor = Doctor.query.get(slot.doctor_id)
    if not doctor or doctor.hospital_id != hospital.id:
        return jsonify({'error': 'Unauthorized'}), 403
    if slot.is_booked:
        return jsonify({'error': 'Cannot delete a booked slot. Cancel the appointment first.'}), 400
    db.session.delete(slot)
    db.session.commit()
    return jsonify({'message': 'Slot deleted'}), 200


# --- View All Appointments for Hospital ---
@hospital_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_hospital_appointments():
    user_id = int(get_jwt_identity())
    hospital = get_current_hospital(user_id)
    if not hospital:
        return jsonify({'appointments': []}), 200

    doctor_ids = [d.id for d in hospital.doctors]
    slot_ids = [s.id for s in TimeSlot.query.filter(TimeSlot.doctor_id.in_(doctor_ids)).all()]
    appointments = Appointment.query.filter(Appointment.slot_id.in_(slot_ids)).order_by(Appointment.created_at.desc()).all()

    result = []
    for a in appointments:
        appt_data = a.to_dict()
        patient = User.query.get(a.patient_id)
        appt_data['patient_name'] = patient.name if patient else 'N/A'
        appt_data['patient_email'] = patient.email if patient else 'N/A'
        result.append(appt_data)

    return jsonify({'appointments': result}), 200
