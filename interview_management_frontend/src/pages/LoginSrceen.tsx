import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserService from '../services/user';
import { Ilogin } from '../model';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from 'react-helmet';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe') === 'true';
    const savedUsername = remembered ? localStorage.getItem('username') : '';
    const savePassword = remembered ? localStorage.getItem('password') : ''
    setUsername(savedUsername || '');
    setPassword(savePassword||"");
    setRememberMe(remembered);
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    const loginData: Ilogin = { username, password };
  
    try {
      const response = await UserService.login(loginData);
  
      if (response.response) {
        localStorage.setItem('token', response.response.token);
        localStorage.setItem('role', response.response.role);
  
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('password', password);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('username');
          localStorage.removeItem('password');
        }
        toast.success(response.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
  
        setTimeout(() => {
          navigate('/homepage');
          window.location.reload();
        }, 1000);
      } else {
        // Handle unsuccessful login
        toast.error(response.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
  
        // Handle specific backend error codes
        switch (errorData.code) {
          case 19:
            toast.error(errorData.message || 'User account is inactive.', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            break;
          case 400:
            toast.error(errorData.message || 'Invalid username/password.', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            break;
          default:
            toast.error(errorData.message || 'An unexpected error occurred. Please try again later.', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
        }
      } else {
        // Fallback for network or server errors
        toast.error("Can't connect to server, please try again later.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };
  
  

  return (
    <div
      className="auth-container"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#ccc", borderRadius: '10px' }} >
      <Helmet>
        <title>Login</title>
      </Helmet>
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "#FFF",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            DEV
          </div>
          <h2 style={{ marginLeft: "10px" }}>IMS Recruitment</h2>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label >Username</label>
          <input
            placeholder='Enter username ...'
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={30} // Giới hạn chiều dài tối đa của input
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              textOverflow: "ellipsis", // Hiển thị dấu ba chấm khi vượt quá giới hạn
              overflow: "hidden", // Ẩn phần vượt quá giới hạn
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password</label>
          <input
            placeholder='Enter password..'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={30} // Giới hạn chiều dài tối đa của input
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              textOverflow: "ellipsis", // Hiển thị dấu ba chấm khi vượt quá giới hạn
              overflow: "hidden", // Ẩn phần vượt quá giới hạn
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label style={{ marginLeft: "5px" }}>Remember me?</label>
          <Link
            to={'/forgot-password'}
            style={{
              marginLeft: "auto",
              textDecoration: "none",
              color: "blue",
            }}
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Login
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      <ToastContainer />
    </div>
  );
};

export default Login;
