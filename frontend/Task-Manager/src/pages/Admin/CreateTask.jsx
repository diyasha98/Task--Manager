import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { PRIORITY_DATA, PROJECT_DATA, DOMAIN_DATA } from '../../utils/data'
import axiosInstance from '../../utils/axiosInstance'
import { API_Paths } from '../../utils/apiPaths'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { LuTrash2 } from 'react-icons/lu'
import SelectDropdown from '../../components/Inputs/SelectDropdown'
import SelectUsers from '../../components/Inputs/SelectUsers'
import TodoListInput from '../../components/Inputs/TodoListInput'
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput'
import DeleteAlert from '../../components/layouts/DeleteAlert'
import Modal from '../../components/Modal'

const CreateTask = () => {

  const location = useLocation();
  const {taskId} = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    projectName: "",
    priority: "Low",
    domain: "",
    dueDate: "", // Changed from null to empty string
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  // New state for custom project name
  const [customProjectName, setCustomProjectName] = useState("");
  const [showCustomProjectInput, setShowCustomProjectInput] = useState(false);

  const [currentTask, setCurrentTask] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({...prevData, [key]: value}))
  };

  // Handle project name change with custom project logic
  const handleProjectNameChange = (value) => {
    if (value === "Other") {
      setShowCustomProjectInput(true);
      setCustomProjectName("");
      // Don't set projectName yet, wait for custom input
      handleValueChange("projectName", "");
    } else {
      setShowCustomProjectInput(false);
      setCustomProjectName("");
      handleValueChange("projectName", value);
    }
  };

  // Handle custom project name input
  const handleCustomProjectNameChange = (value) => {
    setCustomProjectName(value);
    // Update the actual projectName in taskData
    handleValueChange("projectName", value);
  };

  const clearData = () => {
    //reset form
    setTaskData({
      title: "",
      description: "",
      projectName: "",
      priority: "Low",
      domain: "",
      dueDate: "", 
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    })
    // Clear custom project states
    setCustomProjectName("");
    setShowCustomProjectInput(false);
  }

// Create Task
const createTask = async () => {
  setError("");
  setLoading(true);

  try {
    // Process todoChecklist to handle both old string format and new object format
    const todolist = taskData.todoChecklist?.map((item) => {
      // Handle backward compatibility - if item is string, convert to object
      if (typeof item === 'string') {
        return {
          title: item,
          assignedTo: null,
          completed: false,
        };
      }
      // Handle new object format
      return {
        title: item.title,
        assignedTo: item.assignedTo || null,
        completed: false,
      };
    });

    const response = await axiosInstance.post(API_Paths.TASKS.CREATE_TASK, {
      ...taskData, 
      dueDate: new Date(taskData.dueDate).toISOString(),
      todoChecklist: todolist,
    });

    if (response.data) {
      toast.success("Task created successfully");
      clearData();
      navigate("/admin/tasks");
    }
  } catch (error) {
    setError(error.response?.data?.message || "Error creating task");
    toast.error(error.response?.data?.message || "Error creating task");
  } finally {
    setLoading(false);
  }
};

// Update Task
const updateTask = async () => {
  setError("");
  setLoading(true);

  try {
    // Process todoChecklist to handle both old string format and new object format
    const processedTodoChecklist = taskData.todoChecklist?.map((item) => {
      const prevToDoChecklist = currentTask?.todoChecklist || [];
      const matchedTask = prevToDoChecklist.find((task) => task.title == item);
      // Handle backward compatibility - if item is string, convert to object
      if (typeof item === 'string') {
        return {
          title: item,
          assignedTo: null,
          completed: matchedTask ? matchedTask.completed : false,
        };
      };
      // Handle new object format
      return {
        title: item.title,
        assignedTo: item.assignedTo || null,
        completed: matchedTask ? matchedTask.completed : false,
      };
    });

    const processedTaskData = {
      ...taskData,
      dueDate: new Date(taskData.dueDate).toISOString(),
      todoChecklist: processedTodoChecklist
    };

    const response = await axiosInstance.put(API_Paths.TASKS.UPDATE_TASK(taskId), processedTaskData);
    if (response.data) {
      toast.success("Task updated successfully");
      clearData();
      navigate("/admin/tasks");
    }
  } catch (error) {
    setError(error.response?.data?.message || "Error updating task");
    toast.error(error.response?.data?.message || "Error updating task");
    setLoading(false);
  } finally {
    setLoading(false);
  }
};

// Get Task info by ID
const getTaskDetailsByID = async () => {
  if (!taskId) return;
  
  try {
    setLoading(true);
    const response = await axiosInstance.get(API_Paths.TASKS.GET_TASK_BY_ID(taskId));
    if (response.data) {
      const taskInfo = response.data;

      setCurrentTask(taskInfo)

      // Convert todoChecklist to the expected format for frontend
      const processedTodoChecklist = taskInfo.todoChecklist?.map((item, index) => ({
        id: item._id || `todo-${index}`,
        title: item.title,
        assignedTo: item.assignedTo || null,
        completed: item.completed || false
      })) || [];

      setTaskData((prevState) => ({
        title: taskInfo.title || "",
        description: taskInfo.description || "",
        projectName: taskInfo.projectName || "",
        priority: taskInfo.priority || "Low",
        domain: taskInfo.domain || "",
        dueDate: taskInfo.dueDate ? moment(taskInfo.dueDate).format('YYYY-MM-DD') : "", // Changed from null to empty string
        assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
        todoChecklist: processedTodoChecklist,
        attachments: taskInfo?.attachments || [],
      }));
      
    }
  } catch (error) {
    console.error("Error fetching task details:", error);
    toast.error("Error fetching task details");
  } finally {
    setLoading(false);
  }
};

