import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from 'primereact/button';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import CommonValueService from '../../services/commonValue';
import CandidateService from '../../services/candidateService';
import UserService from '../../services/user';
import { OfferService } from '../../services';
import { useParams } from 'react-router-dom';
import 'primereact/resources/themes/saga-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';          // core css
import 'primeicons/primeicons.css';                        // icons
import 'primeflex/primeflex.css';
import { InputTextarea } from 'primereact/inputtextarea';
import Select from 'react-select';
import { Helmet } from 'react-helmet';
import LoadingOverlay from '../../utils/LoadingOverlay';
import { InputNumber } from 'primereact/inputnumber';
import { jwtDecode } from 'jwt-decode';
import { JwtPayLoad } from '../Header';
import AuthService from '../../services/auth';

const EditOffer: React.FC = ({ EditOfferOpen, setEditOfferOpen, id, refreshList }: any) => {
    const { offerId } = useParams<{ offerId: string }>();
    const [candidateName, setCandidateName] = useState<string>('');
    const [candidateNameFullName, setCandidateFullName] = useState<string>('');
    const [candidateNameSelect, setCandidateNameSelect] = useState<any>('');
    const [position, setPosition] = useState<string>('');
    const [contractPeriodFrom, setContractPeriodFrom] = useState<string>('');
    const [contractPeriodTo, setContractPeriodTo] = useState<string>('');
    const [approverBy, setapproverBy] = useState<string>('');
    const [scheduleInfo, setScheduleInfo] = useState<number>();
    const [scheduleTitles, setScheduleTitles] = useState<string>('');
    const [recruiterOwnerFullName, setRecruiterOwnerFullName] = useState<string>('');

    const [scheduleNotes, setScheduleNotes] = useState<string>('');
    const [contractType, setContractType] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [recruiterOwner, setRecruiterOwner] = useState<string>();
    const [dueDate, setDueDate] = useState<string>('');
    const [basicSalary, setBasicSalary] = useState<any>();
    const [note, setNote] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [createAt, setCreateAt] = React.useState("");

    const [contractTypes, setContractTypes] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [approvers, setApprovers] = useState<any[]>([]);

    const [scheduleTimeError, setScheduleTimeError] = useState<string>('');
    const [scheduleDateError, setScheduleDateError] = useState<string>('');
    const [salaryError, setSalaryError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const currentDate = new Date().toISOString().split('T')[0];
    try {
        id = parseInt(offerId + '');
        if (Number.isNaN(id)) {
            id = 0;
        }
    } catch (error) {
        id = 0;
        console.log(error);
    }
    useEffect(() => {
        loadCommonValue();
        loadManager();
    }, []);

    useEffect(() => {
        try {
            if (id) {
                loadOfferEdit(id);
            }
        } catch (error) {
            setError("Error fetching offer details");
            console.error("Error fetching offer details:", error);
        } finally {

        }
    }, [id]);

    useEffect(() => {
        validateScheduleTime();
    }, [contractPeriodFrom, contractPeriodTo]);

    useEffect(() => {
        validateBasicSalary();
    }, [basicSalary]);
    useEffect(() => {
        validateScheduleDate();
    }, [dueDate]);
    const loadOfferEdit = (id: any) => {
        OfferService.getOfferById(id).then((response: any) => {
            const data = response.response.data.data;
            const role = AuthService.getUserRole();
            const username = (AuthService.getusername());
            if (data) {
                setCandidateFullName(data.candidateName);
                setCandidateName(data.email);
                setPosition(data.position);
                setContractPeriodFrom(data.contractPeriodFrom);
                setContractPeriodTo(data.contractPeriodTo);
                setapproverBy(data.approverByUsername);
                setScheduleInfo(data.interviewInfo);
                setScheduleTitles(data.interviewTitle);
                setScheduleNotes(data.interviewNotes);
                setContractType(data.contractType);
                setLevel(data.level);
                setDepartment(data.department);
                setRecruiterOwnerFullName(data.recruiterOwnerFullName)
                setRecruiterOwner(data.recruiterOwner);
                setDueDate(data.dueDate);
                setBasicSalary(data.basicSalary);
                setNote(data.note);
                setStatus(data.status);
                setCreateAt(new Date(data.createAt).toISOString().split('T')[0])
                if (data.status === "Waiting for approval"
                    // &&
                    // (
                    //     (role === "ADMIN") ||
                    //     (role === "MANAGER" && data.approverByUsername === username) ||
                    //     (role === "RECRUITER" && data.recruiterOwner === username)
                    // )
                ) {
                } else {
                    navigate("/404-not-found")
                }
            } else {
                navigate("/404-not-found")
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                navigate("/404-not-found")
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const loadCommonValue = () => {
        CommonValueService.getCommonValue().then((response: any) => {
            const data = response.response.data.data;
            if (data) {
                setContractTypes(data["Contract type"] || []);
                setDepartments(data.Department || []);

            } else {
                showAlert("Load Data Common Value Fail");

            }
        })
            .catch((error) => {
                console.log("Error:", error);
                showAlert("Load Data Common Value Fail");

            })
            .finally(() => {


            });
    };
    const loadManager = () => {
        UserService.getManager().then((response: any) => {
            console.log(response, "res");
            const data = response.response.data;
            if (data) {
                setApprovers(data.data || []);
            } else {
                showAlert("Load Manager Fail");

            }
        })
            .catch((error) => {
                console.log("Error:", error);
                showAlert("Load Manager Fail");

            })
            .finally(() => {

            });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!candidateName || !position || !approverBy || !contractType || !level || !department || !recruiterOwner || !dueDate || !contractPeriodFrom || !contractPeriodTo || !basicSalary) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill in all required fields.',
                icon: 'error',
            });
            return;
        }
        if (scheduleTimeError || salaryError || scheduleDateError) {
            Swal.fire({
                title: 'Error',
                text: 'Please fix the errors before submitting.',
                icon: 'error',
            });
            return;
        }
        const OfferData = {
            offerId,
            candidateName,
            position,
            approverBy,
            scheduleInfo,
            contractType,
            level,
            department,
            recruiterOwner,
            dueDate,
            contractPeriodFrom,
            contractPeriodTo,
            basicSalary,
            note,
        };
        try {
            setLoading(true);
            await OfferService.editOffer(OfferData)
            Swal.fire('Success', 'Change has been successfully updated', 'success');
            navigate('/offer-list');
        } catch (error: any) {
            console.error('Error editing offer:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
            });
        } finally {
            setLoading(false);

        }
    };
    const validateScheduleTime = () => {
        if (contractPeriodFrom && contractPeriodFrom < createAt + 1) {
            setScheduleTimeError('ContractPeriodFrom must be greater than createAt: ' + `${createAt}` + ' one day');
        } else if (contractPeriodFrom && contractPeriodTo) {
            const fromDate = new Date(contractPeriodFrom);
            const toDate = new Date(contractPeriodTo);
            const minToDate = new Date(fromDate);
            minToDate.setMonth(minToDate.getMonth() + 1);

            if (toDate < minToDate) {
                setScheduleTimeError('ContractPeriodTo must be at least 1 month after ContractPeriodFrom.');
            } else {
                setScheduleTimeError('');
            }
        } else {
            setScheduleTimeError('');
        }
    };
    const validateScheduleDate = () => {
        if (dueDate && dueDate < createAt) {
            setScheduleDateError('dueDate cannot be less than createAt: ' + `${createAt}`);
        } else {
            setScheduleDateError('');
        }
    };
    const validateBasicSalary = () => {
        if (basicSalary && isNaN(basicSalary) || basicSalary < 0) {
            setSalaryError('Basic salary must be a number and >= 0');
        } else {
            setSalaryError('');
        }
    };
    const goOfferList = () => {
        navigate('/offer-list');
    };
    const handleCancel = () => {
        const fromPath = location.state && (location.state as { from: string }).from ? (location.state as { from: string }).from : '/';
        navigate(fromPath);
    };
    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            borderRadius: '4px',
            borderColor: '#ced4da',
        }),
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999,
        }),
    };
    const showAlert = (title: string) => {
        Swal.fire({
            title,
            icon: "error",
            text: "Please try later.",
            confirmButtonText: "Close",
        });
    };

    return (
        <div className='edit-offer'>
            <LoadingOverlay isLoading={loading} />

            <Helmet>
                <title>Edit Offer</title>
            </Helmet>
            <div className='backto-div'>
                <Button label=" Back to offer list" text icon="pi pi-angle-double-left" className='backto' onClick={goOfferList} />
            </div>
            <div className='bg-white p-3 candidate-form-container'>
                <div className="mb-3">
                    <div className="content-offer-form">
                        <div className="grid justify-content-between">
                            <div className="col-6">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Candidate" className="col-3 col-form-label">Candidate<span className='text-danger'>*</span></label>
                                    {/* <div className="col-9">
                                        <Select
                                            // value={(candidates.map(candidate => ({ value: candidate.email, label: `${candidate.fullName} (${candidate.email})` }))
                                            //     .find(option => option.value === candidateName))}
                                            value={candidateNameSelect}
                                            // onChange={(selectedOption: any) => {
                                            //     setCandidateNameSelect(selectedOption)
                                            //     setCandidateName(selectedOption.value)
                                            // }}
                                            onChange={handleCandidateChange}

                                            options={candidates.map(candidates => ({ value: candidates.candidateId, label: candidates.fullName + " (" + candidates.email + ")" }))}
                                        // options={candidates}
                                        />
                                    </div> */}
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{candidateNameFullName} ({candidateName})</p>
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Position" className="col-3 col-form-label">Position<span className='text-danger'>*</span></label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Position'
                                            value={(positions.map(position => ({ value: position, label: position }))).find(option => option.value === position)}
                                            options={positions.map(position => ({ value: position, label: position }))}
                                            onChange={(selectedOption: any) => setPosition(selectedOption.value)}
                                            placeholder="Select a Position"
                                        />
                                    </div> */}
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{position}</p>
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Approver" className="col-3 col-form-label">Approver<span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name='Approver'
                                            value={(approvers.map(approvers => ({ value: approvers.username, label: approvers.fullName + " (" + approvers.username + ")" }))).find(option => option.value === approverBy)}
                                            options={approvers.map(approvers => ({ value: approvers.username, label: approvers.fullName + " (" + approvers.username + ")" }))}
                                            onChange={(selectedOption: any) => setapproverBy(selectedOption.value)}
                                            placeholder="Select An Approver"
                                        />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Interview Info" className="col-3 col-form-label">Interview Info </label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Interview Info'
                                            // value={(interviewTitles.map(interviewTitles => ({ value: interviewTitles.scheduleId, label: interviewTitles.scheduleTitle }))).find(option => option.value === scheduleInfo)}
                                            value={scheduleInfoSelect}
                                            options={interviewTitles.map(interviewTitles => ({ value: interviewTitles.scheduleId, label: interviewTitles.scheduleTitle }))}
                                            onChange={handleInterviewTitleChange}
                                            placeholder="Select An Interview Schedule Title"
                                        />
                                    </div> */}
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{scheduleTitles}</p>
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Contract Period" className="col-3 col-form-label">Contract Period<span className='text-danger'>*</span></label>
                                    <div className="field col-9 mb-0">
                                        <div className="flex justify-content-around">
                                            <div className="inline-flex mr-3 align-items-center">
                                                <label htmlFor="scheduleFrom" className='mr-2 '>From </label>
                                                <input
                                                    type="date"
                                                    value={contractPeriodFrom}
                                                    onChange={(selectedOption: any) => setContractPeriodFrom(selectedOption.target.value)}
                                                    className="w-full form-control"
                                                />
                                            </div>
                                            <div className="inline-flex align-items-center">
                                                <label htmlFor="scheduleTo" className='mr-2'>To </label>
                                                <input
                                                    type="date"
                                                    value={contractPeriodTo}
                                                    onChange={(selectedOption: any) => setContractPeriodTo(selectedOption.target.value)}
                                                    className="w-full form-control"
                                                />
                                                {/* {scheduleTimeError && <small className="p-error">{scheduleTimeError}</small>} */}
                                            </div>
                                        </div>
                                        {scheduleTimeError && <small className="p-error">{scheduleTimeError}</small>}
                                    </div>

                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Interview Notes" className="col-3 col-form-label">Interview Notes</label>
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{scheduleNotes}</p>
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Status" className="col-3 col-form-label">Status</label>
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-5">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Contract Type" className="col-3 col-form-label">Contract Type<span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name='Contract Type'
                                            value={(contractTypes.map(contractTypes => ({ value: contractTypes, label: contractTypes }))).find(option => option.value === contractType)}
                                            options={contractTypes.map(contractTypes => ({ value: contractTypes, label: contractTypes }))}
                                            onChange={(selectedOption: any) => setContractType(selectedOption.value)}
                                            placeholder="Select a type of contract"
                                        />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Level " className="col-3 col-form-label">Level<span className='text-danger'>*</span></label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Level '
                                            value={(levels.map(levels => ({ value: levels, label: levels }))).find(option => option.value === level)}
                                            options={levels.map(levels => ({ value: levels, label: levels }))}
                                            onChange={(selectedOption: any) => setLevel(selectedOption.value)}
                                            placeholder="Select a Level..."
                                        />
                                    </div> */}
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{level}</p>
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Department" className="col-3 col-form-label">Department<span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name='Department'
                                            value={(departments.map(departments => ({ value: departments, label: departments }))).find(option => option.value === department)}
                                            options={departments.map(departments => ({ value: departments, label: departments }))}
                                            onChange={(selectedOption: any) => setDepartment(selectedOption.value)}
                                            placeholder="Select a Department..."
                                        />
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Recruiter Owner" className="col-3 col-form-label">Recruiter Owner<span className='text-danger'>*</span></label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Recruiter Owner'
                                            value={(recruiterOwners.map(recruiterOwners => ({ value: recruiterOwners.username, label: recruiterOwners.fullName + " (" + recruiterOwners.username + ")" }))).find(option => option.value === recruiterOwner)}
                                            options={recruiterOwners.map(recruiterOwners => ({ value: recruiterOwners.username, label: recruiterOwners.fullName + " (" + recruiterOwners.username + ")" }))}
                                            onChange={(selectedOption: any) => setRecruiterOwner(selectedOption.value)}
                                            placeholder="Select recruiter owner..."
                                            styles={customStyles}
                                        />
                                    </div> */}
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{recruiterOwnerFullName} ({recruiterOwner})</p>
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Dua date" className="col-3 col-form-label">Dua date<span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(selectedOption: any) => setDueDate(selectedOption.target.value)}
                                            className="w-full form-control"
                                        />
                                        {scheduleDateError && <small className="p-error">{scheduleDateError}</small>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Basic Salary" className="col-3 col-form-label">Basic Salary<span className='text-danger'>*</span></label>
                                    <div className="col-9">

                                        <InputNumber
                                            className="w-full"
                                            inputId="currency-us"
                                            value={basicSalary}
                                            onValueChange={(e) => setBasicSalary(e.value)}
                                            mode="currency"
                                            locale="de-vn"
                                            currency="VND"
                                            placeholder='Enter basic salary'
                                        />

                                        {salaryError && <small className="p-error">{salaryError}</small>}
                                    </div>
                                </div>
                                <div className="grid mb-3">
                                    <label htmlFor="Dua date" className="col-3 col-form-label">Note </label>
                                    <div className="col-9">
                                        <InputTextarea
                                            id="address"
                                            className='w-100'
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Type a Notes"
                                            rows={5} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="">
                            <div className="flex justify-content-center">
                                <Button label='Submit' className='mr-3' severity='secondary' onClick={handleSubmit} />
                                <Button label='Cancel' className='' severity='secondary' onClick={handleCancel} />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >

    );
};

export default EditOffer;

