import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Family from './pages/Family';
import FamilyChat from './pages/FamilyChat';
import Features from './pages/Features';
import FoodInventory from './pages/FoodInventory';
import Gamification from './pages/Gamification';
import Home from './pages/Home';
import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import Medications from './pages/Medications';
import Notifications from './pages/Notifications';
import Pets from './pages/Pets';
import Plants from './pages/Plants';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import ShoppingList from './pages/ShoppingList';
import Suppliers from './pages/Suppliers';
import Tasks from './pages/Tasks';
import Visits from './pages/Visits';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "Calendar": Calendar,
    "Dashboard": Dashboard,
    "Expenses": Expenses,
    "Family": Family,
    "FamilyChat": FamilyChat,
    "Features": Features,
    "FoodInventory": FoodInventory,
    "Gamification": Gamification,
    "Home": Home,
    "Login": Login,
    "Maintenance": Maintenance,
    "Medications": Medications,
    "Notifications": Notifications,
    "Pets": Pets,
    "Plants": Plants,
    "Schedule": Schedule,
    "Settings": Settings,
    "ShoppingList": ShoppingList,
    "Suppliers": Suppliers,
    "Tasks": Tasks,
    "Visits": Visits,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};