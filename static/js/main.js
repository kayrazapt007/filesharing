var socket = io();


const form = document.querySelector('.form')
const responseP = document.querySelector('.response')
const inputs = document.querySelector('.inputs')

function uncheckAllCheckboxes() {
    document.querySelectorAll('.form input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

const turkceToIngilizce = {
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
};

function createButton() {
    const form = document.querySelector(".form")
    const button = document.createElement("button")
    button.disabled = true;
    button.setAttribute("onclick", "clickedWhileDisabled(event)")

    button.className = "py-2 opacity-50 cursor-not-allowed shareButton px-4 bg-gray-600 mt-4 text-white rounded hover:bg-gray-700"
    button.textContent = "Share"
    
    form.appendChild(button)
}

function clickedWhileDisabled(event) {
    const status = document.getElementById('status');
    status.textContent = 'Please select a file and check at least one user!';
    status.className = 'text-red-600 col-span-9 m-4 text-xl';
    event.preventDefault(); 
}

function createInput(filename) {
    const form = document.querySelector(".form");
    const inputFilename = document.createElement("input");

    inputFilename.className = "hidden createdInput";
    inputFilename.value = filename;
    inputFilename.setAttribute("value", filename)
    inputFilename.type = "text";
    inputFilename.name = "filename";
    
    form.appendChild(inputFilename);
};


document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('dropzone-file');
    const selectedFileText = document.getElementById('selected-file');
    const drawer = document.getElementById('drawer-top-example');
    
    const uploadButton = document.getElementById('uploadButton');
    const closeDrawerButton = document.querySelector('[data-drawer-hide="drawer-top-example"]');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const status = document.getElementById('status');

    function showDrawer() {
        drawer.classList.remove('-translate-y-full');
        drawer.setAttribute('aria-hidden', 'false');
    }

    function hideDrawer() {
        drawer.classList.add('-translate-y-full');
        drawer.setAttribute('aria-hidden', 'true');
    }

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const createdInput = document.querySelector(".createdInput")

        if (file) {
            progressBar.value = "0"
            progressText.textContent = "0%"
            selectedFileText.textContent = `Selected File: ${file.name}`;
            status.textContent = ""
            responseP.textContent = ""
            try {
                createdInput.remove()
            } catch (error) {
                console.warn("Not found createdInput")
            }
            uncheckAllCheckboxes()

            showDrawer();
        } else {
            progressBar.value = "0"
            progressText.textContent = "0%"
            status.textContent = ""
            selectedFileText.textContent = 'You can upload anything except folders.';
            responseP.textContent = ""
            try {
                createdInput.remove()
            } catch (error) {
                console.warn("Not found createdInput")
            }
            uncheckAllCheckboxes()

            hideDrawer();
        }
    });

    const dropZone = document.querySelector('label[for="dropzone-file"]');
    dropZone.addEventListener('dragover', function(event) {
        event.preventDefault();
        dropZone.classList.add('border-blue-500');
    });

    dropZone.addEventListener('dragleave', function(event) {
        dropZone.classList.remove('border-blue-500');
    });

    dropZone.addEventListener('drop', function(event) {
        event.preventDefault();
        dropZone.classList.remove('border-blue-500');
        const file = event.dataTransfer.files[0];
        if (file) {
            fileInput.files = event.dataTransfer.files;
            selectedFileText.textContent = `Selected File: ${file.name}`;
            showDrawer();
        }
    });

    closeDrawerButton.addEventListener('click', function() {
        hideDrawer();
        fileInput.value = '';
        selectedFileText.textContent = 'You can upload anything except folders.';
    });

    uploadButton.addEventListener('click', async function() {
        if (!fileInput.files[0]) {
            status.textContent = 'Please select a file!';
            status.className = 'text-red-600 col-span-9 m-4 text-xl';
            return;
        }


        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        window.fileName = fileInput.files[0].name;
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);
        socket.emit('fileOwnerNotification', {"filename": fileName})
        createInput(fileName);

        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                progressBar.value = percentComplete;
                progressText.textContent = `${Math.round(percentComplete)}%`;
            }
        };

        xhr.onload = function() {
            try {
                const response = JSON.parse(xhr.responseText);
                if (xhr.status === 200) {
                    const shareButton = document.querySelector('.shareButton');
                    shareButton.disabled = false;
                    shareButton.classList.remove('opacity-50', 'cursor-not-allowed');
                    shareButton.removeAttribute('onclick');

                    status.textContent = response.message;
                    status.className = 'text-green-600 col-span-9 m-4 text-xl';
                    fileInput.value = '';
                    selectedFileText.textContent = 'You can upload anything except folders.';
                } else {
                    status.textContent = response.error;
                    status.className = 'text-red-600 col-span-9 m-4 text-xl';
                }
            } catch (e) {
                status.textContent = 'The server returned an invalid response!';
                status.className = 'text-red-600 col-span-9 m-4 text-xl';
                console.error('JSON parse hatası:', e, 'Yanıt:', xhr.responseText);
            }
        };

        xhr.onerror = function() {
            status.textContent = 'An error ocurred while uploading file!';
            status.className = 'text-red-600 col-span-9 m-4 text-xl';
        };

        xhr.send(formData);
    });
});





const list = document.querySelector(".list")


socket.on('clientData', function (msg) {
    const userAgent = window.navigator.userAgent
    socket.emit('clientData', {userAgent:userAgent} );
})

socket.on('yourDevice', function(client){
    window.myName = client["name"]
    window.myDevice = client["device"]
});
const myNameElement = document.querySelector(".myName")
const myDeviceElement = document.querySelector(".myDevice")

