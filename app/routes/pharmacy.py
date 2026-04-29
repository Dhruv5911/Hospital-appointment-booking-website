from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import MedicineOrder
import uuid
import json

pharmacy_bp = Blueprint('pharmacy', __name__)

MEDICINES_CATALOG = [
    {'id': 1, 'name': 'Paracetamol 500mg', 'price': 25.0, 'category': 'Pain Relief', 'unit': 'Strip (10 tabs)'},
    {'id': 2, 'name': 'Amoxicillin 250mg', 'price': 85.0, 'category': 'Antibiotic', 'unit': 'Strip (10 caps)'},
    {'id': 3, 'name': 'Cetirizine 10mg', 'price': 30.0, 'category': 'Antihistamine', 'unit': 'Strip (10 tabs)'},
    {'id': 4, 'name': 'Omeprazole 20mg', 'price': 55.0, 'category': 'Antacid', 'unit': 'Strip (10 caps)'},
    {'id': 5, 'name': 'Metformin 500mg', 'price': 40.0, 'category': 'Diabetes', 'unit': 'Strip (10 tabs)'},
    {'id': 6, 'name': 'Atorvastatin 10mg', 'price': 120.0, 'category': 'Cholesterol', 'unit': 'Strip (10 tabs)'},
    {'id': 7, 'name': 'Ibuprofen 400mg', 'price': 35.0, 'category': 'Pain Relief', 'unit': 'Strip (10 tabs)'},
    {'id': 8, 'name': 'Amlodipine 5mg', 'price': 65.0, 'category': 'Blood Pressure', 'unit': 'Strip (10 tabs)'},
    {'id': 9, 'name': 'Dolo 650mg', 'price': 42.0, 'category': 'Pain Relief', 'unit': 'Strip (10 tabs)'},
    {'id': 10, 'name': 'Azithromycin 500mg', 'price': 150.0, 'category': 'Antibiotic', 'unit': 'Strip (3 tabs)'},
    {'id': 11, 'name': 'Pantoprazole 40mg', 'price': 75.0, 'category': 'Antacid', 'unit': 'Strip (10 tabs)'},
    {'id': 12, 'name': 'Vitamin D3 60000 IU', 'price': 90.0, 'category': 'Supplement', 'unit': '4 capsules'},
    {'id': 13, 'name': 'Multivitamin Tablet', 'price': 180.0, 'category': 'Supplement', 'unit': 'Bottle (30 tabs)'},
    {'id': 14, 'name': 'Cough Syrup 100ml', 'price': 60.0, 'category': 'Respiratory', 'unit': '100ml bottle'},
    {'id': 15, 'name': 'Nasal Spray', 'price': 110.0, 'category': 'Respiratory', 'unit': '10ml bottle'},
]

@pharmacy_bp.route('/medicines', methods=['GET'])
def get_medicines():
    category = request.args.get('category', '')
    q = request.args.get('q', '').lower()
    result = MEDICINES_CATALOG
    if category:
        result = [m for m in result if m['category'].lower() == category.lower()]
    if q:
        result = [m for m in result if q in m['name'].lower()]
    return jsonify({'medicines': result}), 200


@pharmacy_bp.route('/orders', methods=['POST'])
@jwt_required()
def place_order():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    items = data.get('items', [])  # [{'medicine_id': 1, 'name': '...', 'qty': 2, 'price': 25.0}, ...]
    address = data.get('address', '')

    if not items:
        return jsonify({'error': 'Cart is empty'}), 400

    total = sum(item.get('price', 0) * item.get('qty', 1) for item in items)
    tracking_id = 'TRK' + str(uuid.uuid4())[:8].upper()

    order = MedicineOrder(
        patient_id=user_id,
        items_json=json.dumps(items),
        total_price=total,
        tracking_id=tracking_id,
        address=address,
        status='processing'
    )
    db.session.add(order)
    db.session.commit()

    return jsonify({'message': 'Order placed!', 'order': order.to_dict()}), 201


@pharmacy_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    orders = MedicineOrder.query.filter_by(patient_id=user_id).order_by(MedicineOrder.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200


@pharmacy_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = int(get_jwt_identity())
    order = MedicineOrder.query.get_or_404(order_id)
    if order.patient_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify({'order': order.to_dict()}), 200
