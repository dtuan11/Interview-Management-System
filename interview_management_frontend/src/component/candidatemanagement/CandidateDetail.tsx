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
import { Toast } from 'primereact/toast';
import CandidateService, { CandidateForm } from '../../services/candidateService';
import CommonValueService from '../../services/commonValue';
import { COMMON_VALUE_NAMES } from '../../services/commonValue';
import { ProgressSpinner } from 'primereact/progressspinner';
import { divide } from 'lodash';
import { Skeleton } from 'primereact/skeleton';
import LoadingOverlay from '../../utils/LoadingOverlay';
const animatedComponents = makeAnimated();

const CandidateInformation: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        gender: '',
        phoneNumber: '',
        address: '',
        dob: '',
        createAt: '',
        updateAt: '',
        candidateStatus: '',
        cvAttachmentUrl: '',
        cvAttachmentFileName: '',
        position: '',
        skills: [] as MultiValue<{ value: string, label: string }>,
        yearOfExperience: '',
        highest_level: '',
        note: '',
        recruiterDTO: null as { id: string, fullName: string, username: string } | null,
        updaterDTO: null as { id: string, fullName: string, username: string } | null
    });
    const location = useLocation();
    const [candidateId, setCandidateId] = useState<any>();
    const [optionsLoaded, setOptionsLoaded] = useState<boolean>(false);
    const [recruiterOptions, setRecruiterOptions] = useState<any[]>([]);
    const [skillOptions, setSkillOptions] = useState<any[]>([]);
    const [updaterId, setUpdaterId] = useState<number>(0);
    const [role, setRole] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingBan, setLoadingBan] = useState(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const navigate = useNavigate();


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


    const isOnlyInterviewerRole = role === COMMON_VALUE_NAMES.ROLE_INTERVIEWER;


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
        setLoading(true);
        const loadCandidateData = async () => {
            if (candidateId && optionsLoaded) {
                try {
                    const candidateData: CandidateForm = await CandidateService.getCandidateById(candidateId);
                    console.log(candidateData);
                    setFormData({
                        ...formData,
                        fullName: candidateData.fullName,
                        email: candidateData.email,
                        gender: candidateData.gender ? 'Male' : 'Female',
                        phoneNumber: candidateData.phoneNumber,
                        address: candidateData.address,
                        dob: candidateData.dob ? CandidateService.formatDateString(candidateData.dob) : 'N/A',
                        createAt: (candidateData.createAt === new Date().toISOString().split('T')[0])
                            ? 'today'
                            : CandidateService.formatDateString(candidateData.createAt),
                        updateAt: (candidateData.updateAt === new Date().toISOString().split('T')[0])
                            ? 'today'
                            : CandidateService.formatDateString(candidateData.updateAt),
                        candidateStatus: candidateData.candidateStatus,
                        cvAttachmentUrl: candidateData.cvAttachmentUrl,
                        position: candidateData.position,
                        skills: candidateData.skills.split(',').map((skill: any) => skillOptions.find(option => option.value === skill.trim())),
                        yearOfExperience: candidateData.yearOfExperience,
                        highest_level: candidateData.highest_level,
                        note: candidateData.note,
                        recruiterDTO: candidateData.recruiterDTO,
                        updaterDTO: candidateData.updaterDTO,
                        cvAttachmentFileName: candidateData.cvAttachmentFileName
                    });
                    
                    if(candidateData.recruiterDTO!.id === updaterId.toString()) {
                        setIsEdit(true);
                    }

                } catch (error) {
                    console.error("Error loading candidate data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadCandidateData();
    }, [candidateId, optionsLoaded, recruiterOptions]);

    const goCandidateList = () => {
        navigate('/candidate-list');
    };

    const handleEdit = (candidateId: number) => {
        if (candidateId) {
            navigate(`/edit-candidate?candidateId=${candidateId}`, { state: { from: window.location.pathname } });
        }
    };

    const handleBan = async (candidateId: number) => {
        await Swal.fire({
            title: "Are you sure you want to ban this candidate?",
            icon: "warning",
            confirmButtonText: "Yes",
            showCancelButton: true,
            cancelButtonText: "No",
        }).then((result) => {
            if (result.isConfirmed) {
                setLoadingBan(true);
                CandidateService.handleBan(candidateId, updaterId)
                    .then((response) => {
                        console.log(response.message);
                        Swal.fire({
                            title: response.message,
                            icon: "success",
                            confirmButtonText: "Close",
                        }).then(() => {
                            window.location.reload();
                        });
                    })
                    .catch((error) => {
                        console.log("Error:", error);
                        Swal.fire({
                            title: "Ban candidate Fail",
                            icon: "error",
                            text: "Please try later.",
                            confirmButtonText: "Close",
                        });
                    })
                    .finally(() => setLoadingBan(false));
            }
        });
    };

    const handleUnban = async (candidateId: number) => {
        await Swal.fire({
            title: "Are you sure you want to unban this candidate?",
            icon: "warning",
            confirmButtonText: "Yes",
            showCancelButton: true,
            cancelButtonText: "No",
        }).then((result) => {
            if (result.isConfirmed) {
                setLoadingBan(true);
                CandidateService.handleUnban(candidateId, updaterId)
                    .then((response) => {
                        console.log(response.message);
                        Swal.fire({
                            title: response.message,
                            icon: "success",
                            confirmButtonText: "Close",
                        }).then(() => {
                            window.location.reload();
                        });
                    })
                    .catch((error) => {
                        console.log("Error:", error);
                        Swal.fire({
                            title: "Unban candidate Fail",
                            icon: "error",
                            text: "Please try later.",
                            confirmButtonText: "Close",
                        });
                    })
                    .finally(() => setLoadingBan(false));
            }
        });
    };

    if(loading) return (<LoadingOverlay isLoading={loading} />
    )

    return (
        <div className='candidate-detail'>
            <LoadingOverlay isLoading={loadingBan} />

            <Helmet>
                <title>Candidate Information</title>
            </Helmet>

            <div className="tab-content">
                <div className="p-5">
                    <div className={`backto-div ${isOnlyInterviewerRole ? '' : 'flex justify-content-between'} `}>
                        <Button label=" Back to candidate list" text icon="pi pi-angle-double-left" className='backto' onClick={goCandidateList} />
                        {!isOnlyInterviewerRole && formData.candidateStatus !== 'Banned' && (
                            <>
                                <Button label="Ban candidate" className='ban-candidate-btn' severity="danger" onClick={() => handleBan(candidateId)} />
                            </>
                        )}

                        {!isOnlyInterviewerRole && formData.candidateStatus === 'Banned' && (
                            <>
                                <Button label="Unban candidate" className='ban-candidate-btn' severity="success" onClick={() => handleUnban(candidateId)} />
                            </>
                        )}
                    </div>
                    <div className='bg-white p-3 candidate-form-container'>
                        {loading ? <Skeleton width="100%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                            <div className="mb-3 flex justify-content-between">
                                <div>
                                    <strong><h4>I. Personal information</h4></strong>
                                </div>
                                <div>
                                    <span className='create-update-date text-sm text-500'>Created on {formData.createAt}, last updated by {formData.updaterDTO ? formData.updaterDTO.username : 'N/A'} on {formData.updateAt}</span>
                                </div>
                            </div>
                        }


                        <div className="grid justify-content-between">
                            <div className="col-5 pb-0">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="fullName" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Full name'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="fullName">{formData.fullName}</span>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="dob" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'D.O.B'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="dob">{formData.dob ?  formData.dob : 'N/A'}</span>}

                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="phoneNumber" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Phone number'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px"></Skeleton> : <span id="phoneNumber">{formData.phoneNumber ?  formData.phoneNumber : 'N/A'}</span>}

                                    </div>
                                </div>
                            </div>
                            <div className="col-6 pb-0">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="email" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Email'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="email">{formData.email}</span>}

                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="address" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Address'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="address">{formData.address ?  formData.address : 'N/A'}</span>}

                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="gender" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Gender'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="gender">{formData.gender}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {loading ? <Skeleton width="100%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                            <div className="mb-3 ">
                                <strong><h4>II. Professional information</h4></strong>
                            </div>
                        }
                        <div className="grid justify-content-between">
                            <div className="col-5 pb-0">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="cvAttachmentFile" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'CV attachment'}
                                    </label>
                                    <div className="col-9">

                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> :
                                            <>
                                                {
                                                    formData.cvAttachmentUrl && formData.cvAttachmentUrl !== "N/A" ? <Button className='btn-cv'
                                                        // icon='pi pi-file'
                                                        // iconPos='right'

                                                        label={formData.cvAttachmentFileName} text link severity='info'
                                                        onClick={() => window.open(formData.cvAttachmentUrl)} /> : 'N/A'
                                                }
                                            </>
                                        }

                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="position" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Position'}

                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="position">{formData.position}</span>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="skills" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Skills'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> :
                                            <Select
                                                name="skills"
                                                closeMenuOnSelect={false}
                                                components={animatedComponents}
                                                isMulti
                                                options={skillOptions}
                                                value={formData.skills}
                                                placeholder="Select your skills"
                                                isDisabled
                                            />}

                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="recruiterDTO" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Recruiter'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> :
                                            <span>{formData.recruiterDTO ? formData.recruiterDTO.fullName + ' (' + formData.recruiterDTO.username + ')' : 'No recruiter'}</span>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 pb-0">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="note" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Note'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="note">{formData.note ? formData.note : 'N/A'}</span>}

                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="candidateStatus" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Status'}

                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : <span id="candidateStatus">{formData.candidateStatus}</span>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="yearOfExperience" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Years of experience'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> :
                                            <span id="yearOfExperience">{formData.yearOfExperience ? parseInt(formData.yearOfExperience) > 1 ?  formData.yearOfExperience + ' years': formData.yearOfExperience + ' year' : 'N/A'}</span>
                                        }

                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="highest_level" className="col-3 col-form-label">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> : 'Highest level'}
                                    </label>
                                    <div className="col-9">
                                        {loading ? <Skeleton width="100%" height="24px" borderRadius="16px" ></Skeleton> :
                                            <span id="highest_level">{formData.highest_level}</span>
                                        }

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="flex justify-content-center">
                                {
                                
                                (!isOnlyInterviewerRole ) && (
                                    <Button label='Edit' className='mr-3' severity='secondary' onClick={() => handleEdit(candidateId)} />
                                )
                                
                                }
                                <Button label='Cancel' className='' severity='secondary' onClick={goCandidateList} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CandidateInformation;