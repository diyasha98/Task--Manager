import Task from "../models/Task.js";

// @desc  GET all tasks (admin: all, user: only assigned tasks)
// @route  GET /api/tasks/
// @access Private
const getTasks = async (req, res) => {
    try {
        const {status} = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }
        let tasks;

        if (req.user.role === 'admin') {
            tasks = await Task.find(filter).populate('assignedTo', "name email profileImageUrl");
        } else {
            tasks = await Task.find({ assignedTo: req.user._id, ...filter }).populate('assignedTo', "name email profileImageUrl");
        }

        // Add completed todoChecklist count to each task
        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoChecklist.filter(
                    (item) => item.completed
                ).length;
                return {...task._doc, completedTodoCount: completedCount};
        })
    );

    // status summary counts
    const allTasks = await Task.countDocuments(
        req.user.role === 'admin' ? {} : {assignedTo: req.user._id}
    );

    const pendingTasks = await Task.countDocuments({
        ...filter,
        status: 'Pending',
        ...(req.user.role !== 'admin' && {assignedTo: req.user._id})
    });

    const inProgressTasks = await Task.countDocuments({
        ...filter,
        status: 'In Progress',
        ...(req.user.role !== 'admin' && {assignedTo: req.user._id})
    });

    const completedTasks = await Task.countDocuments({
        ...filter,
        status: 'Completed',
        ...(req.user.role !== 'admin' && {assignedTo: req.user._id})
    });

    res.json({
        tasks,
        statusSummary: {
            all: allTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
        },
    });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc  GET single task by id
// @route  GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo', 'name email profileImageUrl');
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc  POST create a new task
// @route  POST /api/tasks/
// @access Private
const createTask = async (req, res) => {
    try {
        const { 
            title,          // Matches your schema
            description, 
            projectName,    
            priority, 
            domain,        
            dueDate, 
            assignedTo, 
            attachments, 
            todoChecklist, 
            status 
        } = req.body;

        // Basic validation for required fields
        if (!title || !projectName || !dueDate) {
            return res.status(400).json({
                message: "Missing required fields: title, projectName, and dueDate are required"
            });
        }

        const task = await Task.create({
            title,          // Matches your schema
            description,
            projectName,    
            priority,
            domain,         
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            attachments,
            todoChecklist,
            status,
        });
        res.status(201).json({message:"Task created successfully", task});
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc  PUT update task details
// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
    try {
        const { title, description, projectName,  priority, domain, dueDate, assignedTo, attachments, todoChecklist, status } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, {
            title,          
            description,
            projectName,    
            priority,
            domain, 
            dueDate,         
            assignedTo,
            attachments,
            todoChecklist,
            status,         
        }, { new: true });
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json({message: "Task updated successfully", task});
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc  DELETE delete task by id (admin only)
// @route  DELETE /api/tasks/:id
// @access Private (Admin)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

//@desc  PUT update task status
//@route  PUT /api/tasks/:id/status
//@access Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        
        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );
        if(!isAssigned && req.user.role !== 'admin') {
            return res.status(403).json({ message: "not assigned to this task" });
        }

        task.status = req.body.status || task.status;

        if (task.status === 'Completed') {
            task.todoChecklist.forEach((item) => {
                item.completed = true;
            });
            task.progress = 100;
        }

        await task.save();
        res.status(200).json({message: "Task status updated successfully", task});
        
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc  PUT update task checklist
// @route  PUT /api/tasks/:id/checklist
// @access Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;  // Fixed: changed from 'todo' to 'todoChecklist'
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (!task.assignedTo.includes(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to update this task checklist" });
        }
        task.todoChecklist = todoChecklist; // Replace with the updated checklist
        
        // auto update progress based on checklist completion
        const totalItems = task.todoChecklist.length;
        const completedItems = task.todoChecklist.filter(item => item.completed).length;
        task.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        // Update task status if all items are completed
        if (task.progress === 100) {
            task.status = 'Completed';
        } else if (task.progress > 0) {
            task.status = 'In Progress';
        } else {
            task.status = 'Pending';
        }
        // Save the updated task
        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate('assignedTo', "name email profileImageUrl");
        res.status(200).json({message: "Task checklist updated successfully", task: updatedTask});
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc  GET dashboard data (admin only)
// @route  GET /api/tasks/dashboard-data
// @access Private (Admin)  
const getDashboardData = async (req, res) => {
    try {
        // Fetch task statistics
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ status: 'Pending' });
        const overdueTasks = await Task.countDocuments({ 
            status: {$ne: 'Completed'},
            dueDate: {$lt: new Date()},
        });
        const inProgressTasks = await Task.countDocuments({ 
            status: 'In Progress',
            dueDate: {$gt: new Date()},
        });

        // Ensure all possible tasks statuses are included
        const taskStatuses = ['Pending', 'In Progress', 'Completed'];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        // Format the task distribution data
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, ""); // Remove spaves for response keys
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
            }, {});

            taskDistribution['All'] = totalTasks; // Add total tasks to the distribution

            // Ensure all priority levels are included
            const taskpriorities = ['Low', 'Medium', 'High', 'Critical'];
            const taskPriorityLevelsRaw = await Task.aggregate([
                {
                    $group: {
                        _id: '$priority',
                        count: { $sum: 1 },
                    },
                },
            ]);
            // Format the priority distribution data
            const taskPriorityLevels = taskpriorities.reduce((acc, priority) => {
                const formattedKey = priority.replace(/\s+/g, ""); // Remove spaces for response keys
                acc[formattedKey] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
                return acc;
            }, {});

            //Fetch recent 10 tasks
            const recentTasks = await Task.find().sort({ createdAt: -1 }).limit(10).select("title description projectName priority status dueDate createdAt assignedTo createdBy");

            res.status(200).json({
                statistics: {
                    totalTasks,
                    pendingTasks,
                    completedTasks,
                    overdueTasks
                },
                charts: {
                    taskDistribution,
                    taskPriorityLevels,
                },
                recentTasks,
            });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc  GET user dashboard data (user-specific)
