import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true, 
            unique: true,
            trim: true 
        },
        description: { type: String },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

export default mongoose.model("Project", projectSchema);