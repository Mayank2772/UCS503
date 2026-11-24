const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        documentType: {
            type: String,
            required: true,
        },

        fileName: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
            required: true,
        },

        fileSize: {
            type: Number,
            required: true,
        },

        // Resume files are kept in MongoDB so uploads survive browser/device changes.
        data: {
            type: Buffer,
            required: true,
        },

        filePath: {
            type: String,
            default: "database",
        },

        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        verifiedAt: Date,
    },
    {
        timestamps: true,
    },
);

documentSchema.index({ studentId: 1, documentType: 1 }, { unique: true });

module.exports = mongoose.model(
    "Document",
    documentSchema,
);