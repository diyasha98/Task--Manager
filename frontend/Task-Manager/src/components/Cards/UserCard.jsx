import React from 'react'
import { MdDelete } from 'react-icons/md'

const UserCard = ({userInfo, onDelete}) => {
  return (
    <div className='user-card p-4 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <img 
            src={userInfo?.profileImageUrl} 
            alt={`${userInfo?.name} Avatar`}
            className='w-12 h-12 rounded-full border-2 border-white object-cover' 
          />

          <div>
            <p className='text-sm font-medium text-gray-800'>{userInfo?.name}</p>
            <p className='text-xs text-gray-500'>{userInfo?.email}</p>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
              userInfo?.role === 'admin' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {userInfo?.role}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className='p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 hover:text-red-700'
          title="Delete User"
        >
          <MdDelete className='text-lg' />
        </button>
      </div>

      <div className='flex items-end gap-3'>
        <StatCard 
          label="Pending"
          count={userInfo?.pendingTasks || 0}
          status="Pending"
        />
        <StatCard 
          label="In Progress"
          count={userInfo?.inProgressTasks || 0}
          status="In Progress"
        />
        <StatCard 
          label="Completed"
          count={userInfo?.completedTasks || 0}
          status="Completed"
        />
      </div>
    </div>
  )
}

export default UserCard

const StatCard = ({label, count, status}) => {
  const getStatusTagColor = () => {
    switch(status) {
      case "In Progress":
        return "text-cyan-600 bg-cyan-50 border-cyan-200"
      case "Completed":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-orange-600 bg-orange-50 border-orange-200"
    }
  }
  
  return (
    <div className={`flex-1 text-center text-xs font-medium ${getStatusTagColor()} px-3 py-2 rounded-lg border`}>
      <div className='text-lg font-bold'>{count}</div>
      <div className='text-[10px] mt-1'>{label}</div>
    </div>
  )
}