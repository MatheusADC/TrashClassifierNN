const MODEL_PATH = "/model/"; 

let model, labelContainer, maxPredictions;

async function loadModel() {
    const modelURL = MODEL_PATH + "model.json";
    const metadataURL = MODEL_PATH + "metadata.json";
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; 

    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = document.getElementById("image-preview");
    img.src = window.URL.createObjectURL(file);
    img.style.display = "block";

    document.getElementById("classify-button").disabled = false;
}

async function classifyImage() {
    const img = document.getElementById("image-preview");
    if (!img.src || img.style.display === "none") return;

    const prediction = await model.predict(img);

    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + "%";
        const resultDiv = document.createElement("div");
        resultDiv.innerHTML = classPrediction;
        labelContainer.appendChild(resultDiv);
    }
}

window.onload = async () => {
    await loadModel();
    document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
    document.getElementById("classify-button").addEventListener("click", classifyImage);
};
