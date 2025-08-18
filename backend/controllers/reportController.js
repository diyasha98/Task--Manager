import Task from "../models/Task.js";
import User from "../models/User.js";
import exceljs from "exceljs";


// @desc Export all tasks as an Excel File
// @route GET /api/reports/export/tasks
// @access Private (Admin)
const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find().populate("assignedTo", "name email");
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");
        worksheet.columns = [
            { header: "Task ID", key: "taskId", width: 25 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Project Name", key: "projectName", width: 25 },
            { header: "Status", key: "status", width: 20 },
            { header: "Due Date", key: "dueDate", width: 15 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
            { header: "Created At", key: "createdAt" },
            { header: "Updated At", key: "updatedAt" },
        ];  
        tasks.forEach((task) => {
            const assignedTo = task.assignedTo
            .map((user) => `${user.name} (${user.email})`)
            .join(", ");
            worksheet.addRow({
                taskId: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                projectName: task.projectName,
                status: task.status,
                dueDate: task.dueDate.toISOString().split("T")[0],
                assignedTo: assignedTo || "Unassigned",
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
            });
        });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename='tasks_report.xlsx'");
        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        res.status(500).json({ message: "Error exporting tasks report", error: error.message });
    }
};

// @desc Export user-task report as an Excel File
// @route GET /api/reports/export/users
// @access Private (Admin)
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userTask = await Task.find().populate("assignedTo", "name email _id");

        // Debug: Log all unique status values
        const statusSet = new Set();
        userTask.forEach(task => {
            if (task.status) {
                statusSet.add(task.status);
            }
        });
        console.log("Unique status values found:", Array.from(statusSet));

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                userId: user._id,
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            };
        });

        userTask.forEach((task) => {
            console.log(`Processing task: ${task._id}, status: "${task.status}", assignedTo count: ${task.assignedTo?.length || 0}`);
            
            if (task.assignedTo && task.assignedTo.length > 0) {
                task.assignedTo.forEach((assignedUser) => {
                    if(userTaskMap[assignedUser._id]){
                        userTaskMap[assignedUser._id].taskCount++;
                        
                        // More flexible status matching (case-insensitive and handle common variations)
                        const status = task.status?.toLowerCase();
                        
                        if(status === "pending" || status === "todo" || status === "to-do"){
                            userTaskMap[assignedUser._id].pendingTasks++;
                            console.log(`Added pending task for user ${assignedUser.name}`);
                        } else if(status === "inprogress" || status === "in-progress" || status === "in progress" || status === "ongoing"){
                            userTaskMap[assignedUser._id].inProgressTasks++;
                            console.log(`Added in-progress task for user ${assignedUser.name}`);
                        } else if(status === "completed" || status === "done" || status === "finished"){
                            userTaskMap[assignedUser._id].completedTasks++;
                            console.log(`Added completed task for user ${assignedUser.name}`);
                        } else {
                            console.log(`Unknown status "${task.status}" for task ${task._id}`);
                        }
                    }
                });
            }
        });

        // Debug: Log final counts
        console.log("Final user task counts:");
        Object.values(userTaskMap).forEach(user => {
            console.log(`${user.name}: Total: ${user.taskCount}, Pending: ${user.pendingTasks}, In Progress: ${user.inProgressTasks}, Completed: ${user.completedTasks}`);
        });

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");
        worksheet.columns = [
            { header: "User ID", key: "userId", width: 25 },
            { header: "User Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 40 },
            { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
            { header: "Pending Tasks", key: "pendingTasks", width: 20 },
            { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
            { header: "Completed Tasks", key: "completedTasks", width: 20 },
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });
            
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename='users_report.xlsx'");
        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        res.status(500).json({ message: "Error exporting users report", error: error.message });
    }
};

export { exportTasksReport, exportUsersReport };
