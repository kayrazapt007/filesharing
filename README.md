# 📁 FileSharing

**FileSharing** is a Python Flask-based file sharing web application designed to work primarily on local networks. It enables seamless file sharing between all internet-connected devices within the same network. The app features a responsive design, making it accessible on both desktop and mobile devices.

## 🚀 Features

- 🌐 Share files with **all internet-connected devices** on the same local network.  
- 🧭 Designed with a **local network focus** for fast and secure file transfers.  
- 🆔 Each user is assigned a **unique nickname** automatically for easy identification.  
- ✏️ You can **customize user nicknames** by editing the `names.txt` file.  
- ♻️ Files uploaded are **automatically deleted** each time the application starts or stops, preventing unnecessary storage usage.  
- 🎯 When sharing files, you can **select which devices** will receive the file.  
- 🔍 Provides **detailed feedback** about the file sharing process, including which devices received the file.

## ⚠️ Important Notice For Windows Users

When closing the application, you may see the following prompt in the terminal:
Terminate batch job (Y/N):
**Please respond with `N`**, otherwise other Python applications running on your system may be affected or unexpectedly closed.

## 🛠 Installation and Usage

1. Ensure **Python 3** is installed on your system.  
2. Run the application by double-clicking `start.bat`.  
3. The application will open in your default browser automatically, or you can visit `http://127.0.0.1:444`.  
4. Other devices on the same network can access the app through your local IP address to start sharing files.

## 📄 License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute it, provided proper attribution is given.

---

**FileSharing** – Simple, secure, and fast local network file sharing.  
