def getDeviceModel(userAgent):
    userAgentData = userAgent["userAgent"]
    
    if "Windows" in userAgentData:
        return "🖥️ Windows"
    if "Android" in userAgentData:
        return "📱 Android"
    if "iPhone" in userAgentData:
        return "🍎 iPhone"
    if "Linux" in userAgentData:
        return "🖥️ Linux"
    if "Macintosh" in userAgentData:
        return "🍎 Mac"
    if "X11" in userAgentData:
        return "🖥️ Linux"