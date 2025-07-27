import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutModal from "./layouts/LogoutModal";
import swal from "sweetalert";
import UserService from "../services/user";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { Button } from 'primereact/button';
import "../AppStyle.css";

export interface JwtPayLoad {
    userId: number;
    role: string[];
    sub: string;
}
interface HeaderProps {
    activeItem: string;
}

const Header: React.FC<HeaderProps> = ({ activeItem }) => {
    const [showLogoutModal, setShowLogoutModal] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [role, setRole] = React.useState("");
    const [token, setToken] = React.useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token); // Store token in state

        if (!token) {
            navigate("/login");
            return;
        } else {
            try {
                const decodedToken = jwtDecode(token) as JwtPayLoad;
                setRole(decodedToken.role.join(', '));
                setUsername(decodedToken.sub);
            } catch (error) {
                console.error('Invalid token', error);
                navigate("/login");
            }
        }
    }, [navigate]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleCloseModal = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = async () => {
    try {
      await UserService.logoutApi();
      setShowLogoutModal(false);
      toast.success("Logout successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
            window.location.reload();
        } catch (error) {
            console.error('Logout failed: ', error);
            swal("Error", "Logout failed. Please try again.", "error");
        }
    };




    return (
        <div className="header">
            <div>
                <h2>{activeItem}</h2>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                {token && (
                    <>
                        {/* <FaUserCircle className="me-3" style={{ fontSize: '1.5rem' }} /> */}
                        <div className="account-logo me-2" >
                            <i className="pi pi-user"></i>
                        </div>
                        <div className="text-start me-3">
                            <div className="fw-bold">{username}</div>
                            <div className="text-muted small">{role}</div>
                        </div>
                        <Button icon="pi pi-sign-out" text onClick={handleLogoutClick} />
                        {/* <a href="#" className="link-dark text-decoration-none" >Logout</a> */}
                    </>
                )}
            </div>


            <LogoutModal
                show={showLogoutModal}
                handleClose={handleCloseModal}
                handleLogout={handleLogout}
            />

        </div>
    );
};

export default Header;