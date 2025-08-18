import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance'
import { API_Paths } from '../../utils/apiPaths'
import { LuFileSpreadsheet } from 'react-icons/lu'
import UserCard from '../../components/Cards/UserCard'
import Modal from '../../components/Modal'
import DeleteAlert from '../../components/layouts/DeleteAlert'
import toast from 'react-hot-toast'

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([])
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const navigate = useNavigate()

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_Paths.USERS.GET_ALL_USERS)
      if(response.data?.length > 0) {
        setAllUsers(response.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  // Get User By ID
  const getUserById = async (userId) => {
    try {
      const response = await axiosInstance.get(API_Paths.USERS.GET_USER_BY_ID(userId))
      return response.data
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error(`Error fetching user: ${error.response?.data?.message || error.message}`)
      return null
    }
  }

  // Delete User
  const deleteUser = async () => {
    try {
      await axiosInstance.delete(API_Paths.USERS.DELETE_USER(selectedUserId))
      
      // Remove deleted user from the state
      setAllUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUserId))
      
      setOpenDeleteAlert(false)
      setSelectedUserId(null)
      toast.success("User deleted successfully")
    } catch (error) {
      toast.error(`Error deleting user: ${error.response?.data?.message || error.message}`)
      console.error(`Error deleting user: ${error.response?.data?.message || error.message}`)
    }
  }

  // Handle delete user click
  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId)
    setOpenDeleteAlert(true)
  }

  // Download user report
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_Paths.REPORTS.EXPORT_USERS, {
        responseType: "blob",
      })

      // Create a url for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download","user_details.xlsx")
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading User details:", error)
      toast.error("Failed to download user details. Please try again.")
    }
  }

  useEffect(() => {
    getAllUsers()
    
    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className='mt-5 mb-10'>
        <div className='flex md:flex-row md:items-center justify-between'>
          <h2 className='text-xl md:text-xl font-medium'>Team Members</h2>
          
          <button className='flex md:flex download-btn' onClick={handleDownloadReport}>
            <LuFileSpreadsheet className='text-lg' />
            Download Report
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {allUsers.map((user) => (
            <UserCard 
              key={user._id} 
              userInfo={user} 
              onDelete={() => handleDeleteUser(user._id)}
            />
          ))}
        </div>
      </div>

      {/* Delete User Modal */}
      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete User"
      >
        <DeleteAlert
          content="Are you sure you want to delete this user? This action cannot be undone."
          onDelete={deleteUser}
          onCancel={() => setOpenDeleteAlert(false)}
        />
      </Modal>
    </DashboardLayout>
  )
}

export default ManageUsers