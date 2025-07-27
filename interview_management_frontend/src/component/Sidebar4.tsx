import React, { memo, useEffect } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Button } from 'primereact/button';
import { useLocation, useNavigate } from 'react-router-dom';
import "../AppStyle.css";
import { jwtDecode } from 'jwt-decode';
import { JwtPayLoad } from './Header';

interface SidebarProps {
    collapsed: boolean;
    toggleSidebar: () => void;
    activeItem: string;
    setActiveItem: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar, activeItem, setActiveItem }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = React.useState<any>();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decodedToken = jwtDecode(token) as JwtPayLoad;
            setRole(decodedToken.role[0]);
        } catch (error) {
            console.error('Invalid token', error);
            navigate("/login");
        }
    }, [navigate]);

    // Define menu items with role-based visibility
    const getMenuItems = () => {
        const items = [
            {
                label: 'Homepage',
                icon: 'pi pi-fw pi-home',
                command: () => {
                    setActiveItem('Homepage');
                    navigate('/homepage');
                },
                className: activeItem === 'Homepage' ? 'active' : '',
                roles: ['ADMIN', 'INTERVIERER', 'MANAGER', 'RECRUITER']  // Accessible to all roles
            },
            {
                label: 'Candidate',
                icon: 'pi pi-fw pi-users',
                command: () => {
                    setActiveItem('Candidate List');
                    navigate('/candidate-list');
                },
                className: ['Candidate List', 'Candidate Information', 'Edit Candidate', 'Create New Candidate'].includes(activeItem) ? 'active' : '',
                roles: ['ADMIN', 'INTERVIEWER', 'MANAGER', 'RECRUITER']   // Accessible to all roles except admin
            },
            {
                label: 'Job',
                icon: 'pi pi-fw pi-briefcase',
                command: () => {
                    setActiveItem('Job List');
                    navigate('/job-list');
                },
                className: ['Job List', 'Job Details', 'Edit Job', 'Create New Job'].includes(activeItem) ? 'active' : '',
                roles: ['ADMIN', 'INTERVIEWER', 'MANAGER', 'RECRUITER']    // Accessible to all roles except admin
            },
            {
                label: 'Interview',
                icon: 'pi pi-fw pi-comments',
                command: () => {
                    setActiveItem('Interview Schedule List');
                    navigate('/interview-list');
                },
                className: ['Interview Schedule List', 'Interview Schedule Details', 'Edit Interview Schedule', 'Create Interview Schedule', 'Submit Interview Result'].includes(activeItem) ? 'active' : '',
                roles: ['ADMIN', 'INTERVIEWER','RECRUITER', 'MANAGER']  // Accessible only to admin and interview
            },
            {
                label: 'Offer',
                icon: 'pi pi-fw pi-file-check',
                command: () => {
                    setActiveItem('Offer List');
                    navigate('/offer-list');
                },
                className: ['Offer List', 'Offer Details', 'Edit Offer', 'Create New Offer'].includes(activeItem) ? 'active' : '',
                roles: ['ADMIN', 'MANAGER', 'RECRUITER']   
            },
            {
                label: 'User',
                icon: 'pi pi-fw pi-user',
                command: () => {
                    setActiveItem('User List');
                    navigate('/user-list');
                },
                className: ['User List', 'User Details', 'Edit User', 'Create New User'].includes(activeItem) ? 'active' : '',
                roles: ['ADMIN']  
            },
        ];

        // Filter items based on the user's role
        return items.filter(item => item.roles.includes(role));
    };

    useEffect(() => {
        const path = location.pathname;
        console.log("Current path:", path);
        console.log("collapsed: ", collapsed);

        if (path.includes('/homepage')) setActiveItem('Homepage');
        else if (path.includes('/candidate-list')) setActiveItem('Candidate List');
        else if (path.includes('/create-new-candidate')) setActiveItem('Create New Candidate');
        else if (path.includes('/edit-candidate')) setActiveItem('Edit Candidate');
        else if (path.includes('/candidate-information')) setActiveItem('Candidate Information');
        else if (path.includes('/job-list')) setActiveItem('Job List');
        else if (path.includes('/create-job')) setActiveItem('Create New Job');
        else if (path.includes('/job-details')) setActiveItem('Job Details');
        else if (path.includes('/edit-job')) setActiveItem('Edit Job');
        else if (path.includes('/interview-list')) setActiveItem('Interview Schedule List');
        else if (path.includes('/create-interview')) setActiveItem('Create Interview Schedule');
        else if (path.includes('/interview-edit')) setActiveItem('Edit Interview Schedule');
        else if (path.includes('/interview-detail')) setActiveItem('Interview Schedule Details');
        else if (path.includes('/interview-submit-result')) setActiveItem('Submit Interview Result');
        else if (path.includes('/offer-list')) setActiveItem('Offer List');
        else if (path.includes('/offer-detail')) setActiveItem('Offer Details');
        else if (path.includes('/create-new-offer')) setActiveItem('Create New Offer');
        else if (path.includes('/edit-offer')) setActiveItem('Edit Offer');
        else if (path.includes('/user-list/user/')) setActiveItem('User Details');
        else if (path.includes('/user-list/update-user/')) setActiveItem('Edit User');
        else if (path.includes('/user-list')) setActiveItem('User List');
        else if (path.includes('/create-user')) setActiveItem('Create New User');
        else if (path.includes('/404-not-found')) setActiveItem('Error 404');

    }, [location.pathname, setActiveItem, collapsed]);

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className='logo-container'>
                    <img src={require('../logo-image.png')} alt="Logo" className={`logo me-2 ${collapsed ? 'collapsed' : ''}`} />
                    <span className='logo-text'>IMS</span>
                </div>
                <div className='btn-collapsed-div'>
                    <Button className="btn-collapsed" icon="pi pi-bars" text onClick={toggleSidebar} type='button'/>
                </div>
            </div>
            <div className='sidebar-menu'>
                <PanelMenu model={getMenuItems()}  className="p-menu-sidebar" />
            </div>
        </div>
    );
};

export default  memo(Sidebar);;
