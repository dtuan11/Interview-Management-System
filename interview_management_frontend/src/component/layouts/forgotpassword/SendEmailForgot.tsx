import React, { useState, ChangeEvent, FormEvent, FocusEvent } from 'react';
import './SendEmailForgot.css';
import UserService from '../../../services/user';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from 'react-helmet';

export const SendEmail: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await UserService.sendEmailForgot(email);
      toast.success('Email sent successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
  };

  const displayEmail = email.length > 30 && !isFocused ? `${email.substring(0, 30)}...` : email;

  return (
    <div
      className="auth-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
        height: '100vh',
      }}
    >
      <Helmet>
        <title>Forgot-Password</title>
      </Helmet>
      <form
        className='send-email-forgot'
        onSubmit={handleForgotPassword}
        style={{
          backgroundColor: '#FFF',
          padding: '20px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'black',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            DEV
          </div>
          <h2 style={{ marginLeft: '10px' }}>IMS Recruitment</h2>
        </div>
        <p style={{ marginBottom: '20px' }}>
          Please enter your email and we’ll send you a link to get back your account.
        </p>
        <div style={{ marginBottom: '10px' }}>
          <label className='label-send-email' htmlFor="email">Email:</label>
          <input
            className='input-send-email'
            id="email"
            name="email"
            type="email"
            value={isFocused ? email : displayEmail}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter your email"
            required
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
           maxLength={255}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="submit"
            className="btn send"
            style={{
              display: 'block',
              width: '48%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Send
          </button>
          <button
            type="button"
            className="btn cancel"
            style={{
              display: 'block',
              width: '48%',
              padding: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            <Link to={'/login'} style={{ textDecoration: 'none', color: 'white' }}>
              Cancel
            </Link>
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
