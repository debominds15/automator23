const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    patientName: {
        type: String,
        required: false,
    },
    patientAge: {
        type: String,
        required: false,
    },
    height: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    bmi: {
        type: String,
        required: true,
    },
    scannedBy: {
        type: String,
        required: false,
    },
    isFirstVisit: {
        type: Boolean,
        required: false,
    },
    scanned_on: {
        type: String,
        required: false,
    },
    fhr: {
        type: String,
        required: true,
    },
    ga: {
        type: String,
        required: true,
    },
    mvp: {
        type: String,
        required: true,
    },
    placentaLocation: {
        type: String,
        required: true,
    },
    pdfUrl: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Scan", scanSchema);