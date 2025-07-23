turkishToEnglish = {
    'ğ': 'g',
    'ü': 'u',
    'ş': 's',
    'ı': 'i',
    'ö': 'o',
    'ç': 'c',
    'Ğ': 'G',
    'Ü': 'U',
    'Ş': 'S',
    'İ': 'I',
    'Ö': 'O',
    'Ç': 'C'
}

# Metni düzenleme fonksiyonu
def editText(text):
    # Küçük harfe çevir ve boşlukları kaldır
    text = text.lower().replace(' ', '')
    # Türkçe karakterleri İngilizce'ye çevir
    for turkish, english in turkishToEnglish.items():
        text = text.replace(turkish, english)
    return text