import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_Paths } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import DeleteAlert from '../../components/layouts/DeleteAlert';

const ManageTasks = () => {

  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  
  // States for delete confirmation
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const getAllTasks = async () => {
    try{
      const response = await axiosInstance.get(API_Paths.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus
        },
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // Map statusSummary data with fixed labels and order
      const statusSummary = response.data?.statusSummary || {};

      const statusArray = [
        { label: "All", count: statusSummary.all || 0},
        {label: "Pending", count: statusSummary.pendingTasks || 0},
        {label: "In Progress", count: statusSummary.inProgressTasks || 0},
        {label: "Completed", count: statusSummary.completedTasks || 0}
      ];

      setTabs(statusArray);
    } catch (error){
      console.log("Error fetching users:", error)
    }
  };

  // Original click handler (you can remove this if not needed anymore)
  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, {state: {taskId: taskData._id}});
  };

  // Kebab menu action handlers
  const handleEditTask = (taskData) => {
    navigate(`/admin/create-task`, {state: {taskId: taskData._id}});
  };

  const handleViewTask = (taskData) => {
    navigate(`/admin/task-details/${taskData._id}`);
  };

  const handleDuplicateTask = async (taskData) => {
    try {
      console.log("Original task data:", taskData); // Debug log
      
      // Extract assignedTo IDs properly - handle both populated and unpopulated cases
      let assignedToIds = [];
      if (taskData.assignedTo && Array.isArray(taskData.assignedTo)) {
        assignedToIds = taskData.assignedTo.map(user => {
          // If user is already an ID (string), return it
          if (typeof user === 'string') {
            return user;
          }
          // If user is an object with _id, extract the _id
          if (user && user._id) {
            return user._id;
          }
          // Fallback
          return user;
        }).filter(id => id); // Remove any undefined/null values
      }

      // Process todoChecklist properly
      const processedTodoList = taskData.todoChecklist?.map(todo => {
        // Handle assignedTo in todo items
        let todoAssignedTo = null;
        if (todo.assignedTo) {
          if (typeof todo.assignedTo === 'string') {
            todoAssignedTo = todo.assignedTo;
          } else if (todo.assignedTo._id) {
            todoAssignedTo = todo.assignedTo._id;
          }
        }

        return {
          title: todo.title,
          assignedTo: todoAssignedTo,
          completed: false // Reset completion status
        };
      }) || [];

      // Create a copy of the task data
      const duplicateTaskData = {
        title: `${taskData.title} (Copy)`,
        description: taskData.description,
        projectName: taskData.projectName,
        priority: taskData.priority,
        domain: taskData.domain,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Set due date 7 days from now
        assignedTo: assignedToIds, // Use properly extracted IDs
        todoChecklist: processedTodoList,
        attachments: taskData.attachments || [] // Copy attachments if you want them
      };

      console.log("Duplicate task data being sent:", duplicateTaskData); // Debug log

      const response = await axiosInstance.post(API_Paths.TASKS.CREATE_TASK, duplicateTaskData);
      
      if (response.data) {
        toast.success("Task duplicated successfully");
        getAllTasks(); // Refresh the task list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error duplicating task");
      console.error("Error duplicating task:", error);
      console.error("Full error response:", error.response); // Debug log
    }
  };

  const handleDeleteTask = (taskData) => {
    setTaskToDelete(taskData);
    setOpenDeleteAlert(true);
  };

  // Create a dedicated close handler
  const handleCloseDeleteModal = () => {
    setOpenDeleteAlert(false);
    setTaskToDelete(null);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await axiosInstance.delete(API_Paths.TASKS.DELETE_TASK(taskToDelete._id));
      toast.success("Task deleted successfully");
      handleCloseDeleteModal(); // Use the dedicated close handler
      getAllTasks(); // Refresh the task list
    } catch (error) {
      toast.error(`Error deleting task: ${error.response?.data?.message || error.message}`);
      console.error("Error deleting task:", error);
    }
  };

  // download task report 
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_Paths.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download","task_details.xlsx")
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading Task details:", error)
      toast.error("Failed to download Task details. Please try again.")
    }
  };

  useEffect(() => {
    getAllTasks(filterStatus);
    
    // Set up an interval to refresh tasks periodically (optional)
    const intervalId = setInterval(() => {
      getAllTasks(filterStatus);
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [filterStatus]);

  // Handle refresh when coming back from edit page
  useEffect(() => {
    if (location.state?.refresh) {
      getAllTasks(filterStatus);
      // Clear the refresh state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, filterStatus]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
        <div className='my-5'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-8'>
            <div className='flex items-center justify-between gap-3'>
              <h2 className='text-xl md:text-xl font-medium'>My Tasks</h2>

              <button 
                className='flex lg:hidden download-btn'
                onClick={handleDownloadReport}
              >
                <LuFileSpreadsheet className='text-lg' />
                Download Report
              </button>
            </div>

            {tabs?.[0]?.count > 0 && (
              <div className='flex flex-col lg:flex-row lg:items-center lg:ml-auto gap-3'>
                <TaskStatusTabs
                  tabs= {tabs}
                  activeTab= {filterStatus}
                  setActiveTab= {setFilterStatus}
                />

                <button className='hidden lg:flex download-btn' onClick={handleDownloadReport}>
                  <LuFileSpreadsheet className='text-lg' />
                  Download Report
                </button>
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
            {allTasks?.map((item, index) => (
              <TaskCard
                key = {item._id}
                title = {item.title}
                description = {item.description}
                priority = {item.priority}
                projectName = {item.projectName}
                domain = {item.domain}
                status = {item.status}
                progress = {item.progress}
                createdAt = {item.createdAt}
                dueDate = {item.dueDate}
                assignedTo = {item.assignedTo?.map((user) => user.profileImageUrl)}
                attachmentCount = {item.attachments?.length || 0}
                completedTodoCount = {item.completedTodoCount || 0}
                todoChecklist = {item.todoChecklist || []}
                taskData = {item} // Pass the entire task object
                // Kebab menu action handlers
                onEdit = {handleEditTask}
                onView = {handleViewTask}
                onDuplicate = {handleDuplicateTask}
                onDelete = {handleDeleteTask}
                // Keep original handlers if you still need them
                onClick = {() => {
                  handleClick(item);
                }}
                onContextMenu = {(e) => {
                  e.preventDefault(); // Prevent browser context menu
                  navigate(`/admin/task-details/${item._id}`); // View details
                }}
                />
            ))}
          </div>
        </div>

        {/* Fixed Delete Confirmation Modal - Changed onclose to onClose */}
        <Modal 
          isOpen={openDeleteAlert} 
          onClose={handleCloseDeleteModal}  // Changed from onclose to onClose (camelCase)
          title="Delete Task"
        >
          <DeleteAlert 
            content={`Are you sure you want to delete "${taskToDelete?.title}"?`}
            onDelete={confirmDeleteTask}
          />
        </Modal>
    </DashboardLayout>
  )
}

export default ManageTasks