
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext.jsx'
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance.js'
import { API_Paths } from '../../utils/apiPaths.js'
import moment from 'moment';
import { addThousandSeparator } from '../../utils/helper.js'
import InfoCard from '../../components/Cards/InfoCard.jsx'
import { LuArrowRight } from 'react-icons/lu'
import TaskListTable from '../../components/TaskListTable.jsx'
import CustomPieChart from '../../components/Charts/CustomPieChart.jsx'
import CustomBarChart from '../../components/Charts/CustomBarChart.jsx'

const COLORS = ["#6D11AF", "#00B8DB", "#7BCE00"];

const UserDashboard = () => {
  useUserAuth();

  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  //Prepare chart Data
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const taskPriorityLevelsData = [
      { priority: "Critical", count: taskPriorityLevels?.Critical || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
    ];

    setBarChartData(taskPriorityLevelsData);
  }

  const getDashboardData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_Paths.TASKS.GET_USER_DASHBOARD_DATA);
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.log("Error fetching dashboard data", error);
    }
  }, [])

  const onSeeMore = () => {
    navigate('/admin/tasks');
  }

  useEffect(() => {
    // Only fetch dashboard data when user is authenticated and not loading
    if (!loading && user) {
      getDashboardData();
    }
  }, [user, loading, getDashboardData])

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <DashboardLayout activeMenu={"Dashboard"}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      {/* Header Section - Full Width */}
      <div className='w-full'>
        <div className='card my-3 md:my-5'>
          <div className='w-full'>
            <div>
              <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold'>
                Good Morning! {user?.name}
              </h2>
              <p className='text-xs md:text-sm text-gray-400 mt-1.5'>
                {moment().format("dddd Do MMM YYYY")}
              </p>
            </div>
          </div>

          {/* Stats Cards - Full Width Grid */}
          <div className='w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mt-4 md:mt-5'>
            <InfoCard
              label="Total Tasks"
              value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
              color="bg-primary"
            />

            <InfoCard
              label="Pending Tasks"
              value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
              color="bg-purple-800"
            />

            <InfoCard
              label="In Progress Tasks"
              value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
              color="bg-cyan-500"
            />

            <InfoCard
              label="Completed Tasks"
              value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
              color="bg-lime-500"
            />
          </div>
        </div>
      </div>

      <div>
        <div className='card'>
          <div className='flex items-center justify-between'>
            <h5 className='font-medium'>Task Distribution</h5>
          </div>

          <CustomPieChart 
            data={pieChartData} 
            colors= {COLORS}
          />
        </div>
      </div>

      <div>
        <div className='card'>
          <div className='flex items-center justify-between'>
            <h5 className='font-medium'>Task Priority Levels</h5>
          </div>

          <CustomBarChart 
            data={barChartData} 
          />
        </div>
      </div>

      {/* Recent Tasks Table - Full Width */}
      <div className='w-full my-3 md:my-6'>
        <div className='card'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4'>
            <h5 className='text-lg md:text-xl font-semibold'>Recent Tasks</h5>
            <button 
              className='card-btn flex items-center gap-2 text-sm md:text-base' 
              onClick={onSeeMore}
            >
              See All
              <LuArrowRight className='text-base' />
            </button>
          </div>

          {/* Table Container with Full Width */}
          <div className='w-full overflow-x-auto'>
            <TaskListTable tableData={dashboardData?.recentTasks || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default UserDashboard
