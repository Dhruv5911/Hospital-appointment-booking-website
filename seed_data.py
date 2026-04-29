from app import create_app, db
from app.models import User, Hospital, Doctor, TimeSlot, Appointment, MedicineOrder
from werkzeug.security import generate_password_hash
import json

app = create_app()

def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # --- Users ---
        admin1 = User(name='Dr. Ramesh Admin', email='admin1@hospital.com',
                      password_hash=generate_password_hash('admin123'), role='hospital_admin')
        admin2 = User(name='Clinic Admin Priya', email='admin2@hospital.com',
                      password_hash=generate_password_hash('admin123'), role='hospital_admin')
        admin3 = User(name='City Hospital Admin', email='admin3@hospital.com',
                      password_hash=generate_password_hash('admin123'), role='hospital_admin')
        patient1 = User(name='Arjun Kumar', email='patient@example.com',
                        password_hash=generate_password_hash('patient123'), role='patient')
        patient2 = User(name='Sneha Patel', email='sneha@example.com',
                        password_hash=generate_password_hash('patient123'), role='patient')

        for u in [admin1, admin2, admin3, patient1, patient2]:
            db.session.add(u)
        db.session.flush()

        # --- Hospitals ---
        h1 = Hospital(admin_id=admin1.id, name='AIIMS Delhi', hospital_type='government',
                      has_emergency=True, address='Ansari Nagar East, New Delhi',
                      city='New Delhi', lat=28.5672, lng=77.2100, phone='011-26588500',
                      description='Premier government medical institute with world-class facilities.',
                      rating=4.8)
        h2 = Hospital(admin_id=admin2.id, name='Apollo Hospital Mumbai', hospital_type='private',
                      has_emergency=True, address='Sahar Road, Andheri East, Mumbai',
                      city='Mumbai', lat=19.0996, lng=72.8660, phone='022-71066000',
                      description='Multi-specialty hospital with advanced healthcare services.',
                      rating=4.6)
        h3 = Hospital(admin_id=admin3.id, name='City Govt General Hospital', hospital_type='government',
                      has_emergency=False, address='MG Road, Bengaluru',
                      city='Bengaluru', lat=12.9716, lng=77.5946, phone='080-22250000',
                      description='Affordable government hospital serving Bengaluru city.',
                      rating=3.9)
        h4 = Hospital(admin_id=admin1.id if False else admin1.id, name='Fortis Healthcare', hospital_type='private',
                      has_emergency=True, address='Sector B, Vasant Kunj, New Delhi',
                      city='New Delhi', lat=28.5245, lng=77.1577, phone='1800-103-1313',
                      description='Leading private healthcare chain with international standards.',
                      rating=4.7)

        # Reuse admin1 for h4 won't work as admin already has hospital. Let's use admin3
        h4.admin_id = admin3.id

        for h in [h1, h2, h3]:
            db.session.add(h)
        db.session.flush()

        # --- Doctors for h1 ---
        d1 = Doctor(hospital_id=h1.id, name='Dr. Ananya Sharma', specialty='Cardiology',
                    qualification='MBBS, MD (Cardiology)', experience_years=15, fee=800,
                    available_days='Mon,Tue,Wed,Thu,Fri')
        d2 = Doctor(hospital_id=h1.id, name='Dr. Vikram Nair', specialty='Neurology',
                    qualification='MBBS, DM (Neurology)', experience_years=12, fee=900,
                    available_days='Tue,Wed,Thu,Fri,Sat')
        d3 = Doctor(hospital_id=h1.id, name='Dr. Pooja Mehta', specialty='Orthopedics',
                    qualification='MBBS, MS (Ortho)', experience_years=10, fee=700,
                    available_days='Mon,Wed,Fri')

        # --- Doctors for h2 ---
        d4 = Doctor(hospital_id=h2.id, name='Dr. Rohit Joshi', specialty='Oncology',
                    qualification='MBBS, MD (Oncology)', experience_years=18, fee=1500,
                    available_days='Mon,Tue,Thu')
        d5 = Doctor(hospital_id=h2.id, name='Dr. Kavya Reddy', specialty='Gynecology',
                    qualification='MBBS, MS (Gynecology)', experience_years=8, fee=1000,
                    available_days='Mon,Tue,Wed,Thu,Fri')

        # --- Doctors for h3 ---
        d6 = Doctor(hospital_id=h3.id, name='Dr. Suresh Kumar', specialty='General Medicine',
                    qualification='MBBS, MD', experience_years=20, fee=300,
                    available_days='Mon,Tue,Wed,Thu,Fri,Sat')

        for d in [d1, d2, d3, d4, d5, d6]:
            db.session.add(d)
        db.session.flush()

        # --- Time Slots ---
        dates = ['2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08']
        times = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
                 '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM']

        for doc in [d1, d2, d3, d4, d5, d6]:
            for date in dates:
                for t in times:
                    db.session.add(TimeSlot(doctor_id=doc.id, slot_date=date, slot_time=t, is_booked=False))

        db.session.flush()

        # --- Sample Appointment ---
        slot_sample = TimeSlot.query.filter_by(doctor_id=d1.id, slot_date='2026-05-05', slot_time='09:00 AM').first()
        if slot_sample:
            slot_sample.is_booked = True
            appt = Appointment(patient_id=patient1.id, slot_id=slot_sample.id, status='booked', notes='Follow-up checkup')
            db.session.add(appt)

        # --- Sample Medicine Order ---
        sample_items = [
            {'medicine_id': 1, 'name': 'Paracetamol 500mg', 'qty': 2, 'price': 25.0},
            {'medicine_id': 3, 'name': 'Cetirizine 10mg', 'qty': 1, 'price': 30.0},
        ]
        order = MedicineOrder(
            patient_id=patient1.id,
            items_json=json.dumps(sample_items),
            total_price=80.0,
            tracking_id='TRK1A2B3C4D',
            address='123, MG Road, Bengaluru - 560001',
            status='shipped'
        )
        db.session.add(order)

        db.session.commit()
        print("Database seeded successfully!")
        print("  Patient login: patient@example.com / patient123")
        print("  Admin login:   admin1@hospital.com / admin123")

if __name__ == '__main__':
    seed()
