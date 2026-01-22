import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.database import Base, engine, get_session
from app.models.user import User
from app.models.patient import Patient
from app.models.vital import Vital

def init_database():
    """Initialize database with tables and sample data"""
    print("Initializing database...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")
    
    # Get a new session
    session = get_session()
    
    try:
        # Check if admin user already exists
        existing_user = session.query(User).filter_by(username='admin').first()
        
        if existing_user:
            print("Admin user already exists.")
        else:
            # Create admin user
            admin_user = User(
                username='admin',
                email='admin@dichir.com'
            )
            admin_user.set_password('admin123')
            session.add(admin_user)
            session.commit()
            print("Admin user created successfully!")
        
        # Check if sample patients already exist
        existing_patients = session.query(Patient).count()
        
        if existing_patients > 0:
            print(f"Database already has {existing_patients} patients.")
        else:
            # Create sample patients
            patients = [
                Patient(
                    first_name='John',
                    last_name='Doe',
                    date_of_birth='1990-01-15',
                    gender='Male',
                    email='john.doe@email.com',
                    phone='555-0101',
                    address='123 Main St, City, State 12345'
                ),
                Patient(
                    first_name='Jane',
                    last_name='Smith',
                    date_of_birth='1985-05-20',
                    gender='Female',
                    email='jane.smith@email.com',
                    phone='555-0102',
                    address='456 Oak Ave, City, State 12345'
                ),
                Patient(
                    first_name='Robert',
                    last_name='Johnson',
                    date_of_birth='1978-11-30',
                    gender='Male',
                    email='robert.j@email.com',
                    phone='555-0103',
                    address='789 Pine Rd, City, State 12345'
                )
            ]
            
            for patient in patients:
                session.add(patient)
            
            session.commit()
            print(f"Created {len(patients)} sample patients.")
            
            # Create sample vital signs for each patient
            for patient in patients:
                vital_sign = Vital(
                    patient_id=patient.id,
                    temperature=37.0,
                    blood_pressure_systolic=120,
                    blood_pressure_diastolic=80,
                    heart_rate=72,
                    respiratory_rate=16,
                    oxygen_saturation=98.0
                )
                session.add(vital_sign)
            
            session.commit()
            print("Sample vital signs created.")
        
        print("\nDatabase initialization complete!")
        print("\nYou can now run the application with: python run.py")
        print("Login with username: admin, password: admin123")
        
    except Exception as e:
        session.rollback()
        print(f"Error initializing database: {e}")
        raise
    finally:
        session.close()

if __name__ == '__main__':
    init_database()
