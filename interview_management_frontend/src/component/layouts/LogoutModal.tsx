import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Define the props type
interface LogoutModalProps {
  show: boolean;
  handleClose: () => void;
  handleLogout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ show, handleClose, handleLogout }) => {
  return (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`} tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Logout</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to log out?</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LogoutModal;
