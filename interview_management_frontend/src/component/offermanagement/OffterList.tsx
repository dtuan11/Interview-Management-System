import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';          // core css
import 'primeicons/primeicons.css';                        // icons
import 'primeflex/primeflex.css';
import '../candidatemanagement/CandidateList.css'
import { Helmet } from 'react-helmet';
import { Button } from 'primereact/button';
import Select from 'react-select';
import OfferService from '../../services/offer';
import { Paginator } from 'primereact/paginator';
import CommonValueService from '../../services/commonValue';
import ExportOffers from './ExportOffer';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import LoadingOverlay from '../../utils/LoadingOverlay';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { jwtDecode } from 'jwt-decode';
import { JwtPayLoad } from '../Header';


const OfferList: React.FC = () => {
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [offerList, setOfferList] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");
    const [department, setDepartment] = useState("");

    const [statuss, setStatuss] = useState<any[]>([]);
    const [statusSelected, setStatusSelected] = useState<any>();
    const [departmentSelected, setDepartmentSelected] = useState<any>();
    const [role, setRole] = React.useState("");
    const [username, setusername] = React.useState("");

    const [departments, setDepartments] = useState<any[]>([]);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const [modalExportOpen, setModalExportOpen] = useState(false);

    const rowsPerPage = 10;

    const navigate = useNavigate();
    const goToAddNewOffer = () => {
        navigate('/create-new-offer');
    };
    useEffect(() => {
        loadCommonValue();
    }, []);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login");
            return;
        } else {
            try {
                const decodedToken = jwtDecode(token) as JwtPayLoad;
                setRole(decodedToken.role.join(', '));
                setusername(decodedToken.sub)
            } catch (error) {
                console.error('Invalid token', error);
                navigate("/login");
            }
        }
    }, [navigate]);
    const search = () => {
        setLoadingVisible(true);
        OfferService.search(
            pageNumber,
            keyword,
            department,
            status
        ).then((response: any) => {
            console.log(response, "res");
            const data = response.response.data.data;
            if (data) {
                setOfferList(data.data || []);
                setPageNumber(data.pageIndex || 0);
                setTotalPage(data.total || 0);
            } else {
                showAlert("Load Data Fail");
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                showAlert("Load Data Fail");
            })
            .finally(() => {
                setLoadingVisible(false);

            });
    };
    const loadCommonValue = () => {
        setLoadingOptions(true);

        CommonValueService.getCommonValue().then((response: any) => {
            const data = response.response.data.data;
            if (data) {
                const statusWithAllOption = [{ label: "All Status", value: "" }, ...data["Offer status"].map((status: any) => ({ label: status, value: status }))];
                setStatuss(statusWithAllOption || []);
                setStatusSelected({ value: "", label: "All Status" })
                const departmentWithAllOption = [{ label: "All Department", value: "" }, ...data.Department.map((department: any) => ({ label: department, value: department }))];
                setDepartments(departmentWithAllOption || []);
                setDepartmentSelected({ value: "", label: "All Departments" })
            } else {
                showAlert("Load Data loadCommonValue Fail");
            }
        })
            .catch((error) => {
                console.log("Error:", error);
                showAlert("Load Data loadCommonValue Fail");
            })
            .finally(() => {
                setLoadingOptions(false);

            });
    };
    useEffect(() => {
        search();
    }, [pageNumber,
        department,
        status]);

    const handleSearch = () => {
        search();
    };
    const handleTextSearch = () => {
        const searchInput = document.getElementById(
            "offer-searching"
        ) as HTMLInputElement;
        setKeyword(searchInput.value.trim());
    };

    const handleEdit = (offerId: number) => {
        if (offerId) {
            navigate(`/edit-offer/${offerId}`, { state: { from: window.location.pathname } });
        }
    };

    const handleViewDetail = (offerId: number) => {
        navigate(`/offer-detail/${offerId}`)
    };
    const onPageChange = (event: any) => {
        setPageNumber(event.page);
    };
    const notesBodyTemplate = (rowData: any) => {
        return rowData.notes ? rowData.notes : 'N/A';
    };
    const showAlert = (title: string) => {
        Swal.fire({
            title,
            icon: "error",
            text: "Please try later.",
            confirmButtonText: "Close",
        });
    };
    // const renderButton2 = () => {
    //     if (status === "Waiting for approval") {
    //         return (
    //             <>
    //                 {((role === "RECRUITER" && offerList.approver == username) || (role === "MANAGER" && offerDetail.approverUsername == username) || role === "ADMIN") && (
    //                     <>
    //                         <Button label='Edit' className='mr-2' severity='secondary' onClick={handleEdit} />
    //                     </>
    //                 )}
    //             </>
    //         );
    //     }
    // };
    return (

        <div className="offer-list">
            <Helmet>
                <title>Offer List</title>
            </Helmet>
            <ExportOffers
                modalExportOpen={modalExportOpen}
                setModalExportOpen={setModalExportOpen}
            />
            <div className="tab-content">
                <div className=" p-5">
                    <div className="flex justify-content-start">
                        <div className=''>
                            {loadingOptions ? <Skeleton width="222px" height="41px" className='mr-2'></Skeleton> :
                                <IconField iconPosition="right" className='mr-2' >
                                    <InputIcon className="pi pi-search" />
                                    <InputText
                                        placeholder="Enter something ..."
                                        id="offer-searching"
                                        onChange={handleTextSearch} />
                                </IconField>
                            }
                        </div>

                        <div className='mr-2'>
                            {loadingOptions ? <Skeleton width="210px" height="41px"></Skeleton>
                                :
                                <Select
                                    name='Department'
                                    value={departmentSelected}
                                    options={departments}
                                    onChange={(selectedOption: any) => {
                                        setDepartmentSelected(selectedOption)
                                        setDepartment(selectedOption.value)
                                    }}
                                    // placeholder="Select a Department....."
                                    isSearchable={false}
                                />
                            }

                        </div>
                        <div className='mr-2'>
                            {loadingOptions ? <Skeleton width="210px" height="41px"></Skeleton> :
                                <Select
                                    name='Status'
                                    value={statusSelected}
                                    options={statuss}
                                    onChange={(selectedOption: any) => {
                                        setStatusSelected(selectedOption)
                                        setStatus(selectedOption.value)
                                    }}
                                    // placeholder="Select a Status....."
                                    isSearchable={false}
                                />
                            }
                        </div>
                        <div className=''>
                            <Button label="Search" severity="secondary" className='' onClick={handleSearch} />

                        </div>
                    </div>
                    <div className='flex justify-content-end'>
                        <Button className='mr-2' label="Add New Offer" severity="secondary" size="large" onClick={goToAddNewOffer} />
                        <Button className='mr-0' label="Export Offer" size="large" severity="secondary" onClick={() => setModalExportOpen(true)} />
                    </div>
                    <div>
                        <div className="mt-3 mb-3">
                            {loadingVisible ? (
                                <div className='loading-container-all'>
                                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="5" fill="var(--surface-ground)" animationDuration=".8s" />
                                </div>
                            ) : (
                                <div className="">
                                    <>
                                        <DataTable className='' value={offerList} showGridlines
                                            tableStyle={{ minWidth: '70rem' }}
                                            emptyMessage="No item matches with your search data. Please try again">
                                            {/* <Column field="offerId" /> */}
                                            <Column field="candidateName" header="Candidate Name" />
                                            <Column field="email" header="Email" />
                                            <Column field="approvedBy" header="Approver" />
                                            <Column field="department" header="Department" />
                                            <Column field="notes" header="Notes" body={notesBodyTemplate} />
                                            <Column field="status" header="Status" />
                                            <Column
                                                header="Action"
                                                body={(rowData) => (
                                                    <div className="main__table-btns text-center">
                                                        <Button icon="pi pi-eye" tooltip="View"
                                                            tooltipOptions={{ position: 'bottom' }}
                                                            text onClick={() => handleViewDetail(rowData.offerId)} />
                                                        {(rowData.status === "Waiting for approval")
                                                            // &&
                                                            //     (role === "ADMIN" ||
                                                            //         (role === "MANAGER" && rowData.approverUsername === username) ||
                                                            //         (role === "RECRUITER" && rowData.recruiterOwner === username)) 
                                                            && (
                                                                <Button icon="pi pi-pen-to-square" tooltip="Edit"
                                                                    tooltipOptions={{ position: 'bottom' }}
                                                                    severity="secondary" text onClick={() => handleEdit(rowData.offerId)} />
                                                            )}
                                                    </div>
                                                )}
                                            />
                                        </DataTable>
                                        <Paginator
                                            first={pageNumber * rowsPerPage}
                                            rows={rowsPerPage}
                                            totalRecords={totalPage}
                                            onPageChange={onPageChange}
                                        />
                                    </>
                                </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferList;