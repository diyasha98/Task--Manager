import Task from "../models/Task.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc Get all users (admin only)
// @route GET /api/ users/
// @acess Private 
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({role: 1, createdAt: -1});

        // add task counts to each user 
        const userWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({
                assignedTo: user._id, 
                status: "Pending",
            });
            const inProgressTasks = await Task.countDocuments({
                assignedTo: user._id, 
                status: "In Progress",
            });
            const completedTasks = await Task.countDocuments({
                assignedTo: user._id, 
                status: "Completed",
            });

            return {
                ...user._doc, //Include all existing user data
                pendingTasks,
                inProgressTasks,
                completedTasks
            };
        }));
        res.json(userWithTaskCounts);
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// @desc  Get user by ID 
// @route GET/api/users/:id
// @acess Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password")
        if(!user) return res.status(404).json({message: "User not found"});
        res.json(user);
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// @desc  Delete a user by ID (admin only)
// @route DELETE/api/users/:id
// @acess Private (Admin)

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete individual tasks (where user is the only one assigned)
        await Task.deleteMany({ 
            assignedTo: [id] // Tasks where only this user is assigned
        });

        // Remove user from group tasks (where multiple users are assigned)
        await Task.updateMany(
            { 
                assignedTo: id,
                $expr: { $gt: [{ $size: "$assignedTo" }, 1] } // Only tasks with more than 1 user
            },
            { $pull: { assignedTo: id } }
        );

        // Delete the user
        await User.findByIdAndDelete(id);

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

export {getUsers, getUserById, deleteUser};