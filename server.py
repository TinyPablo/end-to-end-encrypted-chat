from flask import Flask, redirect, url_for, request, jsonify
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}}, supports_credentials=True)


users = {}

@app.route('/')
def root():
    return redirect(url_for('register'))

@app.route('/register', methods=['POST'])
def register():
    print(request.json)
    username = request.json['username']
    public_key = request.json['public_key']
    
    if public_key.strip() == '':
        return jsonify({'success': False, 'message': 'incorrect public key'})

    if username in users:
        return jsonify({'success': False, 'message': 'username is already taken'})
    
    users[username] = {'public_key': public_key, 'messages': []}
    
    return jsonify({'success': True, 'message': 'profile created'})
    
@app.route('/send_message', methods=['POST'])
def send_message():
    sender = request.json['username']
    recipient = request.json['recipient']
    encrypted_message = request.json['message']

    if recipient not in users:
        return jsonify({'success': False, 'message': 'recipient does not exist'})

    sender_user = users.get(sender)
    if not sender_user or 'public_key' not in sender_user:
        return jsonify({'success': False, 'message': 'invalid username'})

    users[recipient]['messages'].append({
        'sender': sender,
        'time': datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
        
        'message': encrypted_message})
    print(users)

    return jsonify({'success': True, 'message': 'message send'})

@app.route('/view_messages', methods=['POST'])
def view_messages():
    username = request.json['username']

    if username not in users or 'public_key' not in users[username]:
        return jsonify({'success': False, 'message': 'invalid username'})
    
    decrypted_messages = [
        {
            'time': msg['time'],
            'sender': msg['sender'],
            'message': msg['message']
        }
        for msg in users[username]['messages']
    ]
    print(users)
    return jsonify({'success': True, 'message': decrypted_messages})


@app.route('/get_public_key_by_username', methods=['POST'])
def get_public_key_by_username():
    username = request.json['username']

    if username not in users or 'public_key' not in users[username]:
        return jsonify({'success': False, 'message': 'invalid username'})
    
    return jsonify({'success': True, 'message': users[username]['public_key']})


if __name__ == '__main__':
    app.run(host='192.168.1.109', port=33000)