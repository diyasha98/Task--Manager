import React from 'react'
import UI_IMG from "../../assets/images/auth.png";

const AuthLayout = ({children}) => {
  return (
    <div className="min-h-screen flex">
      <div className="w-full h-screen md:w-[60vw] px-12 pt-8 pb-12 overflow-y-auto">
        <h2 className='text-4xl font-medium text-black'>BPM Dashboard</h2>
        {children}
      </div>

      <div className='hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-100 bg-[url("/bg-img.png")] bg-cover bg-no-repeat bg-center overflow-hidden p-8'> 
        <img src={UI_IMG} alt="bpm logo" className='w-64 lg:w-[90%]' />
      </div>
    </div>
  )
}

export default AuthLayout