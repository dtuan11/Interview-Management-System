import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import UserService from "../../../services/user";
import './UserDetail.css';
import { UserModel } from "../UserMode";
import { Button } from "primereact/button";
import Swal from 'sweetalert2';
import LoadingOverlay from "../../../utils/LoadingOverlay";
import { Helmet } from "react-helmet";
import { Skeleton } from "primereact/skeleton";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    userId: string;
    role: string[];
}

const ViewUserDetail: React.FC = () => {
    const [user, setUser] = useState<UserModel | null>(null);
    const [reload, setReload] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add state for admin check

    let id = 0;
    try {
        id = parseInt(userId || '', 10);
        if (isNaN(id)) id = 0;
    } catch (error) {
        console.log(error);
        id = 0;
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decodedToken = jwtDecode(token)as JwtPayload;
            setIsAdmin(decodedToken.role.includes('ADMIN')); // Check if the user is an admin
        } catch (error) {
            console.error('Invalid token', error);
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        setLoading(true);
        UserService.getUserByUserID(id)
            .then(data => {
                setUser(data);
                setReload(false);
            })
            .catch(error => {
                setError(error);
                setReload(false);
            })
            .finally(() => {
                setLoading(false);
            });

       
    }, [id]);

    const handleStatusToggle = () => {
        if (user) {
            Swal.fire({
                title: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`,
                text: `You are about to ${user.isActive ? 'deactivate' : 'activate'} the user account.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, change it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedUser = { ...user, isActive: !user.isActive };
                    UserService.updateisActivebyUserId(id)
                        .then(() => {
                            setUser(updatedUser);
                            Swal.fire(
                                'Updated!',
                                `The user has been ${updatedUser.isActive ? 'activated' : 'deactivated'}.`,
                                'success'
                            );
                            setReload(true);
                            UserService.getUserByUserID(id)
                                .then(data => {
                                    setUser(data);
                                    setReload(false);
                                })
                                .catch(error => {
                                    setError(error);
                                    setReload(false);
                                });
                        })
                        .catch(error => setError(error));
                }
            });
        }
    };

    if (reload) return <LoadingOverlay isLoading={true} />;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return <div>No user data found.</div>;

    return (
        <div className="user-detail-container" style={{ width: '100%' }}>
            <Helmet>
                <title>User Detail</title>
            </Helmet>
            <div className="flex justify-content-between align-items-center">
                <div className='backto-div'>
                    <Button label="Back to user list" text icon="pi pi-angle-double-left" className='backto' onClick={() => navigate('/user-list')} />
                </div>

                <div className="user-header my-2">
                    <Button
                        className={(user.isActive.toString()) === 'true' ? "deactivate-button mr-0" : "activate-button mr-0"}
                        onClick={handleStatusToggle}
                    >
                        {(user.isActive.toString()) === 'true' ? "Deactivate user" : "Activate user"}
                    </Button>
                </div>
            </div>

            <div className="user-details">
                <div className="flex justify-content-between">
                    <div className="left-column">
                        <p><strong>Full name:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.fullName}</span>}</p>
                        <p><strong>D.O.B:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{new Date(user.dob).toLocaleDateString()}</span>}</p>
                        <p><strong>Phone number:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.phoneNumber}</span>}</p>
                        <p><strong>Role:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.roles}</span>}</p>
                        <p><strong>Status:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{(user.isActive.toString()) === 'true' ? 'Active' : 'Inactive'}</span>}</p>
                    </div>
                    <div className="right-column">
                        <p><strong>Email:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.email}</span>}</p>
                        <p><strong>Address:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.address}</span>}</p>
                        <p><strong>Gender:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.gender ? 'Male' : 'Female'}</span>}</p>
                        <p><strong>Department:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.department}</span>}</p>
                        <p><strong>Note:</strong> {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" /> : <span>{user.note}</span>}</p>
                    </div>
                </div>

                <div className="action-buttons">
                    {/* Display "Edit" button only if the current user is an admin */}
                    {isAdmin && (
                        <Button className="user-detail-submit-button mr-2" severity="secondary">
                            <NavLink to={`/user-list/update-user/${user.id}`} style={{ textDecoration: 'none', color: 'white' }}>Edit</NavLink>
                        </Button>
                    )}
                    <Button className="user-detail-cancel-button" severity="secondary">
                        <Link to='/user-list' style={{ textDecoration: 'none', color: 'white' }}>Cancel</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ViewUserDetail;
