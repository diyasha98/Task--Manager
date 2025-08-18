import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layouts/AuthLayout.jsx'
import Input from '../../components/Inputs/Input.jsx'
import { validateEmail } from '../../utils/helper.js';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector.jsx';
import { UserContext } from '../../context/userContext.jsx';
import { API_Paths } from '../../utils/apiPaths.js';
import axiosInstance from '../../utils/axiosInstance.js';
import uploadImage from '../../utils/uploadImage.js';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminInviteToken, setAdminInviteToken] = useState('');

  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();


  // Handle SignUp Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = '';

    if(!fullName) {
      setError('Please enter your full name');
      return;
    }

    if(!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if(!password) {
      setError('Please enter your password');
      return;
    }

    setError("");

    // SignUp API Call
    try {
      // Upload image if present
      if (profilePic) {
        try {
          const imgUploadRes = await uploadImage(profilePic);
          profileImageUrl = imgUploadRes?.imageUrl || "";
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setError('Failed to upload profile image. Please try again.');
          return;
        }
      }
      const response = await axiosInstance.post(API_Paths.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken,
      });

      const {token, role} = response.data;
      if (token) {
        localStorage.setItem('token', token);
        updateUser(response.data);

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (error) {
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Join BPM DashBoard by entering your details below</p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              label='Full Name'
              placeholder='Enter your full name'
              type='text'
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label='Email Address'
              placeholder='abc@example.com'
              type='email'
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label='Password'
              placeholder='Min 8 Characters'
              type='password'
            />

            <Input
              value={adminInviteToken}
              onChange={(e) => setAdminInviteToken(e.target.value)}
              label='Admin Invite Token'
              placeholder='6 Digit Code'
              type='text'
            />
          </div>

          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

          <button type='submit' className='btn-primary'>SIGN UP</button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Already have an account? {" "}
            <Link className='font-medium text-primary underline' to="/login">
              LogIn
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp
