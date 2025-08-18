import express from 'express';
import { adminOnly, protect } from '../middlewares/authMiddleware.js';
import { deleteUser, getUserById, getUsers } from '../controllers/UserController.js';

const router = express.Router();

// USER Management Routes
router.get("/", protect, getUsers); //get all users
router.get("/:id", protect, getUserById); // get a specific user
router.delete("/:id", protect, adminOnly, deleteUser); // Delete User (admin only)

export default router;