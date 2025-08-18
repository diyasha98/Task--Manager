import React, { useState, useEffect } from 'react';
import { HiMiniPlus, HiOutlineTrash } from 'react-icons/hi2';
import { LuUser } from 'react-icons/lu';
import axiosInstance from '../../utils/axiosInstance';
import { API_Paths } from '../../utils/apiPaths';

const TodoListInput = ({ todoList, setTodoList, assignedMembers = [] }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [option, setOption] = useState("");

    // Get all users for assignment dropdown
    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(API_Paths.USERS.GET_ALL_USERS);
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.log("Error fetching all users", error);
        }
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    // Filter users to only show those assigned to the main task
    const availableUsers = allUsers.filter(user => 
        assignedMembers.includes(user._id)
    );

    // Function to handle adding an option 
    const handleAddOption = () => {
        if (option.trim()) {
            const newTodoItem = {
                id: Date.now(), // temporary ID for frontend
                title: option.trim(),
                assignedTo: null, // Optional assignment
                completed: false
            };
            setTodoList([...todoList, newTodoItem]);
            setOption("");
        }
    };

    // Function to handle removing an option
    const handleRemoveOption = (index) => {
        setTodoList(todoList.filter((_, i) => i !== index));
    };

    // Function to update todo assignment
    const updateTodoAssignment = (index, userId) => {
        const updatedList = todoList.map((todo, i) => 
            i === index ? { ...todo, assignedTo: userId === '' ? null : userId } : todo
        );
        setTodoList(updatedList);
    };

    // Get assigned user name
    const getAssignedUserName = (userId) => {
        if (!userId) return null;
        const user = allUsers.find(u => u._id === userId);
        return user ? user.name : 'Unknown User';
    };

    // Handle backward compatibility - convert string items to objects
    const normalizedTodoList = todoList.map((item, index) => {
        if (typeof item === 'string') {
            return {
                id: `legacy-${index}`,
                title: item,
                assignedTo: null,
                completed: false
            };
        }
        return item;
    });

    // Handle key press for adding todo
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    return (
        <div>
            {normalizedTodoList.map((item, index) => (
                <div
                    key={item.id || item.title || index}
                    className='bg-gray-50 border border-gray-100 px-3 py-3 rounded-md mb-3 mt-2'
                >
                    {/* Todo item with number and title */}
                    <div className='flex justify-between items-start'>
                        <p className='text-xs text-black flex-1'>
                            <span className='text-xs text-gray-400 font-semibold mr-2'> 
                                {index < 9 ? `0${index + 1}` : index + 1}
                            </span>
                            {item.title}
                        </p>

                        <button
                            className='cursor-pointer ml-2'
                            onClick={() => handleRemoveOption(index)}
                        >
                            <HiOutlineTrash className='text-lg text-red-500'/>
                        </button>
                    </div>

                    {/* Assignment section */}
                    {availableUsers.length > 0 && (
                        <div className='flex items-center gap-2 mt-3 pl-6'>
                            <LuUser className='text-xs text-gray-500' />
                            <select
                                value={item.assignedTo || ''}
                                onChange={(e) => updateTodoAssignment(index, e.target.value)}
                                className='text-xs border border-gray-300 rounded px-2 py-1 bg-white min-w-[140px] focus:outline-none focus:border-blue-400'
                            >
                                <option value="">Unassigned</option>
                                {availableUsers.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Show assignment status */}
                            {item.assignedTo && (
                                <span className='text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded'>
                                    Assigned to {getAssignedUserName(item.assignedTo)}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Show message when no members are assigned to main task */}
                    {availableUsers.length === 0 && assignedMembers.length === 0 && (
                        <div className='text-xs text-gray-400 mt-2 pl-6 italic'>
                            💡 Assign members to the main task to enable todo assignments
                        </div>
                    )}
                </div>
            ))}

            {/* Add new todo input */}
            <div className='flex items-center gap-5 mt-4'>
                <input
                    type='text'
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='Enter Task'
                    className='w-full text-[13px] text-black outline-none bg-white border border-gray-100 px-3 py-2 rounded-md focus:border-blue-400'
                />
                <button
                    className='card-btn text-nowrap'
                    onClick={handleAddOption}
                    disabled={!option.trim()}
                >
                    <HiMiniPlus className='text-lg'/> Add
                </button>
            </div>
        </div>
    )
}

export default TodoListInput