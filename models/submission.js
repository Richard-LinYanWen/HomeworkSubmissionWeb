const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentName: { type: String, required: true }, // The "Who"
    homeworkId: { type: String, required: true },  // The "Which one"
    fileName: String,                             // The "What"
    submittedAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model('submission', submissionSchema);