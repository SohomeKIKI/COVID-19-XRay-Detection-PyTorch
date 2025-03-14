# COVID-19 X-Ray Detection Frontend

This is a web-based frontend for the COVID-19 X-Ray Detection system. It provides a user-friendly interface to upload chest X-ray images and get predictions using the PyTorch model.

## Setup Instructions

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Copy your trained PyTorch model from the COVID-19-XRay-Detection-PyTorch project to this directory.

3. Update the model loading code in `app.py` to point to your saved model.

4. Run the Flask server:
```bash
python app.py
```

5. Open your web browser and navigate to `http://localhost:5000`

## Features

- Modern, responsive UI
- Real-time image preview
- Visual confidence indicators
- Error handling and loading states
- Cross-Origin Resource Sharing (CORS) enabled

## Project Structure

- `index.html` - Main frontend interface
- `styles.css` - Custom styling
- `app.js` - Frontend JavaScript logic
- `app.py` - Flask backend server
- `requirements.txt` - Python dependencies
