import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        assignedTo: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
        completed: { type: Boolean, default: false },
    }
);

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        projectName: { type: String, required: true, trim: true }, // trim Removes whitespace from both ends
        priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
        status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
        domain: {type: String, enum: ["Sales", "Management", "Marketing", "Operations", "IT & Technical", "Testing"], required: false},
        dueDate: {type: Date, required: true }, 
        assignedTo: [{type: mongoose.Schema.Types.ObjectId, ref:"User" }],
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
        attachments: [{type: String }],
        todoChecklist: [todoSchema],
        progress: {type: Number, default: 0, min: 0, max: 100 }
    },
    {timestamps: true}
);

export default mongoose.model("Task", taskSchema);