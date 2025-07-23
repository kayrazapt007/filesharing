import os

def dosya_boyutu(dosya_yolu):
    try:
        # Dosya boyutunu bayt cinsinden al
        boyut_bayt = os.path.getsize(dosya_yolu)
        # Baytı gigabayta çevir (1 GB = 1024 * 1024 * 1024 bayt)
        boyut_gb = boyut_bayt / (1024 * 1024 * 1024)
        
        if boyut_gb >= 1:
            # GB cinsinden, 2 ondalık basamakla yuvarla
            return f"{round(boyut_gb, 2)} GB"
        else:
            # MB cinsinden, 2 ondalık basamakla yuvarla (1 MB = 1024 * 1024 bayt)
            boyut_mb = boyut_bayt / (1024 * 1024)
            return f"{round(boyut_mb, 2)} MB"
    except FileNotFoundError:
        return "Dosya bulunamadı"
    except Exception as e:
        return f"Hata: {e}"