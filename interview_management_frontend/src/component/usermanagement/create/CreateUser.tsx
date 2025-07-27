import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { isValidUrlEmail, useDebounce } from '../../../utils/hooks';
import "../create/CreateUser.css";
import UserService, { checkEmailHasAlready, checkIsEighteenYearsOld, checkPhoneNumberExists } from '../../../services/user';
import { Button } from 'primereact/button';
import LoadingOverlay from '../../../utils/LoadingOverlay';
import { Helmet } from 'react-helmet';
import { InputText } from 'primereact/inputtext';

const CreateUser: React.FC = () => {
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
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get('page') || '1';

  const [errorEmail, setErrorEmail] = useState<string>("");
  const [errorPhone, setErrorPhone] = useState<string>("");
  const [errorAge, setErrorAge] = useState<string>("");
  const [errorFullName, setErrorFullName] = useState<string>("");
  const [errorAddress, setErrorAddress] = useState<string>("");

  const debouncedEmail = useDebounce(userData.email, 1000);
  const debouncedPhone = useDebounce(userData.phoneNumber, 1000);
  const debouncedDob = useDebounce(userData.dob, 1000);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Hide loading overlay after 2 seconds
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (debouncedEmail) {
      if (!isValidUrlEmail(debouncedEmail)) {
        setErrorEmail("Invalid email format for URL.");
      } else {
        checkEmailHasAlready(debouncedEmail).then(exists => {
          if (exists) setErrorEmail("This email has already existed");
        });
      }
    }
  }, [debouncedEmail]);

  useEffect(() => {
    if (debouncedPhone) {
      checkPhoneNumberExists(debouncedPhone).then(exists => {
        if (exists) setErrorPhone("This phone number has already existed");
      });
    }
  }, [debouncedPhone]);

  useEffect(() => {
    if (debouncedDob) {
      checkIsEighteenYearsOld(debouncedDob).then(isOldEnough => {
        if (!isOldEnough) setErrorAge("User must be at least 18 years old or under 60 years old");
      });
    }
  }, [debouncedDob]);

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const validateFullName = (fullName: string) => {
    // Allow Vietnamese characters and spaces
    const regex = /[0-9!@#$%^&*()_+=\[\]{};:'",.<>?/\\|`~\-]/;
    return !regex.test(fullName) && fullName.length <= 50;
  };
  

  const validatePhoneNumber = (phoneNumber: string) => {
    const regex = /^[0-9]*$/;
    return regex.test(phoneNumber);
  };

  const validateAddress = (address: string) => {
    return address.length <= 255;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      setUserData({
        ...userData,
        roles: [value]
      });
    }
    else if (name === 'fullName') {
      if (validateFullName(value)) {
        setUserData({
          ...userData,
          [name]: value
        });
        setErrorFullName(""); // Clear error if full name is valid
      } else {
        setErrorFullName("Full name must contain only letters and be less than 50 characters.");
      }
    } else if (name === 'phoneNumber') {
      if (validatePhoneNumber(value)) {
        setUserData({
          ...userData,
          [name]: value
        });
        setErrorPhone(""); // Clear error if phone number is valid
      } else {
        setErrorPhone("Phone number must contain only numbers.");
      }
    } else if (name === 'address') {
      if (validateAddress(value)) {
        setUserData({
          ...userData,
          [name]: value
        });
        setErrorAddress(""); // Clear error if address is valid
      } else {
        setErrorAddress("n");
      }
    } else {
      setUserData({
        ...userData,
        [name]: name === 'isActive' ? (value === 'true') : value
      });
    }

    if (name === 'email') {
      setErrorEmail("");
    }
    if (name === 'dob') {
      setErrorAge("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPhone("");
    setErrorAge("");
    setErrorFullName("");
    setErrorAddress("");

    const isEmailValid = !await checkEmailHasAlready(userData.email);
    const isPhoneValid = !await checkPhoneNumberExists(userData.phoneNumber);
    const isAgeValid = await checkIsEighteenYearsOld(userData.dob);
    const isFullNameValid = validateFullName(userData.fullName);
    const isAddressValid = validateAddress(userData.address);

    if (!isEmailValid) {
      setErrorEmail("Email has already been used.");
    }

    if (!isPhoneValid) {
      setErrorPhone("Phone number already exists.");
    }

    if (!isAgeValid) {
      setErrorAge("User must be at least 18 years old");
    }

    if (!isFullNameValid) {
      setErrorFullName("Full name must contain only letters and be less than 50 characters.");
    }

    if (!isAddressValid) {
      setErrorAddress("Address must be less than 255 characters.");
    }

    if (isEmailValid && isPhoneValid && isAgeValid && isFullNameValid && isAddressValid) {
      const success = await UserService.createUser(userData);

      if (success.success) {
        swal("Success", "Successfully created user", "success");
        navigate(`/user-list?page=${currentPage}`);
      } else {
        swal("Error", "Failed to create user", "error");
      }
    } else {
      swal("Error", "Please fix the validation errors and try again.", "error");
    }
  };

  return (
    <div className="create-user-form">
     <LoadingOverlay isLoading={loading} />
     <Helmet>
        <title>Create New User</title>
      </Helmet>
      <div className='backto-div'>
        <Button label=" Back to user list" text icon="pi pi-angle-double-left" className='backto' onClick={() => navigate('/user-list')} />
      </div>
{!loading&&
      <div className="form-containter">
        <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name <span style={{ color: 'red' }}>*</span></label>
          <InputText
            type="text"
            name="fullName"
            value={userData.fullName}
            onChange={handleChange}
            required
          />
          <div style={{ color: 'red' }}>{errorFullName}</div>
        </div>

        <div>
          <label>D.O.B<span style={{ color: 'red' }}>*</span></label>
          <input
            type="date"
            name="dob"
            value={userData.dob}
            onChange={handleChange}
            required
          />
          <div style={{ color: 'red' }}>{errorAge}</div>
        </div>
        <div>
          <label>Phone Number<span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            name="phoneNumber"
            value={userData.phoneNumber}
            onChange={handleChange}
            required
            maxLength={11}
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
            maxLength={50}
          />
          <div style={{ color: 'red' }}>{errorEmail}</div>
        </div>
        <div>
          <label>Address<span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleChange}
            required
          />
            <div style={{ color: 'red' }}>{errorAddress}</div>
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
            value={userData.roles[0] || ""}
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
          <label>Status <span style={{ color: 'red' }}>*</span></label>
          <select
            name="isActive"
            value={userData.isActive ? 'true' : 'false'}
            onChange={handleChange}
            required
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div>
          <label>Note</label>
          <input
            type="text"
            name="note"
            value={userData.note}
            onChange={handleChange}
            placeholder='N/A'
          />
        </div>

          <div className='flex justify-content-center w-100'>
            <Button label="Submit" severity='secondary' className='mr-2' type="submit" />
            <Button severity='secondary' label='Cancel' onClick={() => navigate('/user-list')} />
          </div>
        </form>

      </div>
}
    </div>
  );
};

export default CreateUser;