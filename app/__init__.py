import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

# Root dir is one level up from this file (app/ package is inside d:\health)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def create_app(config_class=Config):
    app = Flask(__name__,
                template_folder=os.path.join(ROOT_DIR, 'templates'),
                static_folder=os.path.join(ROOT_DIR, 'static'))
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth import auth_bp
    from app.routes.patient import patient_bp
    from app.routes.hospital import hospital_bp
    from app.routes.pharmacy import pharmacy_bp
    from app.routes.ml import ml_bp
    from app.routes.main import main_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api/patient')
    app.register_blueprint(hospital_bp, url_prefix='/api/hospital')
    app.register_blueprint(pharmacy_bp, url_prefix='/api/pharmacy')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    app.register_blueprint(main_bp)

    return app
