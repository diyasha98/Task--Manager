import { API_Paths } from './apiPaths.js';
import axiosInstance from './axiosInstance.js';

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // Append image file to form data
    formData.append('image', imageFile);
   
    try {
        const response = await axiosInstance.post(API_Paths.IMAGE.UPLOAD_IMAGE, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data', // Swt header for File upload
            },
        });
        return response.data; // Return response data
    } catch (error) {
        console.error('Error uploading the image:', error);
        throw error; // Rethrow error to be handled by caller
    }
};

export default uploadImage;
