
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from 'primereact/button';
import '../offermanagement/offer-details.css';
import OfferService from '../../services/offer';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { JwtPayLoad } from '../Header';
import { jwtDecode } from 'jwt-decode';
import LoadingOverlay from '../../utils/LoadingOverlay';
import { Skeleton } from 'primereact/skeleton';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import Select from 'react-select';
import CommonValueService from '../../services/commonValue';
import AuthService from '../../services/auth';

const OfferDetail = ({ offerDetailOpen, setofferDetailOpen, id, refreshList }: any) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [offerDetail, setofferDetail] = useState<any>(null);
    const { offerId } = useParams<{ offerId: string }>();
    const [searchParams] = useSearchParams();
    const [role, setRole] = React.useState("");
    const [username, setusername] = React.useState("");

    const [status, setStatus] = React.useState("");
    const [reasonReject, setReasonReject] = useState<any>();
    const [reasonRejects, setReasonRejects] = useState<any[]>([]);

    const [createAt, setCreateAt] = React.useState("");
    const [updatedAt, setUpdatedAt] = React.useState("");

    const [modalReasonOpen, setModalReasonOpen] = useState(false);

    const [comments, setComments] = useState<string>('');

    const location = useLocation();

    const navigate = useNavigate();
    const goOfferList = () => {
        navigate('/offer-list');
    };

    const handleEdit = () => {

        if (offerId) {
            navigate(`/edit-offer/${offerId}`, { state: { from: window.location.pathname } });
        }
    };
    try {
        id = parseInt(offerId + '');
        if (Number.isNaN(id)) {
            id = 0;
        }
    } catch (error) {
        id = 0;
        console.log(error);
    }
    const viewOfferDeatil = (offerId: number) => {
        setLoading(true);
        OfferService.viewOfferDeatil(id).then((response: any) => {
            console.log(response, "res");
            const data = response.data;
            if (data) {
                setofferDetail(data || []);
                setStatus(data.status)
                setCreateAt(new Date(data.createAt).toLocaleDateString("en-GB"))
                setUpdatedAt(new Date(data.updateAt).toLocaleDateString("en-GB"))
            } else {
                navigate("/404-not-found")
            }
        })
            .catch((error) => {
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
                setReasonRejects(data["Reason reject offer"] || []);
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
    useEffect(() => {

        setRole(AuthService.getUserRole());
        setusername(AuthService.getusername());

    }, [navigate]);
    useEffect(() => {
        loadCommonValue();
    }, []);
    useEffect(() => {
        viewOfferDeatil(id);
    }, [id]);
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    const handleSubmitReason = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reasonReject) {
            sweetAlert('Please select a reason for rejection.');
            return;
        } else {
            handleRejectStatus(offerDetail.offerId)
        }
    }
    const handleWattingForApproveStatus = (offerId: number) => {
        // setLoading(true);
        window.location.reload();

        OfferService.updateStatus(offerId, "Waiting for approval").then((response: any) => {
            console.log(response, "res");
            const data = response.response.data;
            if (data) {
                setofferDetail(data.data || []);
            } else {
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            })
            .finally(() => {

                // setLoading(false);
            });
    }
    const handleApproveStatus = (offerId: number) => {
        // setLoading(true);
        window.location.reload();

        OfferService.updateStatus(offerId, "Approved").then((response: any) => {
            console.log(response, "res");
            const data = response.response.data;
            if (data) {
                setofferDetail(data.data || []);
            } else {
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            })
            .finally(() => {

                // setLoading(false);
            });
    }
    const handleRejectStatus = (offerId: number) => {
        window.location.reload();
        OfferService.rejectOffer(offerId, (reasonReject == 'Other' ? comments : reasonReject)).then((response: any) => {
            console.log(response, "res");
            const data = response.response.data;
            if (data) {
                setofferDetail(data.data || []);
            } else {
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            })
            .finally(() => {

            });
    }
    const handleCancelStatus = (offerId: number) => {

        Swal.fire({
            title: "Are you sure you want to cancel this offer?",
            icon: "warning",
            confirmButtonText: "Yes",
            showCancelButton: true,
            cancelButtonText: "No",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
                OfferService.updateStatus(offerId, "Cancelled").then((response: any) => {
                    console.log(response, "res");
                    const data = response.response.data;
                    if (data) {
                        setofferDetail(data.data || []);
                    } else {
                        Swal.fire({
                            title: "Load Data Fail",
                            icon: "error",
                            text: "Please try later.",
                            confirmButtonText: "Close",
                        });
                    }
                })
                    .catch((error) => {
                        console.log("Error:", error);
                        Swal.fire({
                            title: "Load Data Fail",
                            icon: "error",
                            text: "Please try later.",
                            confirmButtonText: "Close",
                        });
                    })
                    .finally(() => {

                    });
            }
        });
    }
    const handleMarkAsSentStatus = (offerId: number) => {
        // setLoading(true);
        window.location.reload();

        OfferService.updateStatus(offerId, "Waiting for response").then((response: any) => {
            console.log(response, "res");
            const data = response.response.data;
            if (data) {
                setofferDetail(data.data || []);
            } else {
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            })
            .finally(() => {

                // setLoading(false);
                // window.location.reload();

            });
    }
    const handleAcceptStatus = (offerId: number) => {
        window.location.reload();

        OfferService.updateStatus(offerId, "Accepted").then((response: any) => {
            console.log(response, "res");
            const data = response.response.data;
            if (data) {
                setofferDetail(data.data || []);
            } else {
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            })
            .finally(() => {

            });
    }
    const handleDeclineStatus = (offerId: number) => {
        window.location.reload();

        OfferService.updateStatus(offerId, "Declined").then((response: any) => {
            console.log(response, "res");
            const data = response.response.data;
            if (data) {
                setofferDetail(data.data || []);
            } else {
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                Swal.fire({
                    title: "Load Data Fail",
                    icon: "error",
                    text: "Please try later.",
                    confirmButtonText: "Close",
                });
            })
            .finally(() => {

            });
    }
    const renderButtons = () => {
        if (status === "Waiting for approval") {
            return (
                <>
                    {(role === "ADMIN" || (role === "MANAGER" && offerDetail.approverUsername == username)) && (
                        <>
                            <Button label="Approve" severity="success" className="approve-offer-button mr-2" onClick={() => handleApproveStatus(offerDetail.offerId)} />
                            <Button label="Reject" severity="secondary" className="reject-offer-button mr-2" onClick={() => setModalReasonOpen(true)} />
                        </>
                    )}
                    {((role === "RECRUITER" && offerDetail.recruiterOwner == username) || (role === "MANAGER" && offerDetail.approverUsername == username) || role === "ADMIN") && (
                        <>
                            <Button label="Cancel Offer" severity="danger" className="cancel-offer-button mr-0" onClick={() => handleCancelStatus(offerDetail.offerId)} />
                        </>
                    )}

                </>
            );
        } else if (status === "Approved") {
            return (
                <>
                    {((role === "RECRUITER" && offerDetail.recruiterOwner == username) || (role === "MANAGER" && offerDetail.approverUsername == username) || role === "ADMIN") && (
                        <>
                            <Button label="Mark as sent to candidate" severity="info" className="mark-as-sent-button mr-2" onClick={() => handleMarkAsSentStatus(offerDetail.offerId)} />
                            <Button label="Cancel Offer" severity="danger" className="cancel-offer-button mr-0" onClick={() => handleCancelStatus(offerDetail.offerId)} />
                        </>
                    )}
                </>
            );
        } else if (status === "Waiting for response") {
            return (
                <>
                    {((role === "RECRUITER" && offerDetail.recruiterOwner == username) || (role === "MANAGER" && offerDetail.approverUsername == username) || role === "ADMIN") && (
                        <>
                            <Button label="Accepted Offer" severity="info" className="accept-offer-button mr-2" onClick={() => handleAcceptStatus(offerDetail.offerId)} />
                            <Button label="Declined Offer" severity="warning" className="decline-offer-button mr-2" onClick={() => handleDeclineStatus(offerDetail.offerId)} />
                            <Button label="Cancel Offer" severity="danger" className="cancel-offer-button mr-0" onClick={() => handleCancelStatus(offerDetail.offerId)} />
                        </>
                    )}
                </>
            );
        } else if (status === "Accepted") {
            return (
                <>
                    {((role === "RECRUITER" && offerDetail.recruiterOwner == username) || (role === "MANAGER" && offerDetail.approverUsername == username) || role === "ADMIN") && (
                        <Button label="Cancel Offer" severity="danger" className="cancel-offer-button mr-0" onClick={() => handleCancelStatus(offerDetail.offerId)} />
                    )}
                </>
            );
        } else if (status === "Rejected" || status === "Declined Offer" || status === "Cancelled") {
            return null;
        }
    };
    const renderButton2 = () => {
        if (status === "Waiting for approval") {
            console.log(role)

            return (
                <>
                    {((role === "RECRUITER" && offerDetail.recruiterOwner === username) || (role === "MANAGER" && offerDetail.approverUsername === username) || role === "ADMIN") && (
                        <>
                            <Button label='Edit' className='mr-2' severity='secondary' onClick={handleEdit} />
                        </>
                    )}
                </>
            );
        }
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
        <div>
            <LoadingOverlay isLoading={loading} />
            <div className="offer-detail-container">
                <Helmet>
                    <title>Detail Offer</title>
                </Helmet>
                <Dialog
                    visible={modalReasonOpen}
                    modal
                    onHide={() => { if (!modalReasonOpen) return; setModalReasonOpen(false); }}
                    content={({ hide }) => (
                        <div className='reject-offer-form' style={{ width: '600px', maxHeight: '700px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Reject Offer</h2>
                            <form onSubmit={handleSubmitReason}>
                                <div className='field mb-3' style={{ marginBottom: '15px' }}>
                                    <label htmlFor='reason' className='form-label' style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reason for Rejection<span className='text-danger'>*</span></label>
                                    <Select
                                        id='reason'
                                        options={reasonRejects.map(reasonReject => ({ value: reasonReject, label: reasonReject }))}
                                        onChange={(selectedOption: any) => setReasonReject(selectedOption.value)}
                                        placeholder="Select a reason..."
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderRadius: '4px',
                                                borderColor: '#ced4da',
                                            }),
                                        }}
                                    />
                                </div>
                                {reasonReject && reasonReject === 'Other' ? (
                                    <div className='field mb-3' style={{ marginBottom: '15px' }}>
                                        <label htmlFor='comments' className='form-label' style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Additional Comments</label>
                                        <InputTextarea
                                            id='comments'
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            rows={5}
                                            className='w-full'
                                            required
                                            placeholder='Type any additional comments here...'
                                            style={{ maxWidth: '100%', maxHeight: '300px', minHeight: '50px', borderRadius: '4px', borderColor: '#ced4da' }}
                                        />
                                    </div>
                                ) : ""}
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10%' }}>
                                    <Button label='Submit' type='submit' className='mr-2' severity='secondary' style={{ marginRight: '10px' }} />
                                    <Button label='Cancel' type='button' className='' onClick={(e) => hide(e)} severity='secondary' />
                                </div>
                            </form>
                        </div>
                    )}
                ></Dialog>
                <div className='flex justify-content-between align-items-center'>
                    <div className='backto-div'>
                        <Button label=" Back to offer list" text icon="pi pi-angle-double-left" className='backto' onClick={goOfferList} />
                    </div>
                    <div className="offer-details-header">
                        {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                            <div className="offer-detail-actions my-2 mr-0">
                                {renderButtons()}
                            </div>
                        }
                    </div>
                </div>

                <div className="offer-details-board">
                    <div className="offer-detail-value">
                        {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                            <div className='flex justify-content-end mb-3'>
                                <span className='create-update-date text-sm text-500 font-italic'>
                                    Created on{" "}
                                    {createAt === new Date().toLocaleDateString("en-GB")
                                        ? "today"
                                        : createAt}
                                    , last update by {offerDetail.updateBy}{" "}
                                    {updatedAt === new Date().toLocaleDateString("en-GB")
                                        ? "today"
                                        : updatedAt}
                                </span>
                            </div>
                        }
                        <div className="offer-details">
                            <div className="offer-detail left-column">
                                <div className='grid'>

                                    <strong className='col-3'>Candidate:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :
                                        <span className='col-9'>{offerDetail.candidateName}</span>
                                    }
                                </div>

                                <div className='grid'>
                                    <strong className='col-3'>Position:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.position}</span>

                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Approver:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.approver}({offerDetail.approverUsername})
                                        </span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Interview Info:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>Interview {offerDetail.interviewInfoTitle ? offerDetail.interviewInfoTitle : "N/A"}<br />
                                        </span>
                                    }
                                    <strong className='col-3'></strong>
                                    {loading ? <Skeleton width="80%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :
                                        <span className='col-9'>Interviewer: {(offerDetail.interviewInfoName ? offerDetail.interviewInfoName.join(", ") : "N/A")}
                                        </span>
                                    }

                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Contract Period:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>
                                            From: {offerDetail.contractPeriodFrom} &nbsp; To: {offerDetail.contractPeriodTo}
                                        </span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Interview Notes:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>
                                            {offerDetail.interviewNotes ? offerDetail.interviewNotes : "N/A"}
                                        </span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Status:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.status}</span>
                                    }
                                </div>


                            </div>
                            <div className="offer-detail right-column">
                                <div className='grid'>
                                    <strong className='col-3'>Contract Type:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.contractType}</span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Level:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.level}</span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Department:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.department}</span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Recruiter Owner:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.recruiterOwner}</span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Due Date:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.dueDate}</span>
                                    }
                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Basic Salary:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{formatCurrency(offerDetail.basicSalary)}</span>
                                    }

                                </div>


                                <div className='grid'>
                                    <strong className='col-3'>Note:</strong>
                                    {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                        <span className='col-9'>{offerDetail.note ? offerDetail.note : "N/A"}</span>
                                    }
                                </div>
                                {status == "Rejected" ? (
                                    <div className='grid'>
                                        <strong className='col-3'>Reason Reject:</strong>
                                        {loading ? <Skeleton width="50%" height="28px" borderRadius="16px" className='mb-3' ></Skeleton> :

                                            <span className='col-9'>{offerDetail.reasonReject}</span>
                                        }
                                    </div>
                                ) : ""}

                            </div>
                        </div>
                        <div className="offer-actions">
                            {renderButton2()}
                            <Button label='Cancel' severity='secondary' onClick={goOfferList} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default OfferDetail;