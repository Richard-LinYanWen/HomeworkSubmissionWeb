const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    hwNumber: { 
        type: String, 
        required: true 
    },
    fileName: { 
        type: String, 
        required: true 
    },
    // This stores the raw C++ code text in the cloud
    codeContent: { 
        type: String, 
        required: true 
    },
    submittedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Important: This handles the "Not a constructor" error by exporting correctly
module.exports = mongoose.model('submission', submissionSchema);