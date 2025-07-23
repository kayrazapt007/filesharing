import os
import shutil
def clearCache():

    cache_dir = 'uploads/'
    
    if os.path.exists(cache_dir):
        shutil.rmtree(cache_dir)
        os.mkdir(cache_dir)
        print(f"Cache cleared: {cache_dir} has been cleared.")
    else:
        print(f"No cache found at {cache_dir}.")