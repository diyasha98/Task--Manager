import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../components/layouts/AuthLayout.jsx'
import Input from '../../components/Inputs/Input.jsx'
import { validateEmail } from '../../utils/helper.js';
import { API_Paths } from '../../utils/apiPaths.js';
import axiosInstance from '../../utils/axiosInstance.js';
import { UserContext } from '../../context/userContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();

  // Handle login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if(!password) {
      setError('Please enter your password');
      return;
    }

    setError("");

    // Login API Call
    try {
      const response = await axiosInstance.post(API_Paths.AUTH.LOGIN, {
        email,
        password,
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
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Welcome Back</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Please Enter your credentials to log in
        </p>

        <form onSubmit={handleLogin}>
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

          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

          <button type='submit' className='btn-primary'>LOGIN</button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Don't have an account? {" "}
            <Link className='font-medium text-primary underline' to="/signup">
              SignUp
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login