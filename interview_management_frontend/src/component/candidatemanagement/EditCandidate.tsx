import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import makeAnimated from 'react-select/animated';
import { jwtDecode } from 'jwt-decode';
import Select, { MultiValue, SingleValue } from 'react-select';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';          // core css
import 'primeicons/primeicons.css';                        // icons
import 'primeflex/primeflex.css';
import { Helmet } from 'react-helmet';
import { JwtPayLoad } from '../Header';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import CandidateService, { ACTION, CandidateForm } from '../../services/candidateService';
import CommonValueService from '../../services/commonValue';
import { COMMON_VALUE_NAMES } from '../../services/commonValue';
import { Calendar } from 'primereact/calendar';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { useNavigation } from '../../utils/NavigationContext';
import LoadingOverlay from '../../utils/LoadingOverlay';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
const animatedComponents = makeAnimated();


const genderOptions = [
    { value: 'true', label: 'Male' },
    { value: 'false', label: 'Female' }
];

const EditCandidate: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        gender: null as SingleValue<{ value: string, label: string }> | null | undefined,
        phoneNumber: '',
        address: '',
        dob: '',
        createAt: '',
        updateAt: '',
        cvAttachmentUrl: '',
        candidateStatus: '',
        cvAttachmentFileName: '',
        cvAttachmentFile: null as File | null,
        position: null as SingleValue<{ value: string, label: string }> | null,
        skills: [] as MultiValue<{ value: string, label: string }>,
        yearOfExperience: '',
        highest_level: null as SingleValue<{ value: string, label: string }> | null,
        note: '',
        recruiterDTO: null as { id: string, fullName: string, username: string } | null,
        updaterDTO: null as { id: string, fullName: string, username: string } | null
    });

    const location = useLocation();
    const [candidateId, setCandidateId] = useState<any>();
    const [optionsLoaded, setOptionsLoaded] = useState<boolean>(false);
    const [recruiterOptions, setRecruiterOptions] = useState<any[]>([]);
    const [skillOptions, setSkillOptions] = useState<any[]>([]);
    const [positionOptions, setPositionOptions] = useState<any[]>([]);
    const [highLevelOptions, setHighLevelOptions] = useState<any[]>([]);
    const [candidateStatusOptions, setCandidateStatusOptions] = useState<any[]>([]);
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);
    const [updaterId, setUpdaterId] = useState<number>(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const [role, setRole] = React.useState("");
    const isOnlyInterviewerRole = role === COMMON_VALUE_NAMES.ROLE_INTERVIEWER;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialPhoneNumber, setInitialPhoneNumber] = useState('');
    const [initialEmail, setInitialEmail] = useState('');
    // GET TOKEN
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decodedToken = jwtDecode(token) as JwtPayLoad;
            setRole(decodedToken.role.join(', '));
            setUpdaterId(decodedToken.userId);
        } catch (error) {
            console.error('Invalid token', error);
            navigate("/login");
        }
    }, [navigate]);

    // GET RECRUITER
    useEffect(() => {
        const fetchRecruiters = async () => {
            try {
                const options = await CandidateService.getAllRecruiters();
                setRecruiterOptions(options);
            } catch (error) {
                console.error('Error fetching recruiters:', error);
            }
        };

        fetchRecruiters();
    }, []);

    const fetchOptions = async (name: string, beginIndex: number, endIndex: number, setState: React.Dispatch<React.SetStateAction<any[]>>) => {
        try {
            const options = await CommonValueService.getAllCommonValueByName(name, beginIndex, endIndex);
            setState(options);
        } catch (error) {
            console.error(`Error fetching ${name} options:`, error);
        }
    };

    useEffect(() => {
        const fetchAllOptions = async () => {
            await fetchOptions(COMMON_VALUE_NAMES.SKILLS.toString(), 0, 0, setSkillOptions);
            await fetchOptions(COMMON_VALUE_NAMES.POSITION.toString(), 0, 0, setPositionOptions);
            await fetchOptions(COMMON_VALUE_NAMES.HIGHEST_LEVEL.toString(), 0, 0, setHighLevelOptions);
            await fetchOptions(COMMON_VALUE_NAMES.CANDIDATE_STATUS.toString(), 1, 2, setCandidateStatusOptions);
            setOptionsLoaded(true);
        };

        fetchAllOptions();
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('candidateId');
        if (id) {
            setCandidateId(Number(id));
        }
    }, [location]);

    useEffect(() => {
        const loadCandidateData = async () => {
            setLoading(true);
            if (candidateId && optionsLoaded) {
                try {
                    const candidateData: CandidateForm = await CandidateService.getCandidateById(candidateId);
                    setFormData({
                        ...formData,
                        fullName: candidateData.fullName,
                        email: candidateData.email,
                        gender: genderOptions.find(option => option.value === String(candidateData.gender)),
                        phoneNumber: candidateData.phoneNumber,
                        address: candidateData.address,
                        dob: new Date(candidateData.dob),
                        candidateStatus: candidateData.candidateStatus,
                        cvAttachmentFile: null,
                        position: positionOptions.find(option => option.value === candidateData.position),
                        skills: candidateData.skills.split(',').map((skill: any) => skillOptions.find(option => option.value === skill.trim())),
                        yearOfExperience: candidateData.yearOfExperience,
                        highest_level: highLevelOptions.find(option => option.value === candidateData.highest_level),
                        note: candidateData.note,
                        recruiterDTO: candidateData.recruiterDTO,
                        updaterDTO: candidateData.updaterDTO,
                        cvAttachmentFileName: candidateData.cvAttachmentFileName,
                        cvAttachmentUrl: candidateData.cvAttachmentUrl
                    });
                    const selectedRecruiter = recruiterOptions.find(option => option.value === candidateData.recruiterDTO!.id);
                    // if(role !== COMMON_VALUE_NAMES.ROLE_ADMIN && role !== COMMON_VALUE_NAMES.ROLE_INTERVIEWER) {
                    //     if(candidateData.recruiterDTO!.id !== updaterId.toString() ) {
                    //         navigate('/404-not-found');
                    //     }


                    // }



                    setSelectedRecruiter(selectedRecruiter);
                    setInitialEmail(candidateData.email);
                    setInitialPhoneNumber(candidateData.phoneNumber);
                } catch (error) {
                    console.error("Error loading candidate data:", error);
                } finally {
                    setLoading(false);
                    console.log(role)
                }
            }
        };

        loadCandidateData();
    }, [candidateId, optionsLoaded, recruiterOptions]);




    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, files } = e.target;
        if (files) {
            setFormData(prevData => ({ ...prevData, [id]: files[0] }));
        } else {
            setFormData(prevData => ({ ...prevData, [id]: value }));
        }
    };


    const customUploadHandler = (event: FileUploadHandlerEvent) => {
        const { files } = event;
        if (files && files.length > 0) {
            setFormData(prevData => ({ ...prevData, cvAttachmentFile: files[0] }));
            //   if (fileUploadRef.current) {
            //     fileUploadRef.current.clear();
            //   }
        }
    };

    const handleSelectChange = (selectedOption: any, actionMeta: any) => {
        const { name } = actionMeta;
        setFormData(prevData => ({
            ...prevData,
            [name]: selectedOption
        }));
    };

    const handleSkillsChange = (selectedOptions: MultiValue<{ value: string; label: string }>) => {
        setFormData(prevData => ({ ...prevData, skills: selectedOptions }));
    };

    const handleRecruiterChange = (selectedOption: any) => {
        setSelectedRecruiter(selectedOption);
        setFormData(prevData => ({
            ...prevData,
            recruiterDTO: {
                id: selectedOption.value,
                fullName: selectedOption.label.split(' (')[0],
                username: selectedOption.label.split('(')[1].slice(0, -1)
            }
        }));
    };


    const handleSubmit = async () => {
        console.log(formData.cvAttachmentFile); // Kiểm tra giá trị của cvAttachmentFile

        if (formData.phoneNumber.trim()) {

            const phoneNumberPattern = /^\+?[0-9]{10,15}$/;
            if (!phoneNumberPattern.test(formData.phoneNumber)) {
                Swal.fire('Error', 'Phone number must contain 10 to 15 digits and may start with a "+"', 'error');
                return false;
            }

            if (formData.phoneNumber.trim() !== initialPhoneNumber) {

                const phoneNumberExists = await CandidateService.checkPhoneNumberExists(formData.phoneNumber);
                if (phoneNumberExists) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Phone number already exists!',
                    });
                    return;
                }
            }
        }

        if (!formData.email.trim()) {
            Swal.fire('Error', 'Please fill out Email field', 'error');
            return;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire('Error', 'Invalid email address', 'error');
            return;
        } else if (formData.email.trim() !== initialEmail) {

            const emailExists = await CandidateService.checkEmailHasAlready(formData.email);
            if (emailExists) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Email already exists!',
                });
                return;
            }
        }

        const isValid = await CandidateService.validateCandidateForm(formData, ACTION.UPDATE)

        if (isValid) {
            setLoading(true);
            await CandidateService.UpdateCandidate(formData, updaterId, candidateId)
                .then((response) => {
                    console.log(response.message);
                    Swal.fire({
                        title: response.message,
                        icon: "success",
                        confirmButtonText: "Close",
                    }).then(() => {
                        navigate('/candidate-list');
                    });
                })
                .catch((error) => {
                    console.log("Error:", error);
                    Swal.fire({
                        title: error,
                        icon: "error",
                        text: "Please try later.",
                        confirmButtonText: "Close",
                    });
                })
                .finally(() => setLoading(false));
        }

    };

    const goCandidateList = () => {
        navigate('/candidate-list');
    };

    const toast = useRef<Toast>(null);

    const onUpload = () => {
        if (toast.current) {
            toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
        }
    };

    const assignMe = () => {
        const recruiter = recruiterOptions.find(option => option.value === updaterId.toString());
        console.log(recruiter);
        if (recruiter) {
            setSelectedRecruiter(recruiter);
            setFormData(prevData => ({
                ...prevData,
                recruiterDTO: {
                    id: recruiter.value,
                    fullName: recruiter.label.split(' (')[0],
                    username: recruiter.label.split('(')[1].slice(0, -1)
                }
            }));
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className='create-candidate'>
            <LoadingOverlay isLoading={loading} />

            <Helmet>
                <title>Edit Candidate</title>
            </Helmet>

            <div className="tab-content">
                <div className="p-5">
                    <div className='backto-div'>
                        <Button label=" Back to candidate list" text icon="pi pi-angle-double-left" className='backto' onClick={goCandidateList} />
                    </div>
                    <div className='bg-white p-3 candidate-form-container'>
                        <div className="mb-3">
                            <strong><h4>I. Personal information</h4></strong>
                        </div>
                        <div className="grid justify-content-between">
                            <div className="col-5">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="fullName" className="col-3 col-form-label">Full name <span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <InputText id="fullName" maxLength={255} value={formData.fullName} onChange={handleInputChange} placeholder="Type a name" required />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="dob" className="col-3 col-form-label">D.O.B</label>
                                    <div className="col-9">
                                        <Calendar id="dob" value={formData.dob} onChange={handleInputChange} placeholder="Select your date of birth" required dateFormat="dd/mm/yy" />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="phoneNumber" className="col-3 col-form-label">Phone number</label>
                                    <div className="col-9">
                                        <InputText id="phoneNumber" maxLength={255} value={formData.phoneNumber} onChange={handleInputChange} placeholder="Type a number" required />
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="email" className="col-3 col-form-label">Email <span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <InputText type="email" maxLength={255} id="email" value={formData.email} onChange={handleInputChange} placeholder="Type an email" required />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="address" className="col-3 col-form-label">Address</label>
                                    <div className="col-9">
                                        <InputText id="address" maxLength={255} value={formData.address} onChange={handleInputChange} placeholder="Type an address" required />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="gender" className="col-3 col-form-label">Gender <span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name="gender"
                                            options={genderOptions}
                                            value={formData.gender}
                                            onChange={handleSelectChange}
                                            placeholder="Select your gender"
                                            required
                                        />

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3 ">
                            <strong><h4>II. Professional information</h4></strong>
                        </div>
                        <div className="grid justify-content-between">
                            <div className="col-5">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="cvAttachmentFile" className="col-3 col-form-label">CV attachment</label>
                                    <div className="col-9 file-col relative ">
                                        <div className='card'>
                                            <input type="file" id="cvAttachmentFile" className="" onChange={handleInputChange} />
                                        </div>
                                        {
                                            formData.cvAttachmentFile === null &&
                                            <div className='absolute old-file'>
                                                {formData.cvAttachmentUrl && formData.cvAttachmentUrl !== "N/A" ?
                                                    <Button label={formData.cvAttachmentFileName} link className='old-file-btn' onClick={() => window.open(formData.cvAttachmentUrl)} /> : <>
                                                    </>
                                                }
                                            </div>
                                        }


                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="position" className="col-3 col-form-label">Position <span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name="position"
                                            options={positionOptions}
                                            value={formData.position}
                                            onChange={handleSelectChange}
                                            placeholder="Select a position"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="skills" className="col-3 col-form-label">Skills <span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name="skills"
                                            closeMenuOnSelect={false}
                                            components={animatedComponents}
                                            isMulti
                                            options={skillOptions}
                                            value={formData.skills}
                                            onChange={handleSkillsChange}
                                            placeholder="Select your skills"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid align-items-center">
                                    <label htmlFor="recruiterDTO" className="col-3 col-form-label">Recruiter <span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            options={recruiterOptions}
                                            value={selectedRecruiter}
                                            onChange={handleRecruiterChange}
                                            placeholder="Select a recruiter"
                                            required
                                        />
                                    </div>
                                </div>
                                {
                                    role === COMMON_VALUE_NAMES.ROLE_RECRUITER &&
                                    <div className="grid mb-3 align-items-center">
                                        <div className="col-3"></div>
                                        <div className="col-9">
                                            <Button label="Assign me" link className='ass-me' onClick={assignMe} />
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="col-6">

                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="yearOfExperience" className="col-3 col-form-label">Years of experience</label>
                                    <div className="col-9">
                                        <InputText id="yearOfExperience" maxLength={255} value={formData.yearOfExperience} onChange={handleInputChange} placeholder="Type number of experience" />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="highest_level" className="col-3 col-form-label">Highest level <span className='text-danger'>*</span></label>
                                    <div className="col-9">

                                        <Select
                                            name="highest_level"
                                            options={highLevelOptions}
                                            value={formData.highest_level}
                                            onChange={handleSelectChange}
                                            placeholder='Select a level'
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="candidateStatus" className="col-3 col-form-label">Status</label>
                                    <div className="col-9">
                                        <span>{formData.candidateStatus}</span>
                                    </div>
                                </div>
                                
                                <div className="grid mb-3">
                                    <label htmlFor="note" className="col-3 col-form-label">Note</label>
                                    <div className="col-9">
                                        <InputTextarea id="note" value={formData.note} onChange={handleInputChange} placeholder="Type a note" rows={5} cols={30} />

                                        {/* <InputText id="note" maxLength={500} value={formData.note} onChange={handleInputChange} placeholder="Type a note" /> */}
                                    </div>
                                </div>
                            </div>


                        </div>
                        <div className="mt-3">
                            <div className="flex justify-content-center">
                                <Button label='Submit' className='mr-3' severity='secondary' onClick={handleSubmit} />
                                <Button label='Cancel' className='' severity='secondary' onClick={handleCancel} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EditCandidate;