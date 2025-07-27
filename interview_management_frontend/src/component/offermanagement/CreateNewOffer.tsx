import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from 'primereact/button';
import { useNavigate, Link } from 'react-router-dom';
import Select from 'react-select';
import CommonValueService from '../../services/commonValue';
import CandidateService from '../../services/candidateService';
import UserService from '../../services/user';
import { OfferService } from '../../services';
import 'primereact/resources/themes/saga-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';          // core css
import 'primeicons/primeicons.css';                        // icons
import 'primeflex/primeflex.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { Helmet } from 'react-helmet';
import LoadingOverlay from '../../utils/LoadingOverlay';
import { InputNumber } from 'primereact/inputnumber';
const CreateNewOffer: React.FC = () => {

    const [candidateName, setCandidateName] = useState<string>('');
    const [position, setPosition] = useState<string>('');
    const [contractPeriodFrom, setContractPeriodFrom] = useState<string>('');
    const [contractPeriodTo, setContractPeriodTo] = useState<string>('');
    const [approverBy, setapproverBy] = useState<string[]>([]);
    const [scheduleInfo, setScheduleInfo] = useState<number>();
    const [scheduleTitles, setScheduleTitles] = useState<string>();
    const [scheduleNotes, setScheduleNotes] = useState<string>('');
    const [contractType, setContractType] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [recruiterOwner, setRecruiterOwner] = useState<string[]>([]);
    const [recruiterOwnerFullName, setRecruiterOwnerFullName] = useState<string[]>([]);

    const [dueDate, setDueDate] = useState<string>('');
    const [basicSalary, setBasicSalary] = useState<any>();
    const [note, setNote] = useState<string>('');

    const [contractTypes, setContractTypes] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [approvers, setApprovers] = useState<any[]>([]);

    const [scheduleDateError, setScheduleDateError] = useState<string>('');
    const [scheduleTimeError, setScheduleTimeError] = useState<string>('');
    const [salaryError, setSalaryError] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<any>({});

    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    const currentDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadCommonValue();
        loadCandidateName();
        loadManager();
    }, []);
    useEffect(() => {
        validateScheduleDate();
    }, [dueDate]);

    useEffect(() => {
        validateScheduleTime();
    }, [contractPeriodFrom, contractPeriodTo]);
    useEffect(() => {
        validateBasicSalary();
    }, [basicSalary]);
    const goOfferList = () => {
        navigate('/offer-list');
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
                setLoading(false);

            });
    };
    const loadCandidateName = () => {
        CandidateService.getAllCandidate().then((response: any) => {
            const data = response.response.data;
            if (data) {
                setCandidates(data.data || []);
                candidates.forEach(element => {
                    console.log(element, "loadCandidateName");

                });
            } else {
                showAlert("Load Candidate Name Fail");

            }
        })
            .catch((error) => {
                console.log("Error:", error);
                showAlert("Load Candidate Name Fail");

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
        const errors: any = {};
        if (!candidateName) errors.candidateName = 'Candidate is required';
        if (!position) errors.position = 'Position is required';
        if (!approverBy.length) errors.approverBy = 'Approver is required';
        if (!contractType) errors.contractType = 'Contract type is required';
        if (!level) errors.level = 'Level is required';
        if (!department) errors.department = 'Department is required';
        if (!recruiterOwner.length) errors.recruiterOwner = 'Recruiter owner is required';
        if (!dueDate) errors.dueDate = 'Due date is required';
        if (!contractPeriodTo || !contractPeriodFrom) errors.contractPeriod = 'Contract period is required';
        if (!basicSalary) errors.basicSalary = 'Basic salary is required';

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            showAlert('Please fill in all required fields.');
            return;
        }
        if (scheduleDateError || scheduleTimeError || salaryError) {
            showAlert("Please fix the errors before submitting.");
            return;
        }

        const OfferData = {
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

            await OfferService.createOffer(OfferData)
            Swal.fire('Success', 'Sucessfully created offer', 'success');

            navigate('/offer-list');

        } catch (error: any) {
            console.error('Error creating offer:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
            });
        } finally {
            setLoading(false);

        }
    };
    const validateScheduleDate = () => {
        if (dueDate && dueDate < currentDate) {
            setScheduleDateError('dueDate cannot be in the past.');
        } else {
            setScheduleDateError('');
        }
    };
    const validateScheduleTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        if (contractPeriodFrom && contractPeriodFrom < tomorrowString) {
            setScheduleTimeError('ContractPeriodFrom must be from tomorrow.');
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
    const validateBasicSalary = () => {
        if (basicSalary && isNaN(basicSalary) || basicSalary < 0) {
            setSalaryError('Basic salary must be a number and >= 0');
        } else {
            setSalaryError('');
        }
    };
    const handleCandidateChange = (selectedOption: any) => {
        setCandidateName(selectedOption.value);
        const selectedCandidate = candidates.find(candidate => candidate.candidateId === selectedOption.value);
        if (selectedCandidate) {
            setPosition(selectedCandidate.position)
            setScheduleInfo(selectedCandidate.scheduleId)
            setScheduleTitles(selectedCandidate.scheduleTitle)
            setScheduleNotes(selectedCandidate.scheduleNote)
            setLevel(selectedCandidate.level)
            setRecruiterOwner(selectedCandidate.recruiterOwnerusername)
            setRecruiterOwnerFullName(selectedCandidate.recruiterOwnerFullName)
        }
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
        <div className='create-offer'>
            <LoadingOverlay isLoading={loading} />

            <Helmet>
                <title>Create Offer</title>
            </Helmet>
            <div className='backto-div'>
                <Button label=" Back to offer list" text icon="pi pi-angle-double-left" className='backto' onClick={goOfferList} />
            </div>
            <div className='bg-white p-3 candidate-form-container'>
                <div className="mb-3">
                    <div className="content-offer-form">
                        <div className="grid justify-content-between">
                            <div className="col-6 ">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Candidate" className="col-3 col-form-label">Candidate<span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name='Candidate'
                                            options={candidates.map(candidates => ({ value: candidates.candidateId, label: candidates.fullName + " (" + candidates.email + ")" }))}
                                            // onChange={(selectedOption: any) => setCandidateName(selectedOption.value)}
                                            onChange={handleCandidateChange}
                                            placeholder="Select Candidate Name"
                                        />
                                        {fieldErrors.candidateName && <small className="text-danger">{fieldErrors.candidateName}</small>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Position" className="col-3 col-form-label">Position<span className='text-danger'>*</span></label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Position'
                                            options={positions.map(position => ({ value: position, label: position }))}
                                            onChange={(selectedOption: any) => setPosition(selectedOption.value)}
                                            placeholder="Select a Position"
                                        />
                                        {fieldErrors.position && <small className="text-danger">{fieldErrors.position}</small>}
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
                                            options={approvers.map(approvers => ({ value: approvers.username, label: approvers.fullName + " (" + approvers.username + ")" }))}
                                            onChange={(selectedOption: any) => setapproverBy(selectedOption.value)}
                                            placeholder="Select An Approver"
                                        />
                                        {fieldErrors.approverBy && <small className="text-danger">{fieldErrors.approverBy}</small>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Interview Info" className="col-3 col-form-label">Interview Info </label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Interview Info'
                                            options={interviewTitles.map(interviewTitles => ({ value: interviewTitles.scheduleId, label: interviewTitles.scheduleTitle }))}
                                            onChange={handleInterviewTitleChange}
                                            // onChange={(selectedOption: any) => setScheduleInfo(selectedOption.value)}
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
                                            </div>
                                        </div>
                                        {fieldErrors.contractPeriod && <small className="text-danger">{fieldErrors.contractPeriod}</small>}
                                        <br />
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
                            </div>

                            <div className="col-5">
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Contract Type" className="col-3 col-form-label">Contract Type<span className='text-danger'>*</span></label>
                                    <div className="col-9">
                                        <Select
                                            name='Contract Type'
                                            options={contractTypes.map(contractTypes => ({ value: contractTypes, label: contractTypes }))}
                                            onChange={(selectedOption: any) => setContractType(selectedOption.value)}
                                            placeholder="Select a type of contract"
                                        />
                                        {fieldErrors.contractType && <small className="text-danger">{fieldErrors.contractType}</small>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Level " className="col-3 col-form-label">Level<span className='text-danger'>*</span></label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Level '
                                            options={levels.map(levels => ({ value: levels, label: levels }))}
                                            onChange={(selectedOption: any) => setLevel(selectedOption.value)}
                                            placeholder="Select a Level..."
                                        />
                                        {fieldErrors.level && <small className="text-danger">{fieldErrors.level}</small>}
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
                                            options={departments.map(departments => ({ value: departments, label: departments }))}
                                            onChange={(selectedOption: any) => setDepartment(selectedOption.value)}
                                            placeholder="Select a Department..."
                                        />
                                        {fieldErrors.department && <small className="text-danger">{fieldErrors.department}</small>}
                                    </div>
                                </div>
                                <div className="grid mb-3 align-items-center">
                                    <label htmlFor="Recruiter Owner" className="col-3 col-form-label">Recruiter Owner<span className='text-danger'>*</span></label>
                                    {/* <div className="col-9">
                                        <Select
                                            name='Recruiter Owner'
                                            options={recruiterOwners.map(recruiterOwners => ({ value: recruiterOwners.username, label: recruiterOwners.fullName + " (" + recruiterOwners.username + ")" }))}
                                            onChange={(selectedOption: any) => setRecruiterOwner(selectedOption.value)}
                                            placeholder="Select recruiter owner..."
                                            styles={customStyles}
                                        />
                                        {fieldErrors.recruiterOwner && <small className="text-danger">{fieldErrors.recruiterOwner}</small>}
                                    </div> */}
                                    <div className="col-9" style={{ wordWrap: 'break-word' }}>
                                        <p> </p>
                                        <p>{recruiterOwnerFullName + " (" + recruiterOwner + ")"}</p>
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
                                        {fieldErrors.dueDate && <small className="text-danger">{fieldErrors.dueDate}</small>}
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
                                        {fieldErrors.basicSalary && <small className="text-danger">{fieldErrors.basicSalary}</small>}
                                        {salaryError && <small className="p-error">{salaryError}</small>}

                                    </div>
                                </div>
                                <div className="grid mb-3">
                                    <label htmlFor="Dua date" className="col-3 col-form-label">Note </label>
                                    <div className="col-9">
                                        <InputTextarea
                                            className='w-100'
                                            id="address"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Type a Notes"
                                            rows={5}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="">
                            <div className="flex justify-content-center">
                                <Button label='Submit' className='mr-3' severity='secondary' onClick={handleSubmit} />
                                <Button label='Cancel' className='' severity='secondary' onClick={goOfferList} />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >

    );
};

export default CreateNewOffer;