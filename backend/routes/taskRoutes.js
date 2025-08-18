import express from "express";
import { adminOnly, protect } from '../middlewares/authMiddleware.js';
import { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist } from '../controllers/taskController.js';

const router = express.Router();

//Task Management Route
router.get("/dashboard-data", protect, adminOnly, getDashboardData); //load Dashboard
router.get("/user-dashboard-data", protect, getUserDashboardData); //load User Dashboard
router.get("/", protect, getTasks); //get all tasks (admin: all, user:assigned)
router.get("/:id", protect, getTaskById); //get single task by id
router.post("/", protect, createTask); //create a task
router.put("/:id", protect, updateTask); //update task details
router.delete("/:id", protect, adminOnly, deleteTask); //delete task by id (admin only)
router.put("/:id/status", protect, updateTaskStatus); //update task status
router.put("/:id/todo", protect, updateTaskChecklist); //update task checklist

export default router;
