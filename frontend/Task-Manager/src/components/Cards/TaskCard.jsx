import React, { useState, useRef, useEffect } from 'react'
import Progress from '../Progress';
import AvatarGroup from '../AvatarGroup';
import { LuPaperclip, LuEllipsisVertical, LuPencil, LuEye, LuCopy, LuTrash2 } from 'react-icons/lu';
import moment from "moment";

// Custom hook for kebab menu
const useKebabMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    menuRef,
    toggle,
    close
  };
};

// Kebab Menu Component
const KebabMenu = ({ children, buttonClassName, menuClassName }) => {
  const { isOpen, menuRef, toggle } = useKebabMenu();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          toggle();
        }}
        className={`p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${buttonClassName}`}
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <LuEllipsisVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[150px] ${menuClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Kebab Menu Item Component
const KebabMenuItem = ({ onClick, icon: Icon, children, className, variant = 'default' }) => {
  const baseClasses = "flex items-center w-full px-3 py-2 text-sm transition-colors duration-150";
  const variantClasses = {
    default: "text-gray-700 hover:bg-gray-50",
    danger: "text-red-600 hover:bg-red-50"
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click
        onClick();
      }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const TaskCard = ({
  title, 
  description, 
  priority, 
  projectName, 
  domain, 
  status, 
  progress, 
  createdAt, 
  dueDate, 
  assignedTo, 
  attachmentCount, 
  completedTodoCount, 
  todoChecklist, 
  onClick, 
  onContextMenu,
  // New props for kebab menu actions
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  taskData // Pass the entire task object for the actions
}) => {

    const getStatusTagColor = () => {
        switch(status) {
            case "In Progress":
                return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
            case "Completed":
                return "text-lime-500 bg-lime-50 border border-lime-500/20";
            default:
                return "text-violet-500 bg-violet-50 border border-violet-500/10"
        }
    };

    const getPriorityTagColor = () => {
        switch(priority) {
            case "Low":
                return "text-emerald-500 bg-emerald-50 border border-emerald-500/10";
            case "Medium":
                return "text-amber-500 bg-amber-50 border border-amber-500/20";
            case "High":
                return "text-rose-500 bg-rose-50 border border-rose-500/20";
            default:
                return "text-red-500 bg-red-50 border border-red-500/10"
        }
    };

    // Helper function to format dates safely
    const formatDate = (dateValue) => {
      if (!dateValue) return "Not Set";
      
      // Check if the date is valid
      const momentDate = moment(dateValue);
      if (!momentDate.isValid()) return "Invalid Date";
      
      return momentDate.format("Do MMM YYYY");
    };

  return (
    <div 
      className='bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 cursor-pointer relative'
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Kebab Menu in top-right corner */}
      <div className="absolute top-3 right-3 z-10">
        <KebabMenu>
          <KebabMenuItem onClick={() => onEdit?.(taskData)} icon={LuPencil}>
            Edit Task
          </KebabMenuItem>
          
          <KebabMenuItem onClick={() => onView?.(taskData)} icon={LuEye}>
            View Task
          </KebabMenuItem>
          
          <KebabMenuItem onClick={() => onDuplicate?.(taskData)} icon={LuCopy}>
            Duplicate Task
          </KebabMenuItem>
          
          <hr className="my-1 border-gray-100" />
          
          <KebabMenuItem 
            onClick={() => onDelete?.(taskData)} 
            icon={LuTrash2}
            variant="danger"
          >
            Delete Task
          </KebabMenuItem>
        </KebabMenu>
      </div>

      <div className='flex items-end gap-3 px-4'>
        <div className={`text-[13px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded`}>
            {status}
        </div>

        <div className={`text-[13px] font-medium ${getPriorityTagColor()} px-4 py-0.5 rounded`}>
            {priority}
        </div>
      </div>

      <div className={`px-4 border-l-[3px] ${
        status === "In Progress"
        ? "border-cyan-500"
        : status === "Completed"
        ? "border-indigo-500"
        : "border-violet-500"
       }`}
       >
        <p className='text-sm font-medium text-gray-800 mt-4 line-clamp-2'>
            {title}
        </p>

        <p className='text-xs text-gray-600 mt-1.5 line-clamp-2 leading-[18px]'>
            {description}
        </p>

        <p className='text-[13px] text-gray-700/80 font-medium mt-2 mb-2 leading-[18px]'>
            Task Done: {" "}
            <span className='font-semibold text-gray-700'>
                {completedTodoCount}/ {todoChecklist?.length || 0}
            </span>
        </p>

        <Progress progress={progress} status={status} />
      </div>

      <div className='px-4 '>
        <div className='flex items-center justify-between my-1 gap-2'>
            <div >
                <label className="text-xs text-gray-500">Start Date</label>
                <p className='text-[13px] font-medium text-gray-900'>{formatDate(createdAt)}</p>
            </div>

            <div>
                <label className="text-xs text-gray-500">Due Date</label>
                <p className='text-[13px] font-medium text-gray-900'>{formatDate(dueDate)}</p>
            </div>
            <div>
                <label className="text-xs text-gray-500">Project Name</label>
                <p className='text-[13px] font-medium text-gray-900'>{projectName || "N/A"}</p>
            </div>
            <div>
                <label className="text-xs text-gray-500">Domain</label>
                <p className='text-[13px] font-medium text-gray-900'>{domain || "N/A"}</p>
            </div>
        </div>

        <div className='flex items-center justify-between mt-3'>
            <AvatarGroup avatars={assignedTo || []} />

            {attachmentCount > 0 && (
                <div className='flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg'>
                    <LuPaperclip className='text-primary' /> {" "}
                    <span className='text-xs text-gray-900'>{attachmentCount}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard