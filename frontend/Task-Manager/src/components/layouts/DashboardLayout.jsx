import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import SideMenu from './SideMenu';
import Navbar from './Navbar';

const DashboardLayout = ({ children, activeMenu }) => {
    const { user } = useContext(UserContext);
    
    return (
        <div className='min-h-screen w-full'>
            <Navbar activeMenu={activeMenu} />

            {user && (
                <div className='flex w-full'>
                    <div className='max-[1080px]:hidden'>
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                    <div className='flex-1 w-full max-[1080px]:w-full p-4 lg:p-6'>
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardLayout