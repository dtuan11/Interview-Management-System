import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import UserService from "../../../services/user";
import Swal from 'sweetalert2';
import { Button } from "primereact/button";
import { isEqual } from "lodash";
import { Helmet } from "react-helmet";
import LoadingOverlay from "../../../utils/LoadingOverlay";

export const EditUser = () => {
    const { userId } = useParams<{ userId: string }>();
    const [userData, setUserData] = useState({
        fullName: "",
        email: "",
        dob: "",
        address: "",
        phoneNumber: "",
        gender: "",
        roles: [] as string[],
        department: "",
        isActive: "true",
        note: "",
    });

    const [originalUserData, setOriginalUserData] = useState({
        fullName: "",
        email: "",
        dob: "",
        address: "",
        phoneNumber: "",
        gender: "",
        roles: [] as string[],
        department: "",
        isActive: "true",
        note: "",
    });
    const [errorFullName, setErrorFullName] = useState<string>("");
    const [errorPhone, setErrorPhone] = useState<string>("");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const navigate = useNavigate();
    const id = parseInt(userId || '0');
    const location = useLocation();
    const [loading, setLoading] = useState<boolean>(true);

   

    useEffect(() => {
        const currentUser = UserService.getCurrentUserFromToken();

        if (!currentUser) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unauthorized access.',
            });
            navigate("/login");
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            try {
                const data = await UserService.getUserByUserID(id);

                const isCurrentAdmin = currentUser.roles.includes('ADMIN');
                const isTargetAdmin = data.roles.includes('ADMIN');

                if (isCurrentAdmin && isTargetAdmin && currentUser.userId !== id) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'You do not have permission to edit this user.',
                    });
                    navigate("/user-list");
                    return;
                }

                setUserData({
                    fullName: data.fullName,
                    email: data.email,
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender ? "true" : "false",
                    roles: data.roles,
                    department: data.department,
                    isActive: data.isActive ? "true" : "false",
                    note: data.note,
                });
                setOriginalUserData({
                    fullName: data.fullName,
                    email: data.email,
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender ? "true" : "false",
                    roles: data.roles,
                    department: data.department,
                    isActive: data.isActive ? "true" : "false",
                    note: data.note,
                });
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id, navigate]);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/user-update');
    
        socket.onopen = () => {
            console.log('WebSocket connection established');
            socket.send(JSON.stringify({ type: 'edit-start', userId: id }));
        };
    
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Received WebSocket message:', message);
    
                if (message.type === 'edit-notify' && message.userId === id) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Warning',
                        text: `User ${id} is being edited by another user.`,
                    });
                } else if (message.type === 'user-updated' && message.userId === id) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Info',
                        text: `User ${id} has been updated by another user. The page will be reloaded.`,
                    }).then(() => {
                        window.location.reload();
                    });
                } else if (message.type === 'version-updated' && message.userId === id) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Version Updated',
                        text: `User ${id} version has been updated. The page will be reloaded.`,
                    }).then(() => {
                        window.location.reload();
                    });
                }
            } catch (error) {
                if (event.data === 'ping') {
                    console.log('Received ping message');
                } else {
                    console.error('WebSocket message parsing error:', error);
                }
            }
        };
    
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    
        socket.onclose = (event) => {
            console.warn('WebSocket closed:', event);
            if (event.code !== 1000) {
                if (event.code === 1006) {
                    // Swal.fire({
                    //     icon: 'error',
                    //     title: 'WebSocket Closed',
                    //     text: `WebSocket closed abnormally with code 1006. Possible network issue or server crash.`,
                    // });
                } else {
                    // Swal.fire({
                    //     icon: 'error',
                    //     title: 'WebSocket Closed',
                    //     text: `WebSocket closed abnormally: ${event.code}`,
                    // });
                }
            }
        };
    
        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'edit-end', userId: id }));
            }
            socket.close();
        };
    }, [id]);
    

    const validateFullName = (fullName: string) => {
        const regex = /[0-9!@#$%^&*()_+=\[\]{};:'",.<>?/\\|`~\-]/;
        return !regex.test(fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    };

    const validatePhoneNumber = (phoneNumber: string) => {
        const regex = /^[0-9]*$/;
        return regex.test(phoneNumber);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        if (name === 'roles') {
            setUserData(prevUserData => ({
                ...prevUserData,
                roles: value.split(',')
            }));
        } else {
            setUserData(prevUserData => ({
                ...prevUserData,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEqual(userData, originalUserData)) {
            Swal.fire({
                icon: 'info',
                title: 'No Changes',
                text: 'No changes detected. Please modify the data before submitting.',
            });
            return;
        }

        if (!validateFullName(userData.fullName)) {
            setErrorFullName("Full name must contain only letters.");
            return;
        }
        if (!validatePhoneNumber(userData.phoneNumber)) {
            setErrorPhone("Phone number must contain only numbers.");
            return;
        }

        // console.log("User Data Before Update:", userData);

        try {
            await UserService.UpdateUserByUserId(id, {
                ...userData,
                isActive: userData.isActive === "true",
            });

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'user-updated', userId: id }));
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'User updated successfully.',
            }).then(() => {
                navigate("/user-list");
            });
        } catch (error: any) {
            console.error('Error creating user:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
            });
        }
    };

    const handleCancel = () => {
        // const fromPath = location.state && (location.state as { from: string }).from ? (location.state as { from: string }).from : '/';
        // navigate(fromPath);
        navigate(-1);
    };

    if (loading) return <LoadingOverlay isLoading={true} />;

    return (
        <div className="create-user-form">
            <Helmet>
                <title>Edit User</title>
            </Helmet>
            <div className='backto-div'>
                <Button label=" Back to user list" text icon="pi pi-angle-double-left" className='backto' onClick={() => navigate('/user-list')} />
            </div>
            <div className="form-containter">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Full Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="fullName"
                            value={userData.fullName}
                            onChange={handleChange}
                            required
                        />
                        <div style={{ color: 'red' }}>{errorFullName}</div>
                    </div>
                    <div>
                        <label>D.O.B</label>
                        <input
                            type="date"
                            name="dob"
                            value={userData.dob}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={userData.phoneNumber}
                            onChange={handleChange}
                        />
                        <div style={{ color: 'red' }}>{errorPhone}</div>
                    </div>
                    <div>
                        <label>Email <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={userData.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Gender <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="gender"
                            value={userData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a gender</option>
                            <option value="true">Male</option>
                            <option value="false">Female</option>
                        </select>
                    </div>
                    <div>
                        <label>Department <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="department"
                            value={userData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a Department</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Communication">Communication</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Accounting">Accounting</option>
                        </select>
                    </div>
                    <div>
                        <label>Role <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="roles"
                            value={userData.roles.join(',')}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a role</option>
                            <option value="ADMIN">Admin</option>
                            <option value="RECRUITER">Recruiter</option>
                            <option value="INTERVIEWER">Interviewer</option>
                            <option value="MANAGER">Manager</option>
                        </select>
                    </div>
                    <div>
                        <strong>Status:</strong>
                        &nbsp;&nbsp;
                        <span>{userData.isActive === "true" ? "Active" : "Inactive"}</span>
                    </div>
                    <div>
                        <label>Note</label>
                        <input
                            type="text"
                            name="note"
                            value={userData.note}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='flex justify-content-center w-100'>
                        <Button label="Submit" severity='secondary' className='mr-2' type="submit" />
                        <Button severity='secondary' type="button" label='Cancel' onClick={handleCancel} />
                    </div>
                </form>
            </div>

        </div>
    );
};