// @route  GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id; // only fetch data for the logged-in user

        // Fetch task statistics for the user
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' });
        const overdueTasks = await Task.countDocuments({ 
            assignedTo: userId,
            status: {$ne: 'Completed'},
            dueDate: {$lt: new Date()},
        });
        const inProgressTasks = await Task.countDocuments({ 
            assignedTo: userId,
            status: 'In Progress',
            dueDate: {$gt: new Date()},
        });

        // Task Distribution by Status
        const taskStatuses = ['Pending', 'In Progress', 'Completed'];
        const taskDistributionRaw = await Task.aggregate([
            {
                $match: { assignedTo: userId },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Format the task distribution data
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});

        taskDistribution['All'] = totalTasks; // Add total tasks to the distribution

        // Task Distribution by Priority
        const taskPriorities = ['Low', 'Medium', 'High', 'Critical'];
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $match: { assignedTo: userId },
            },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Format the priority distribution data
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            const formattedKey = priority.replace(/\s+/g, ""); // Remove spaces for response keys
            acc[formattedKey] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        // Fetch recent 10 tasks for the logged-in user
        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title description projectName priority status dueDate createdAt assignedTo createdBy");

            res.status(200).json({
                statistics: {
                    totalTasks,
                    pendingTasks,
                    completedTasks,
                    overdueTasks,
                    inProgressTasks,
                },
                charts: {
                    taskDistribution,
                    taskPriorityLevels,
                },
                recentTasks,
            });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export { 
    getTasks, 
    getTaskById, 
    createTask, 
    updateTask,
    deleteTask, 
    updateTaskStatus, 
    updateTaskChecklist,
    getDashboardData, 
    getUserDashboardData 
};