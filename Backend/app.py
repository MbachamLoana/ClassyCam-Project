# backend/app.py

from flask import Flask, jsonify, request

app = Flask(__name__)

# Basic route
@app.route('/')
def hello_world():
    return 'Hello from Flask on Python 3.13.4 in your backend!'

# API endpoint example
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {
        'message': 'This is data from a Python 3.13.4 Flask API',
        'version': '3.13.4', # Confirming the Python version
        'location': 'backend folder',
        'timestamp': __import__('datetime').datetime.now().isoformat()
    }
    return jsonify(data)

@app.route('/api/echo', methods=['POST'])
def echo_data():
    if request.is_json:
        content = request.get_json()
        return jsonify({"received": content, "status": "success"})
    else:
        # Flask's built-in error handling for 400 Bad Request
        return jsonify({"error": "Request must be JSON"}), 400

if __name__ == '__main__':
    # Using 0.0.0.0 makes it accessible from other devices on your network
    # For development, debug=True is useful for auto-reloading and error messages
    app.run(debug=True, host='0.0.0.0', port=5000)