// Add this useEffect to load task data when component mounts and taskId exists
React.useEffect(() => {
  if (taskId) {
    getTaskDetailsByID(taskId);
  }

  return () => {};
}, [taskId]);

// Handle submition of the task details
  const handleSubmit = async () => {
    setError(null);
    // Input validation
    if (!taskData.title.trim()) {
      setError("Title is required.");
      return;
    }
    if(!taskData.description.trim()) {
      setError("Description is required.");
      return;
    }
    if(!taskData.projectName.trim()) {
      setError("Project Name is required.");
      return;
    }
    if(!taskData.dueDate) {
      setError("Due Date is required.");
      return;
    }
    if(taskData.assignedTo?.length === 0) {
      setError("Task not assigned to any member.");
      return;
    }
    if(taskData.todoChecklist?.length === 0) {
      setError("Add atleast one todo task")
      return;
    }

    if(taskId) {
      updateTask();
      return;
    }

    createTask();

  };

  // Delete Task
  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_Paths.TASKS.DELETE_TASK(taskId));

      setOpenDeleteAlert(false);
      toast.success("Task Details deleted succsessfully")
      navigate('/admin/tasks');
    } catch (error) {
      toast.error(`Error deleting task details ${error.response?.data?.message || error.message}`);
      console.error(`Error deleting task details ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <DashboardLayout activeMenu= "Create Task">
      <div className='mt-5'>
        <div className='grid grid-cols-1 md:grid-cols-4 mt-4'>
          <div className='form-card col-span-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl md:text-xl font-medium'>
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              { taskId && (
                <button 
                  className='flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer' 
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className='text-base'/> Delete Task
                </button>
              )}
            </div>

            <div className='mt-4'>
              <label className='text-xs font-medium text-slate-600'>
                Task Title
              </label>

              <input 
                placeholder='Create App UI'
                className='form-input'
                type="text" 
                value={taskData.title}
                onChange={(e) => handleValueChange("title", e.target.value)}
              />
            </div>

            <div className='mt-3'>
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea 
                className="form-input" 
                placeholder="Describe Task"
                rows={4}
                value={taskData.description}
                onChange={(e) => handleValueChange("description", e.target.value)}
              ></textarea>
            </div>

            <div className='grid grid-cols-12 gap-4 mt-2'>
              <div className='col-span-6 md:col-span-4'>
                <label className="text-xs font-medium text-slate-600">
                  Project Name
                </label>

                <SelectDropdown
                    options={PROJECT_DATA}
                    value={taskData.projectName}
                    onChange={(value) => handleProjectNameChange(value)}
                    placeholder= "Select Project Name"
                  />

                {/* Custom Project Name Input */}
                {showCustomProjectInput && (
                  <div className='mt-2'>
                    <input 
                      placeholder='Enter custom project name'
                      className='form-input'
                      type="text" 
                      value={customProjectName}
                      onChange={(e) => handleCustomProjectNameChange(e.target.value)}
                    />
                  </div>
                )}
              </div>

                <div className='col-span-6 md:col-span-4'>
                  <label className="text-xs font-medium text-slate-600">
                    Priority
                  </label>

                  <SelectDropdown
                    options={PRIORITY_DATA}
                    value={taskData.priority}
                    onChange={(value) => handleValueChange("priority", value)}
                    placeholder= "Select Priority"
                  />
                </div>

                <div className='col-span-6 md:col-span-4'>
                  <label className="text-xs font-medium text-slate-600">
                    DueDate
                  </label>

                  <input 
                  placeholder='Select Due Date'
                  className='form-input' 
                  value={taskData.dueDate}
                  onChange={(e) => handleValueChange("dueDate", e.target.value)}
                  type="date"
                  />
                </div>

                <div className='col-span-6 md:col-span-4'>
                  <label className="text-xs font-medium text-slate-600">
                    Domain
                  </label>

                  <SelectDropdown
                    options={DOMAIN_DATA}
                    value={taskData.domain}
                    onChange={(value) => handleValueChange("domain", value)}
                    placeholder= "Select Domain"
                  />
                </div>

                <div className='col-span-12 md:col-span-3'>
                  <label className="text-xs font-medium text-slate-600">
                    Assigned To
                  </label>

                  <SelectUsers
                    selectedUsers={taskData.assignedTo}
                    setSelectedUsers={(value) => {
                      handleValueChange("assignedTo", value);
                    }}
                  />
                </div>
              </div>

              <div className='mt-3'>
                <label className="text-xs font-medium text-slate-600">
                  TODO Checklist
                </label>

                <TodoListInput
                  todoList={taskData?.todoChecklist}
                  setTodoList={(value) => handleValueChange("todoChecklist", value)}
                  assignedMembers={taskData?.assignedTo || []}
                />
              </div>

              <div className='mt-3'>
                <label className="text-xs font-medium text-slate-600">
                  Add Attachments
                </label>

                <AddAttachmentsInput
                  attachments={taskData?.attachments}
                  setAttachments={(value) => handleValueChange("attachments", value)}
                />
              </div>

              {error && (
                <p className='text-xs font-medium text-red-500 mt-5'>{error}</p>
              )}

              <div className='flex justify-end mt-7'>
                <button
                  className='add-btn'
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {taskId ? "UPDATE TASK" : "CREATE TASK"}
                </button>
              </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen= {openDeleteAlert} 
        onclose= {() => setOpenDeleteAlert(false)}
        title= "Delete Task"
        >
          <DeleteAlert 
            content= "Are you sure you want to delete this task?"
            onDelete={() => deleteTask()}
          />
        </Modal>
    </DashboardLayout>
  )
}

export default CreateTask