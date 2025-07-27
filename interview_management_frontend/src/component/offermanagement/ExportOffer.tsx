import React, { useEffect, useState } from 'react';
import './ExportOffer.css';
import { Modal } from 'antd';
import { OfferService } from '../../services';
import Swal from 'sweetalert2';
import LoadingOverlay from '../../utils/LoadingOverlay';

const ExportOffers = ({ modalExportOpen, setModalExportOpen }: any) => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [scheduleTimeError, setScheduleTimeError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {

        validateScheduleTime();

    }, [fromDate, toDate]);


    const handleSubmit = () => {
        if (!fromDate || !toDate) {
            Swal.fire({
                title: 'Error',
                text: 'Please select time.',
                icon: 'error',
            });
            return;
        }
        if (scheduleTimeError) {
            Swal.fire({
                title: 'Error',
                text: 'Please fix the errors before submitting.',
                icon: 'error',
            });
            return;
        }
        console.log("fromDate", fromDate)
        setLoading(true);

        OfferService.exportOffers(fromDate, toDate)
            .then((response: any) => {
                console.log("res", response);
                const data = response.response.data
                if (data.size != 64) {
                    setModalExportOpen(false);
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
                setLoading(false);

            });

    };
    const validateScheduleTime = () => {
        if (fromDate && toDate && fromDate > toDate) {
            setScheduleTimeError('toDate time must be before toDate.');
        } else {
            setScheduleTimeError('');
        }
    };
    return (
        <>

            <Modal
                centered
                open={modalExportOpen}
                onCancel={() => setModalExportOpen(false)}
                footer={null}
            >
                <div className="popup">
                    <div className="popup-inner">
                        <LoadingOverlay isLoading={loading} />

                        <h2 className="mb-5">Export offer</h2>
                        <div className="date-inputs">
                            <label>
                                From
                                <input
                                    className="ml-2 mr-3"
                                    type="date"
                                    value={fromDate}
                                    onChange={(selectedOption: any) => setFromDate(selectedOption.target.value)}
                                />
                            </label>
                            <label>
                                To
                                <input
                                    className="ml-2"
                                    type="date"
                                    value={toDate}
                                    onChange={(selectedOption: any) => setToDate(selectedOption.target.value)}
                                />
                            </label>

                        </div>
                        <div className="flex justify-content-center mb-4 ">
                            {scheduleTimeError && <big className="p-error">{scheduleTimeError}</big>}
                        </div>
                        <div className="popup-buttons">
                            <button className="popup-buttons-button" onClick={handleSubmit}>Submit</button>
                            <button className="popup-buttons-button" onClick={() => setModalExportOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ExportOffers;
