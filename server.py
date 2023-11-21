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

    #username error handling
    if username in users:
        return jsonify({'success': False, 'message': 'username is already taken'})

    if not username.strip():
        return jsonify({'success': False, 'message': 'incorrect public key'})

    #public_key error handling
    if not public_key.strip():
        return jsonify({'success': False, 'message': 'incorrect public key'})

    
    users[username] = {'public_key': public_key, 'messages': []}


    print(f'register {username} {public_key}')
    return jsonify({'success': True, 'message': 'account created'})
    
@app.route('/send_message', methods=['POST'])
def send_message():
    sender = request.json['sender']
    recipient = request.json['recipient']
    message = request.json['message']
    
    #sender error handling
    if sender not in users:
        return jsonify({'success': False, 'message': 'invalid username'})

    #recipient error handling
    if recipient not in users:
        return jsonify({'success': False, 'message': 'incorrect recipient'})

    #message error handling
    if not message.strip():
        return jsonify({'success': False, 'message': 'incorrect message'})
    

    users[recipient]['messages'].append({
        'sender': sender,
        'time': datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
        
        'message': message})

    
    print(f'register {sender} {recipient} {message}')
    return jsonify({'success': True, 'message': 'message send'})

@app.route('/view_messages', methods=['POST'])
def view_messages():
    username = request.json['username']

    #username error handling
    if username not in users:
        return jsonify({'success': False, 'message': 'invalid username'})
    
    message = [
        {
            'time': msg['time'],
            'sender': msg['sender'],
            'message': msg['message']
        }
        for msg in users[username]['messages']]
    

    
    print(f'register {username}')
    return jsonify({'success': True, 'message': message})


@app.route('/get_user_public_key', methods=['POST'])
def get_user_public_key():
    username = request.json['username']

    #username error handling
    if username not in users:
        return jsonify({'success': False, 'message': 'invalid username'})

    
    print(f'register {username}')
    
    return jsonify({'success': True, 'message': users[username]['public_key']})


with open('ip.txt') as f:
    ip, port = f.read().split(':')

if __name__ == '__main__':
    serve(app, host=ip, port=int(port))