socket.on('client_list', function(clients){
    list.innerHTML = ""
    clients.forEach(element => {
        
        if (element["name"] == window.myName  && element["device"]  == window.myDevice) {
            
            myDeviceElement.textContent = window.myDevice;
            myNameElement.textContent = ' ' + window.myName + '(You)';
        
        } else {
            const mainLi = document.createElement("li")
            const spanInsideLi = document.createElement("span")
            const spanInsideSecondLi = document.createElement("span")
            mainLi.classList.add("text-green-400")
            
            mainLi.classList.add("text-xl", "mt-3")
            
            spanInsideLi.classList.add("text-white")
            spanInsideLi.textContent = element["device"]
            
            spanInsideSecondLi.classList.add("text-gray-400")
            spanInsideSecondLi.textContent = " " + element["name"]
            
            list.appendChild(mainLi)
            mainLi.appendChild(spanInsideLi)
            mainLi.appendChild(spanInsideSecondLi)
        }
    });

    
    
    const form = document.querySelector(".form")
    
    form.innerHTML = ""
    clients.forEach(element => {
        
        if (element["name"] != window.myName  || element["device"]  != window.myDevice) {
            const inputBox = document.createElement("input")
            const labelBox = document.createElement("label")
            const labelFirstSpan = document.createElement("span")
            const labelSecondSpan = document.createElement("span")
            const br = document.createElement("br")
            
            const name = element["name"]
            const nameFixed = name
                                .toLowerCase()
                                .replace(/\s/g, '')
                                .replace(/[ğüşıöç]/g, harf => turkceToIngilizce[harf] || harf);
            
            const device = element["device"]

            inputBox.type = "checkbox"
            inputBox.name = nameFixed
            inputBox.id = nameFixed + "Checkbox"
            labelBox.htmlFor = nameFixed
            labelBox.classList.add("text-xl", "mt-3", "text-white", "m-1", 'rounded-xl')
            labelFirstSpan.textContent = device
            labelSecondSpan.textContent = ' ' + name
            labelSecondSpan.classList.add("text-gray-400")
            labelBox.appendChild(labelFirstSpan)
            labelBox.appendChild(labelSecondSpan)
            
            form.appendChild(inputBox)
            form.appendChild(labelBox)
            form.appendChild(br)
        }
    });

    createButton();


});




socket.on('aFileSharedWithYou', function (msg) {
    const fileSize = msg["dataWeight"]
    const fileName = msg["filename"]
    const owner = msg["owner"]
    const ownerDevice = msg["device"]
    
    const sharedFilesMainDiv = document.querySelector('.sharedFilesMainDiv')
    const div = document.createElement('div')
    const img = document.createElement('img')
    const pDataSize = document.createElement('p')
    const pDataName = document.createElement('p')
    const pSharedBy = document.createElement('p')
    const button = document.createElement('button')
    
    div.className = "md:col-span-2 col-span-6 border-2 border-white p-4 rounded-lg shadow-lg"
    
    img.src = "/static/images/file.png"
    img.className = "m-0 m-auto w-14"
    img.width = "30%"
    img.alt = "File Icon"
    
    pDataSize.className = "text-center text-gray-400 text-sm"
    pDataSize.textContent = fileSize

    pDataName.className = "text-center text-white text-xl"
    pDataName.textContent = fileName

    pSharedBy.className = "text-center text-gray-400 text-base"
    pSharedBy.textContent = ownerDevice + " (" + owner + ") tarafından paylaşıldı."

    button.className = "p-1 m-0 m-auto block mt-4 text-center bg-white text-black text-lg rounded-lg w-2/3"
    button.textContent = "Download"
    button.setAttribute("data-filename", fileName)
    button.setAttribute("onclick", "clickedDownload(event)")

    div.appendChild(img)
    div.appendChild(pDataSize)
    div.appendChild(pDataName)
    div.appendChild(pSharedBy)
    div.appendChild(button)
    
    sharedFilesMainDiv.appendChild(div)
    
})


form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
        const drawer = document.getElementById('drawer-top-example');
        const button = document.querySelector(".shareButton");
        
        function hideDrawer() {
            drawer.classList.add('-translate-y-full');
            drawer.setAttribute('aria-hidden', 'true');
        }
        
        const response = await fetch('/shareFileWithUsers', {method:'POST', body:formData})
        
        const data = await response.json();
        
        const message = data["message"]
        responseP.className = "text-green-600 font-semibold response"
        responseP.textContent = message
        
        button.disabled = true;
        button.className = "py-2 opacity-50 cursor-not-allowed shareButton px-4 bg-gray-600 mt-4 text-white rounded hover:bg-gray-700"

        setTimeout(hideDrawer, 4000);
        
    } catch (error) {
        responseP.textContent = "HATA: " + error.message;
        responseP.className = "text-red-600 font-semibold response"
        button.disabled = true;
        button.className = "py-2 opacity-50 cursor-not-allowed shareButton px-4 bg-gray-600 mt-4 text-white rounded hover:bg-gray-700"

        console.error(error.message)
    }
})

async function submitDownloadButton(filename) {
    try {
        const json = { "filename": filename };
        const response = await fetch('/processDownloadJob', {
            method: 'POST',
            body: JSON.stringify(json),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const data = await response.json();
            console.error(data.error);
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Hata:', error.message);
    }
}

function clickedDownload(event) {
    const filename = event.target.getAttribute("data-filename");
    var sid = socket.id;
    
    const downloadUrl = `/download/${encodeURIComponent(filename)}/${sid}`;
    
    window.open(downloadUrl, '_blank');
}