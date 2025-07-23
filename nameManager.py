import random

chosenNames = []
combinedData = []

try:
    with open('names.txt') as f:
        s = f.read()
        nameList = s.split('\n')
        unModifiedNameList = s.split('\n')
except Exception as e:
    print(f"ERROR! {e}")

def getNewName():
    while True:
        if not len(chosenNames) == len(unModifiedNameList) - 1:
            selectName = random.choice(nameList)
            
            if selectName in chosenNames:
                print("Name " + selectName + " is already selected so choosing another one.")
    
            else:
                chosenNames.append(selectName)
                nameList.remove(selectName)
                # print("Selected name: " + selectName + " Appended to list and removed global list")
                return selectName
                # userValues = {
                #     "sid": "sid",
                #     "uname": selectName
                # }
                # combinedData.append(userValues)
                # # print(f"Data senkronlandı: {userValues}")

            # print(f"Toplam kişi sayısı {len(chosenNames)}")
            # print(f"Kişiler: {chosenNames}")
        else:
            return "All names in the list are currently in use."
        
def getNames():
    return chosenNames 
        
def addNewName(name):
    nameList.append(name)
    chosenNames.remove(name)
    # print(f"Succesfully added new name: {name}")

def originalNameList():
    return unModifiedNameList