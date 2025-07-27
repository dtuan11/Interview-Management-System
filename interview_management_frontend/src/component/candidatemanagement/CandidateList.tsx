import React, { useState, useEffect, useRef, useCallback, ChangeEvent, memo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';          // core css
import 'primeicons/primeicons.css';                        // icons
import 'primeflex/primeflex.css';
import './CandidateList.css';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Helmet } from 'react-helmet';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { useDebounce } from '../../utils/hooks';
import Select, { MultiValue, SingleValue } from 'react-select';
import CommonValueService, { COMMON_VALUE_NAMES } from '../../services/commonValue';
import { JwtPayLoad } from '../Header';
import { jwtDecode } from 'jwt-decode';
import CandidateService from '../../services/candidateService';
// import { useLoading } from '../../utils/LoadingContext';
import LoadingOverlay from '../../utils/LoadingOverlay';
import { Skeleton } from 'primereact/skeleton';
import { ProgressSpinner } from 'primereact/progressspinner';
import axiosInstance from '../../services/axios';

const CandidateList: React.FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [statusSelected, setStatusSelected] = useState<any>({ value: "", label: "All Status" });
  const [role, setRole] = React.useState("");
  const [candidateList, setCandidateList] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [updaterId, setUpdaterId] = useState<number>(0);
  const [candidateStatusOptions, setCandidateStatusOptions] = useState<any[]>([]);
  const navigate = useNavigate();
  const debounceSearch = useDebounce(keyword, 1000);
  const rowsPerPage = 10;
  const isOnlyInterviewerRole = role === COMMON_VALUE_NAMES.ROLE_INTERVIEWER;
  // const { setLoading } = useLoading();
  // const firstRender = useRef(false);
  const fetchOptionsRef = useRef(false);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setLoadingVisible(true);

      const decodedToken = jwtDecode(token) as JwtPayLoad;
      setRole(decodedToken.role.join(', '));
      setUpdaterId(decodedToken.userId);

    } catch (error) {
      console.error('Invalid token', error);
      navigate("/login");
    } finally {
      setLoadingVisible(false);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCandidateData = async () => {
      await loadCandidateData(currentPage, keyword, status);
    };
    fetchCandidateData();
  }, [currentPage]);

  const fetchOptions = useCallback(async (name: string, beginIndex: number, endIndex: number, setState: React.Dispatch<React.SetStateAction<any[]>>) => {
    setLoadingOptions(true);
    try {
      const options = await CommonValueService.getAllCommonValueByName(name, beginIndex, endIndex);
      const updatedOptions = [{ value: "", label: "All Status" }, ...options];
      setState(updatedOptions);
      setStatusSelected({ value: "", label: "All Status" });
    } catch (error) {
      console.error(`Error fetching ${name} options:`, error);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchOptionsRef.current) {
      fetchOptionsRef.current = true;
      const fetchAllOptions = async () => {
        await fetchOptions(COMMON_VALUE_NAMES.CANDIDATE_STATUS.toString(), 0, 0, setCandidateStatusOptions);
      }
      fetchAllOptions();
    }
  }, [fetchOptions]);

  const loadCandidateData = useCallback(async (page: number, keyword: string, status: string) => {
    setLoadingVisible(true);
    await axiosInstance
      .get("/api/candidate/get-all-candidate", {
        params: {
          pageNumber: page - 1,
          keyword: keyword,
          status: status,
        },
      })
      .then((response) => {

        const data = response.data.data;
        console.log(data);
        if (data) {
          setCandidateList(data.candidateList || []);
          setPageNumber(data.pageNumber || 0);
          setTotalPage(data.totalPage || 0);
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
        setLoadingVisible(false);
      });
  }, []);

  const handleSelectChange = useCallback((selectedOption: any) => {
    setStatusSelected(selectedOption);
    setStatus(selectedOption.value);
  }, []);

  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleSearchClick = () => {
    setPageNumber(0); // Reset to the first page
    loadCandidateData(1, keyword, status);
  };

  const handleViewDetail = (candidateId: number) => {
    if (candidateId) {
      window.location.href = `/candidate-information?candidateId=${candidateId}`;
    }
  };

  const handleEdit = (candidateId: number) => {
    if (candidateId) {
      navigate(`/edit-candidate?candidateId=${candidateId}`, { state: { from: window.location.pathname } });
    }
  };

  const onPageChange = (event: { first: number, rows: number }) => {
    setCurrentPage(event.first / event.rows + 1);
  };


  return (
    <>
      <div className="container-custom candidate-list">
        {/* <LoadingOverlay isLoading={loadingVisible} /> */}

        <Helmet>
          <title>Candidate List</title>
        </Helmet>

        <div className="tab-content">
          <div className="p-5">
            <div className="flex justify-content-between">
              <div className="flex justify-content-start">
                <div>
                  <div> {loadingOptions ? <Skeleton width="222px" height="41px" className='mr-2'></Skeleton> :
                    <IconField iconPosition="right" className='mr-2' >

                      <InputIcon className="pi pi-search" />
                      <InputText
                        placeholder="Enter something ..."
                        id="candidate-searching"
                        onChange={handleKeywordChange} />
                    </IconField>
                  }

                  </div>
                </div>
                <div>
                  {loadingOptions ? <Skeleton width="210px" height="41px" ></Skeleton> :
                    <Select
                      name="candidateStatus"
                      id="candidate-status"
                      value={statusSelected}
                      options={candidateStatusOptions}
                      onChange={handleSelectChange}
                      placeholder='Select a status'
                      isSearchable={false}
                    />
                  }

                </div>

                <div>
                  <Button label="Search" severity="secondary" className='ml-2'  onClick={handleSearchClick} />
                </div>

              </div>
              <div className="">
                {!isOnlyInterviewerRole &&
                  <Button label="Add new candidate" severity='secondary' className='mr-0' onClick={() => navigate('/create-new-candidate')} />
                }

              </div>
            </div>
            <div className="mt-3 mb-3">
              {loadingVisible ? (
                <div className='loading-container-all'>
                  <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="5" fill="var(--surface-ground)" animationDuration=".8s" />
                </div>
              ) : (
                <div className="">
                  <DataTable className='' value={candidateList} showGridlines tableStyle={{ minWidth: '50rem' }}

                    // paginator first={(currentPage - 1) * rowsPerPage} rows={rowsPerPage} totalRecords={totalPage * rowsPerPage} onPage={onPageChange}
                    emptyMessage='No item matches with your search data. Please try again.'>
                    {/* <Column field="candidateId" header="ID" /> */}
                    <Column field="fullName" header="Full Name" />
                    <Column field="email" header="Email" />
                    <Column
                      field="phoneNumber"
                      header="Phone No."
                      body={(rowData) => rowData.phoneNumber ? rowData.phoneNumber : 'N/A'}
                    />
                    <Column field="position" header="Current Position" />
                    <Column field="recruiterDTO.username" header="Owner HR" />
                    <Column field="candidateStatus" header="Status" />
                    <Column
                      header="Action"
                      className='action-column'
                      body={(rowData) => (
                        <div className="main__table-btns">
                          <Button
                            icon="pi pi-eye"
                            tooltip="View"
                            tooltipOptions={{ position: 'bottom' }}
                            text
                            onClick={() => handleViewDetail(rowData.candidateId)}
                          />

                          {
                            (!isOnlyInterviewerRole) &&
                            <>
                              <Button
                                icon="pi pi-pen-to-square"
                                severity="secondary"
                                text
                                tooltip="Edit"
                                tooltipOptions={{ position: 'bottom' }}
                                onClick={() => handleEdit(rowData.candidateId)}
                              />

                              {rowData.candidateStatus === 'Open' && (
                                <Button
                                  icon="pi pi-trash"
                                  severity="danger"
                                  text
                                  tooltip="Delete"
                                  tooltipOptions={{ position: 'bottom' }}
                                  onClick={() => CandidateService.deleteById(rowData.candidateId, updaterId)}
                                />
                              )}

                            </>

                          }
                        </div>
                      )}
                    />
                  </DataTable>
                  <Paginator first={(currentPage - 1) * rowsPerPage} rows={rowsPerPage} totalRecords={totalPage * rowsPerPage} onPageChange={onPageChange} />
                </div>)}
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default memo(CandidateList);