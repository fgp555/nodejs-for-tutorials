const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const uploadDir = "uploads/";
const dataMock = []; // Array para almacenar los datos de los archivos subidos

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const customName = req.body.name ? Date.now() + "_" + req.body.name.replace(/\s+/g, "_") + extension : Date.now() + "_" + file.originalname;
    cb(null, `${customName}`);
  },
});

// Multer para permitir **solo imágenes**
const uploadImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    return extName && mimeType ? cb(null, true) : cb(new Error("Solo imágenes permitidas"));
  },
});

// Multer para permitir **cualquier tipo de archivo**
const uploadAllFiles = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Límite de 50MB
});

// Endpoint para subir **solo imágenes**
router.post("/upload/image", uploadImages.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ninguna imagen" });
  }

  const { name, description } = req.body;
  const imageData = {
    id: dataMock.length + 1,
    type: "image",
    originalName: req.file.originalname,
    newName: req.file.filename,
    description: description || "Sin descripción",
    path: path.join(uploadDir, req.file.filename),
    uploadedAt: new Date(),
  };

  dataMock.push(imageData);

  res.json({
    message: "Imagen subida exitosamente",
    file: req.file,
    dataMock,
  });
});

// Nuevo Endpoint para subir **cualquier tipo de archivo**
router.post("/upload/allTypes", uploadAllFiles.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  const { name, description } = req.body;
  const fileData = {
    id: dataMock.length + 1,
    type: "file",
    originalName: req.file.originalname,
    newName: req.file.filename,
    description: description || "Sin descripción",
    path: path.join(uploadDir, req.file.filename),
    uploadedAt: new Date(),
  };

  dataMock.push(fileData);

  res.json({
    message: "Archivo subido exitosamente",
    file: req.file,
    dataMock,
  });
});

// Endpoint para obtener todos los archivos subidos
router.get("/getAll", (req, res) => {
  res.json(dataMock);
});

module.exports = router;
