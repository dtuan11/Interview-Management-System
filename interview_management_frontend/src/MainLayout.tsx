import React from 'react';
import Sidebar from "./component/Sidebar4";
import Header from "./component/Header";
import { Outlet } from "react-router-dom";

interface MainLayoutProps {
  collapsed: boolean;
  handleChangeSidebar: () => void;
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ collapsed, handleChangeSidebar, activeItem, setActiveItem }) => {
  return (
    <>
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={handleChangeSidebar}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      <div className={`main-contents ${collapsed ? "collapsed" : ""}`}>
        <Header activeItem={activeItem} />
        <div className='content'>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
