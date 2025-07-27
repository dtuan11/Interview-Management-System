import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import UserService from "../../../services/user";
import './ResetPassword.css';
import { Helmet } from "react-helmet";
import { useDebounce } from "../../../utils/hooks";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [errorPassword, setErrorPassword] = useState<string>('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<string>('');
  const [linkValid, setLinkValid] = useState<boolean>(true);
  const { token, email } = useParams<{ token: any; email: any }>();
  const navigate = useNavigate();

  const debouncedPassword = useDebounce(password, 1000);
  const debouncedConfirmPassword = useDebounce(confirmPassword, 1000);

  useEffect(() => {
    const validateLink = async () => {
      try {
        const isValid = await UserService.checkValidResetPasswordLink(token, email);
        setLinkValid(isValid);
        if (!isValid) {
          toast.error('The password reset link is invalid or has expired.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        }
      } catch (error) {
        toast.error('Error validating password reset link', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    };

    validateLink();
  }, [token, email, navigate]);

  useEffect(() => {
    if (debouncedPassword) {
      checkPassword(debouncedPassword);
    }
  }, [debouncedPassword]);

  useEffect(() => {
    if (debouncedConfirmPassword) {
      if (password !== debouncedConfirmPassword) {
        setErrorConfirmPassword('Password and Confirm password don’t match. Please try again');
      } else {
        setErrorConfirmPassword('');
      }
    }
  }, [debouncedConfirmPassword, password]);

  const checkPassword = (passwordA: string) => {
    const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{7,}$/;
    if (!regexPassword.test(passwordA)) {
      setErrorPassword("Password must contain at least one letter, one number, and be at least seven characters long.");
      return true;
    }
    return false;
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrorPassword('');
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setErrorConfirmPassword('');
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Both password fields are required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
     
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password and Confirm password don’t match. Please try again', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      await UserService.resetPassword(email, password, token);
      toast.success('Password reset successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setTimeout(() => {
        setLinkValid(false);
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    setError('');
  };

  if (!linkValid) {
    toast.error('This link has expired. Please go back to Homepage and try again.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return null;
  }

  return (
    <div className="reset-password-container">
      <ToastContainer />
      <Helmet>
        <title>Reset-Password</title>
      </Helmet>
      <div className="reset-password-form">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: 'auto',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'black',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
          }}>
            DEV
          </div>
          <h2 style={{ marginLeft: '10px' }}>IMS Recruitment</h2>
        </div>
        <h2 style={{ marginLeft: '10px' }}>Reset Password</h2>
        <p>Please set your new password</p>
        <input className="input-reset-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePassword}
        />
        {errorPassword && <div style={{ color: 'red' }}>{errorPassword}</div>}
        <input className="input-reset-password"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPassword}
        />
        {errorConfirmPassword && <div style={{ color: 'red' }}>{errorConfirmPassword}</div>}
        <button className="button-reset-password" type="submit" onClick={handleResetPassword}>Reset</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};
