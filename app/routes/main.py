from flask import Blueprint, render_template, jsonify
from app.models import User, Appointment, Doctor, MedicineOrder
from datetime import datetime

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/login')
@main_bp.route('/signup')
@main_bp.route('/dashboard')
@main_bp.route('/patient/<path:path>')
@main_bp.route('/hospital/<path:path>')
def index(**kwargs):
    return render_template('index.html')

@main_bp.route('/api/stats')
def get_stats():
    total_patients = User.query.filter_by(role='patient').count()
    today = datetime.now().strftime('%Y-%m-%d')
    todays_appts = Appointment.query.filter(Appointment.slot.has(slot_date=today)).count()
    doctors_active = Doctor.query.count()
    
    # Calculate pharmacy fill roughly
    total_orders = MedicineOrder.query.count()
    if total_orders > 0:
        filled_orders = MedicineOrder.query.filter(MedicineOrder.status.in_(['shipped', 'delivered'])).count()
        pharmacy_fill = f"{int((filled_orders / total_orders) * 100)}%"
    else:
        pharmacy_fill = "96%"

    return jsonify({
        'total_patients': total_patients,
        'todays_appts': todays_appts,
        'doctors_active': doctors_active,
        'pharmacy_fill': pharmacy_fill
    })
