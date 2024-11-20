import os
from flask import Flask, jsonify, request, render_template
from werkzeug.utils import secure_filename
import pytesseract
from PIL import Image

app = Flask(__name__)

# Configurations
UPLOAD_FOLDER = './uploaded_documents'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

# Function to check allowed extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes for templates
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/eligibility')
def eligibility():
    return render_template('eligibility.html')

@app.route('/compare')
def compare():
    return render_template('compare.html')

@app.route('/checklist')
def checklist():
    return render_template('checklist.html')

# API Endpoints
@app.route('/api/eligibility', methods=['POST'])
def calculate_eligibility():
    data = request.json
    income = float(data['income'])
    expenses = float(data['expenses'])
    existing_emis = float(data['existing_emis'])
    rule = data['rule']

    max_emi = (income - expenses - existing_emis) * (0.4 if rule == 'conservative' else 0.5)
    return jsonify({"max_eligible_emi": round(max_emi, 2)}), 200

@app.route('/api/checklist', methods=['GET'])
def get_checklist():
    loan_type = request.args.get('loan_type')
    checklists = {
        "home": ["Sale Deed", "Title Clearance", "Valuation Report"],
        "vehicle": ["Proforma Invoice", "RC Book"],
        "personal": ["Medical Bills", "Repair Estimates"],
        "education": ["Admission Letter", "Course Fee Details"]
    }
    return jsonify(checklists.get(loan_type, [])), 200

@app.route('/api/upload-documents', methods=['POST'])
def upload_documents():
    files = request.files.getlist('documents')
    uploaded_files = []
    ocr_results = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            uploaded_files.append(filename)

            if filename.lower().endswith(('png', 'jpg', 'jpeg')):
                try:
                    text = pytesseract.image_to_string(Image.open(filepath))
                    ocr_results.append({"file": filename, "ocr_text": text})
                except Exception as e:
                    ocr_results.append({"file": filename, "error": str(e)})

    return jsonify({
        "message": "Files uploaded successfully",
        "uploaded_files": uploaded_files,
        "ocr_results": ocr_results
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
