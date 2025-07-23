# Local Modules
import deviceManager
import nameManager
import turkishToEnglish
import getFileSize

# Global Modules
import socket
from flask import Flask, send_from_directory, abort, url_for, render_template, request, jsonify, flash, redirect
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest
from flask_socketio import SocketIO
import random
import os
import shutil
import aiofiles
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

# Flask App Setup
app = Flask(__name__, static_url_path="/static/")
app.config['SECRET_KEY'] = 'change-me-on-production!'
socketio = SocketIO(app)
UPLOAD_FOLDER = 'uploads'

# Get IP Address Function
def get_server_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_address = s.getsockname()[0]
        s.close()
        
        return ip_address
    except Exception as e:
        print(f"Cannot get ip: {e}")
        return "ERROR"

# Create Upload Folder if it doesn't exist or clear it if it does
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
else:
    try:
        shutil.rmtree(UPLOAD_FOLDER)
    except Exception as e:
        print(f"Hata oluştu: {e}")
    os.makedirs(UPLOAD_FOLDER)

# Global Variables
combinedDatas = []
allClientsData = []
connected_clients = []
uploadedFiles = []

# Function to check if a path is safe
def is_safe_path(basedir, path):
    return os.path.realpath(os.path.join(basedir, path)).startswith(os.path.realpath(basedir))

@app.route("/")
def hello_world():
    user_agent = request.headers.get('User-Agent')
    if not user_agent:
        return render_template("error.html", error="User-Agent header is missing")
    names = nameManager.getNames()
    allNamesFromTXT = nameManager.originalNameList()
    
    if len(names) + 1 >= len(allNamesFromTXT):
        return render_template("outofnames.html")

    ipAddress = get_server_ip()
    
    if user_agent:
        return render_template("index.html", ip=ipAddress)
    else:
        return render_template("index.html", ip=ipAddress)

@app.errorhandler(Exception)
def handle_error(error):
    return jsonify({'error': str(error)}), 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
async def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if os.path.exists(filepath):
        return jsonify({'error': f'File {filename} already exists'}), 409

    try:
        async with aiofiles.open(filepath, 'wb') as f:
            while chunk := file.read(1024 * 1024):
                await f.write(chunk)
                
        return jsonify({'message': f'File {filename} uploaded successfully'}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500

@socketio.on('fileOwnerNotification')
def handle_fileOwnerNotification(filename):
    sid = request.sid

    file = filename["filename"]
    
    data = {
        "filename": file,
        "owner": sid,
        "sharedWith": [],
    }
    
    uploadedFiles.append(data)

@socketio.on('connect')
def handle_connect():
    sid = request.sid
    connected_clients.append(sid)
    socketio.emit("clientData", "tellYourData", to=sid)

@socketio.on('clientData')
def handle_userAgent(userAgent):
    sid = request.sid
    
    name = nameManager.getNewName()
    
    device = deviceManager.getDeviceModel(userAgent)

    clientAllData = {
        "sid": sid,
        "name": name,
        "device": device,
    }
    combinedDatas.append(clientAllData)

    clientData = {
        "name": name,
        "device": device,
    }
    allClientsData.append(clientData)
    
    socketio.emit('message', f'Hello! Your sid: {sid}, your name: {name}, your device: {device}', to=sid)
    socketio.emit('yourDevice', clientData, to=sid)
    socketio.emit('client_list', allClientsData)
    


@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    connected_clients.remove(sid)

    for data in combinedDatas:
        if data["sid"] == sid:
            neededName = data["name"]
            combinedDatas.remove(data)

    for data in allClientsData:
        if data["name"] == neededName:
            allClientsData.remove(data)
    
    nameManager.addNewName(neededName)
    
    socketio.emit('client_list', allClientsData)
    

@app.route('/shareFileWithUsers', methods=["POST"])
def shareFileWithUsers():
    formData = request.form
    print(combinedDatas)
    filename = formData.get("filename", False)
    
    for key in formData:
        if key != "filename":
            for data in combinedDatas:
                name = data["name"]
                nameFixed = turkishToEnglish.editText(name)

                for filee in uploadedFiles:
                    print(filee)
                    if filee["filename"] == filename:
                        print(filee["filename"])
                        owner = filee["owner"]
                        print(owner)

                for userDatas in combinedDatas:
                    print(f"userDatas {userDatas}")
                    if userDatas["sid"] == owner:
                        ownerName = userDatas["name"]
                        ownerDevice = userDatas["device"]

                dataSize = getFileSize.dosya_boyutu("uploads/" + secure_filename(filename))
                if nameFixed == key:
                    sid = data["sid"]
                    socketio.emit("aFileSharedWithYou", {"filename": filename, "owner": ownerName, "dataWeight": dataSize, "device": ownerDevice}, to=sid)
                    flash(f"You succesfully shared file {filename} with {name}")
                    
                    for uploadedfile in uploadedFiles:
                        if uploadedfile["filename"] == filename:
                            uploadedfile["sharedWith"].append(sid)

    return jsonify({"message": f"Succesfully shared file: {filename} with users"})                    


@app.route('/download/<filename>/<sid>', methods=['GET'])
def processDownloadJob(filename, sid):
    try:
        filename = secure_filename(filename)
        
        for data in uploadedFiles:
            if data["filename"] == filename:
                if sid not in data["sharedWith"]:
                    return redirect(url_for('errorRoute', message="You are not allowed to download this file."))

        if not filename:
            return redirect(url_for('errorRoute', message="Filename is required."))

        file_path = os.path.join(UPLOAD_FOLDER, filename)
        print(f"Dosya yolu: {file_path}")

        if not os.path.exists(file_path):
            return redirect(url_for('errorRoute', message="File not found."))

        return send_from_directory(
            directory=UPLOAD_FOLDER,
            path=filename,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"Hata oluştu: {str(e)}")
        return redirect(url_for('errorRoute', message="An error occurred while processing your request."))
    
@app.route('/error', methods=['GET'])
def errorRoute():
    message = request.args.get('message', 'Unknown error')
    flash(f"Error: {message}", "error")
    return render_template("error.html")

@app.errorhandler(404)
def page_not_found(e):
    flash("Page not found", "error")
    return render_template("error.html", error=e), 404

if __name__ == '__main__':
    socketio.run(app, debug=False, host="0.0.0.0", port=444)