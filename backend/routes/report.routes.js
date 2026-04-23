const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const reportController = require('../controllers/report.controller');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Aumentado a 10MB
    fileFilter: (req, file, cb) => {
        // Permitir todas las imágenes comunes y PDFs
        const filetypes = /jpeg|jpg|png|webp|gif|svg|pdf|heic|heif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb(new Error('Formato de archivo no soportado. Usa imágenes o PDF.'));
        }
    }
});

// Routes
router.get('/', reportController.getReports);
router.post('/', upload.single('image'), reportController.createReport);
router.put('/:id/estado', reportController.updateStatus);

module.exports = router;
