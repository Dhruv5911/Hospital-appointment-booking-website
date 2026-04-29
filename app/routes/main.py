from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/login')
@main_bp.route('/signup')
@main_bp.route('/dashboard')
@main_bp.route('/patient/<path:path>')
@main_bp.route('/hospital/<path:path>')
def index(**kwargs):
    return render_template('index.html')
