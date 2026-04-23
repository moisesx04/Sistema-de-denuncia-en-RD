const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    imageUrl: { type: String }, // Made optional to allow testing without images
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['Palo de Luz', 'Hoyo', 'Carro Chatarra', 'Basura'],
        default: 'Palo de Luz'
    },
    status: {
        type: String,
        enum: ['Pendiente', 'En proceso', 'Resuelto'],
        default: 'Pendiente'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
