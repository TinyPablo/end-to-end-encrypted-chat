from flask import Flask, redirect, url_for, request, jsonify
from datetime import datetime
from flask_cors import CORS
import time
from waitress import serve
import threading

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}}, supports_credentials=True)


users = {}

def show_users():
    while True:
        input()
        print(users)

t = threading.Thread(target=show_users)
t.start()
        

@app.route('/')
def root():
    return redirect(url_for('register'))

@app.route('/register', methods=['POST'])
def register():
    username = request.json['username']
    public_key = request.json['public_key']
    verify_code = request.json['verify_code']

    username = username.strip()

    error = False
    errorResponse = {'success': False, 'error': {}}

    if username in users:
        error = True
        errorResponse['error']['username'] = 'username is already taken'
    elif not username:
        error = True
        errorResponse['error']['username'] = 'username is empty'
    elif ' ' in username:
        error = True
        errorResponse['error']['username'] = 'spaces are not allowed in username'

    if not public_key.strip():
        error = True
        errorResponse['error']['keys'] = 'public key is empty'
    
    if error:
        return jsonify(errorResponse)
    
    users[username] = {'public_key': public_key, 'verify_code': verify_code, 'messages': []}
    return jsonify({'success': True, 'message': 'account created'})
    
@app.route('/send_message', methods=['POST'])
def send_message():
    sender = request.json['sender']
    recipient = request.json['recipient']
    message = request.json['message']
    
    error = False
    errorResponse = {'success': False, 'error': {}}

    if sender not in users:
        error = True
        errorResponse['error']['sender'] = 'incorrect username'

    if recipient not in users:
        error = True
        errorResponse['error']['recipient'] = 'incorrect recipient'

    if not message.strip():
        error = True
        errorResponse['error']['message'] = 'message is empty'

    users[recipient]['messages'].append({
        'sender': sender,
        'time': datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
        'message': message})

    if error:
        return jsonify(errorResponse)

    return jsonify({'success': True, 'message': 'message sent'})

@app.route('/view_messages', methods=['POST'])
def view_messages():
    username = request.json['username']

    error = False
    errorResponse = {'success': False, 'error': {}}

    if username not in users:
        error = True
        errorResponse['error']['username'] = 'invalid username'
    
    message = [
        {
            'time': msg['time'],
            'sender': msg['sender'],
            'message': msg['message']
        }
        for msg in users[username]['messages']]
    
    if error:
        return jsonify(errorResponse)

    return jsonify({'success': True, 'message': message})


@app.route('/get_user_public_key', methods=['POST'])
def get_user_public_key():
    username = request.json['username']

    error = False
    errorResponse = {'success': False, 'error': {}}

    if username not in users:
        error = True
        errorResponse['error']['username'] = 'invalid username'

    if error:
        return jsonify(errorResponse)
    
    return jsonify({'success': True, 'message': users[username]['public_key']})


@app.route('/get_user_verify_code', methods=['POST'])
def get_user_verify_code():
    username = request.json['username']

    error = False
    errorResponse = {'success': False, 'error': {}}

    if username not in users:
        error = True
        errorResponse['error']['username'] = 'invalid username'
    
    if error:
        return jsonify(errorResponse)

    return jsonify({'success': True, 'message': users[username]['verify_code']})

with open('ip.txt') as f:
    ip, port = f.read().split(':')

if __name__ == '__main__':
    serve(app, host=ip, port=int(port))