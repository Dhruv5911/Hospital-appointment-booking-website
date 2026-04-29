from app import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='patient')  # 'patient' or 'hospital_admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    appointments = db.relationship('Appointment', backref='patient', lazy=True, foreign_keys='Appointment.patient_id')
    orders = db.relationship('MedicineOrder', backref='patient', lazy=True)
    hospital = db.relationship('Hospital', backref='admin', uselist=False, lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
        }


class Hospital(db.Model):
    __tablename__ = 'hospitals'
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    hospital_type = db.Column(db.String(20), nullable=False)  # 'government' or 'private'
    has_emergency = db.Column(db.Boolean, default=False)
    address = db.Column(db.String(300))
    city = db.Column(db.String(100))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    phone = db.Column(db.String(20))
    description = db.Column(db.Text)
    rating = db.Column(db.Float, default=4.0)
    image_url = db.Column(db.String(500), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    doctors = db.relationship('Doctor', backref='hospital', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'hospital_type': self.hospital_type,
            'has_emergency': self.has_emergency,
            'address': self.address,
            'city': self.city,
            'lat': self.lat,
            'lng': self.lng,
            'phone': self.phone,
            'description': self.description,
            'rating': self.rating,
            'image_url': self.image_url,
            'admin_id': self.admin_id,
            'doctor_count': len(self.doctors)
        }


class Doctor(db.Model):
    __tablename__ = 'doctors'
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    specialty = db.Column(db.String(100))
    qualification = db.Column(db.String(200))
    experience_years = db.Column(db.Integer, default=0)
    fee = db.Column(db.Float, default=500.0)
    available_days = db.Column(db.String(200), default='Mon,Tue,Wed,Thu,Fri')
    image_url = db.Column(db.String(500), default='')

    slots = db.relationship('TimeSlot', backref='doctor', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'hospital_id': self.hospital_id,
            'name': self.name,
            'specialty': self.specialty,
            'qualification': self.qualification,
            'experience_years': self.experience_years,
            'fee': self.fee,
            'available_days': self.available_days,
            'image_url': self.image_url,
        }


class TimeSlot(db.Model):
    __tablename__ = 'time_slots'
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    slot_date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    slot_time = db.Column(db.String(10), nullable=False)  # HH:MM AM/PM
    is_booked = db.Column(db.Boolean, default=False)

    appointment = db.relationship('Appointment', backref='slot', uselist=False, lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'slot_date': self.slot_date,
            'slot_time': self.slot_time,
            'is_booked': self.is_booked,
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey('time_slots.id'), nullable=False)
    status = db.Column(db.String(20), default='booked')  # booked, cancelled, completed, rescheduled
    notes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        slot = self.slot
        doctor = slot.doctor if slot else None
        hospital = doctor.hospital if doctor else None
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'slot_id': self.slot_id,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'slot_date': slot.slot_date if slot else '',
            'slot_time': slot.slot_time if slot else '',
            'doctor_name': doctor.name if doctor else '',
            'doctor_specialty': doctor.specialty if doctor else '',
            'hospital_name': hospital.name if hospital else '',
            'hospital_id': hospital.id if hospital else None,
        }


class MedicineOrder(db.Model):
    __tablename__ = 'medicine_orders'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    items_json = db.Column(db.Text, nullable=False)  # JSON string of cart items
    total_price = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(30), default='processing')  # processing, shipped, delivered
    tracking_id = db.Column(db.String(50))
    address = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'items': json.loads(self.items_json),
            'total_price': self.total_price,
            'status': self.status,
            'tracking_id': self.tracking_id,
            'address': self.address,
            'created_at': self.created_at.isoformat(),
        }
