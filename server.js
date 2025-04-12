const express = require("express");
const multer = require("multer");
const tf = require("@tensorflow/tfjs");
const path = require("path");
const app = express();
const port = 3000;

const upload = multer({ storage: multer.memoryStorage() });

const modelPath = path.join(__dirname, "model");

let model;

async function loadModel() {
    try {
        model = await tf.loadGraphModel(`file://${modelPath}/model.json`);
        console.log("Model loaded!");
    } catch (error) {
        console.error("Error loading the model:", error);
    }
}

loadModel();

app.use(express.static(path.join(__dirname, "public")));
app.use("/model", express.static(modelPath));

app.post("/classify", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    try {
        const imageBuffer = req.file.buffer;
        const tensor = tf.node.decodeImage(imageBuffer).expandDims(0);

        if (!model) {
            return res.status(500).json({ error: "Model not loaded correctly" });
        }

        const predictions = await model.predict(tensor);

        const results = predictions.map((p) => ({
            className: p.className,
            probability: (p.probability * 100).toFixed(2) + "%",
        }));

        res.json({ predictions: results });
    } catch (error) {
        console.error("Error classifying image:", error);
        res.status(500).json({ error: "Error processing the image" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
