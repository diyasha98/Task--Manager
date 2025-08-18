import React from 'react'

const AvatarGroup = ({avatars, maxVisible = 3}) => {
  return (
    <div className='flex items-center gap-2'>
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <img key={index} src={avatar} alt={`Avatar-${index}`} className='w-9 h-9 rounded-full border-2 border-white -ml-3 first:ml-0'/>
      ))}

      {avatars.length > maxVisible && (
        <div className='w-9 h-9 rounded-full bg-blue-50 text-sm font-medium flex items-center justify-center border-2 border-white -ml-3'>
          <span>+{avatars.length - maxVisible}</span>
        </div>
      )}
    </div>
  )
}

export default AvatarGroup
