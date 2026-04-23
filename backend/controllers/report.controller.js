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
            try {
                // Compress image buffer directly using sharp
                const compressedBuffer = await sharp(req.file.buffer)
                    .resize(800, null, { withoutEnlargement: true })
                    .webp({ quality: 60 }) // Lower quality for base64 storage efficiency
                    .toBuffer();
                
                // Convert buffer to base64 string
                const base64Image = compressedBuffer.toString('base64');
                imageUrl = `data:image/webp;base64,${base64Image}`;
            } catch (sharpError) {
                console.error("Sharp compression failed, using original buffer:", sharpError);
                const base64Image = req.file.buffer.toString('base64');
                imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            }
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
