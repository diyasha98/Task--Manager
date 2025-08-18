import {
    LuLayoutDashboard,
    LuUsers,
    LuClipboardCheck,
    LuSquarePlus,
    LuLogOut,
    LuSquare,
} from  "react-icons/lu";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard"
    },
    {
        id: "02",
        label: "Manage Tasks",
        icon: LuClipboardCheck,
        path: "/admin/tasks"
    },
    {
        id: "03",
        label: "Create Task",
        icon: LuSquarePlus,
        path: "/admin/create-task"
    },
    {
        id: "04",
        label: "Team Members",
        icon: LuUsers,
        path: "/admin/users"
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "logout"
    }    
];

export const SIDE_MENU_USER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/user/dashboard"
    },
    {
        id: "02",
        label: "My Tasks",
        icon: LuClipboardCheck,
        path: "/user/tasks"
    },
    {
        id: "03",
        label: "Create Task",
        icon: LuSquarePlus,
        path: "/user/create-task"
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "logout"
    }
];

export const PRIORITY_DATA = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Critical", value: "Critical" }
]

export const STATUS_DATA = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In progress" },
    { label: "Completed", value: "Completed" }
]

export const PROJECT_DATA = [
  { label: "Dashboard", value: "Dashboard" },
  { label: "BPM-Internal", value: "BPM-Internal" },
  { label: "Hemali", value: "Hemali" },
  { label: "NutriByte", value: "NutriByte" },
  { label: "SKIDS", value: "SKIDS" },
  { label: "GreyBrain", value: "GreyBrain" },
  { label: "Santaan", value: "Santaan" },
  { label: "IIHMR", value: "IIHMR" },
  {label: "Other", value: "Other"}
];

export const DOMAIN_DATA = [
  { label: "IT & Technical", value: "IT & Technical" },
  { label: "Testing", value: "Testing" },
  { label: "Operations", value: "Operations" },
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "Management", value: "Management" }
];

