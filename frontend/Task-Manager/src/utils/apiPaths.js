export const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://task-manager-dp7p.onrender.com";;

//utils/apiPaths.js
export const API_Paths = {
    AUTH: {
        REGISTER: "/api/auth/register", // Register a new user (Admin or Member)
        LOGIN: "/api/auth/login", // Login a user (Admin or Member) Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    },
    USERS: {
        GET_ALL_USERS: "/api/users", // Get all users (Admin only)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user by ID 
        CREATE_USER: "/api/users", // Create a new user (Admin only)
        UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user by ID (Admin only)
        DELETE_USER: (userId) => `/api/users/${userId}`, // Delete user by ID (Admin only)
    },
    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get dashboard data (Admin or Member)
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get user dashboard data (Admin or Member)
        GET_ALL_TASKS: "/api/tasks", // Get all tasks (Admin or Member)
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID 
        CREATE_TASK: "/api/tasks", // Create a new task (Admin or Member)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task by ID (Admin or Member)
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete task by ID (Admin or Member)

        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update task status by ID (Admin or Member)
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update todo checklist by ID (Admin or Member)
    },
    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks", // Export tasks report as an Excel File
        EXPORT_USERS: "/api/reports/export/users", // Export users report as an Excel File
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image", // Upload an image (Admin or Member)
    }
}