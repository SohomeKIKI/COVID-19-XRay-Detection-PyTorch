from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
import io
import statistics
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def analyze_image_data(image_data):
    """
    Simple image analysis using basic statistics of pixel values
    This is a placeholder for actual ML model prediction
    """
    try:
        logger.info("Analyzing image data...")
        # For now, return a mock prediction
        # In a real implementation, this would analyze the image data
        return True, 0.85
    except Exception as e:
        logger.error(f"Error in analyze_image_data: {str(e)}")
        raise

@app.route('/')
def index():
    try:
        root_dir = os.path.dirname(os.path.abspath(__file__))
        logger.info(f"Serving index.html from {root_dir}")
        return send_from_directory(root_dir, 'index.html')
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        return str(e), 500

@app.route('/<path:filename>')
def serve_static(filename):
    try:
        root_dir = os.path.dirname(os.path.abspath(__file__))
        logger.info(f"Serving static file {filename} from {root_dir}")
        return send_from_directory(root_dir, filename)
    except Exception as e:
        logger.error(f"Error serving static file {filename}: {str(e)}")
        return str(e), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        logger.info("Received prediction request")
        if 'image' not in request.files:
            logger.warning("No image provided in request")
            return jsonify({'error': 'No image provided'}), 400
        
        # Get the image file
        image_file = request.files['image']
        logger.info(f"Processing image: {image_file.filename}")
        image_bytes = image_file.read()
        
        # Log image details
        logger.info(f"Image size: {len(image_bytes)} bytes")
        
        # Analyze the image
        is_covid, confidence = analyze_image_data(image_bytes)
        logger.info(f"Analysis complete - COVID: {is_covid}, Confidence: {confidence}")
        
        # Convert prediction to response
        response = {
            'prediction': 'COVID-19' if is_covid else 'Normal',
            'confidence': float(confidence)
        }
        logger.info(f"Sending response: {response}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
