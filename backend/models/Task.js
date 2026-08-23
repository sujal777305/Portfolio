const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: '{VALUE} is not a valid priority'
        },
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

taskSchema.pre('save', function () {
    if (this.title) {
        this.title = this.title.trim();
    }
});

module.exports = mongoose.model('Task', taskSchema);
