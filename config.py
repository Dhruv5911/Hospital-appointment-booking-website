import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hospital-booking-secret-key-2024'
    
    # SQLite for development — to migrate to MySQL, change this URI to:
    # mysql+pymysql://user:password@host/dbname
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'hospital.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-hospital-2024'
    JWT_ACCESS_TOKEN_EXPIRES = False  # Tokens don't expire for demo purposes
