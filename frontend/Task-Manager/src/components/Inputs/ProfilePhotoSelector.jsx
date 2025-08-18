import React, { useRef, useState } from 'react'
import { LuUser, LuUpload, LuTrash} from "react-icons/lu"

const ProfilePhotoSelector = ({image, setImage}) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Update the image states
            setImage(file);

            // Create a preview URL for the selected image
            setPreviewUrl(URL.createObjectURL(file));
        }
      };

      const handleRemoveImage = () => {
        // Clear the image states
        setImage(null);
        setPreviewUrl(null);
      };

      const onChooseFile = () => {
        inputRef.current.click();
      };

  return (
    <div className='flex justify-center mb-6'>
        <input type="file" accept='image/*' ref={inputRef} onChange={handleImageChange} className='hidden' />

        { !image ? (
            <div className='flex items-center justify-center w-20 h-20 bg-blue-100/50 rounded-full relative cursor-pointer'>
                <LuUser className='text-4xl text-primary' />
                <button 
                    type='button' 
                    className='w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer' 
                    onClick={onChooseFile}
                >
                    <LuUpload />
                </button>
            </div>
        ) : (
            <div className='relative'>
                <img 
                    src={previewUrl} 
                    alt='profile photo' 
                    className='w-20 h-20 rounded-full object-cover' 
                />
                <button 
                    type='button' 
                    className='w-8 h-8 flex items-center justify-center text-white bg-red-500 rounded-full absolute -bottom-1 -right-1 cursor-pointer' 
                    onClick={handleRemoveImage}
                >
                    <LuTrash className='w-4 h-4' />
                </button>
            </div>
        )}
      
    </div>
  )
}

export default ProfilePhotoSelector
