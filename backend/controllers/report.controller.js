const Report = require('../models/report.model');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createReport = async (req, res) => {
    try {
        const { description, type } = req.body;
        let locationData = JSON.parse(req.body.location || '{}');
        
        let imageUrl = null;

        if (req.file) {
            const fileName = `comp-${Date.now()}.webp`;
            const outputPath = path.join(__dirname, '../uploads/', fileName);
            
            // Compress image using sharp
            await sharp(req.file.path)
                .resize(800) // Resize to 800px width (maintaining aspect ratio)
                .webp({ quality: 80 }) // Convert to webp with 80% quality
                .toFile(outputPath);
            
            // Delete original file
            fs.unlinkSync(req.file.path);
            
            imageUrl = `/uploads/${fileName}`;
        }

        const newReport = new Report({
            location: {
                lat: parseFloat(locationData.lat) || 0,
                lng: parseFloat(locationData.lng) || 0,
                address: locationData.address || ''
            },
            description: description || 'Sin descripción',
            type: type || 'Palo de Luz',
            status: 'Pendiente',
            imageUrl: imageUrl,
            createdAt: new Date().toISOString()
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (err) {
        console.error("Create report error:", err);
        res.status(400).json({ message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedReport = await Report.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        if (updatedReport) {
            res.json(updatedReport);
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
