import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import UserService from '../../services/user';
import RoleService from '../../services/role';
import { useDebounce } from '../../utils/hooks';
import { UserModel } from './UserMode';
import { Button } from 'primereact/button';
import Select from 'react-select';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [roles, setRoles] = useState<{ label: string, value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchRole, setSearchRole] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{ userId: number; roles: string[] } | null>(null);
  const navigate = useNavigate();
  const debounceSearch = useDebounce(searchInput, 1000);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingOptions(true);
        const response = await RoleService.getAllRoles();
        const allRoles = response.data.map((role: { roleID: number, roleName: string }) => ({
          label: role.roleName,
          value: role.roleName
        }));
        // Add an option for all roles
        allRoles.unshift({ label: 'All Roles', value: '' });
        setRoles(allRoles);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    // Fetch current user info from token
    const user = UserService.getCurrentUserFromToken();
    setCurrentUser(user);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { users, totalPages, error } = await UserService.fetchUserList(currentPage, debounceSearch, searchRole);

      if (error) {
        setError(error);

        if (error === 'No token found, please log in again.') {
          navigate('/login');
        }
      } else {
        setUsers(users);
        setTotalPages(totalPages);
      }

      setLoading(false);
    };

    fetchData();
  }, [currentPage, debounceSearch, searchRole, navigate]);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchRoleChange = (selectedOption: any) => {
    setSearchRole(selectedOption.value);
    setCurrentPage(1);
  };

  const onPageChange = (event: { first: number, rows: number }) => {
    setCurrentPage(event.first / event.rows + 1);
  };

  const actionBodyTemplate = (rowData: UserModel) => {
    const isAdmin = currentUser && Array.isArray(currentUser.roles) && currentUser.roles.includes('ADMIN');
    const rowIsAdmin = Array.isArray(rowData.roles) && rowData.roles.includes('ADMIN');

    return (
      <div className="main__table-btns text-center">
        <Button className="btn btn-link" tooltip="View" tooltipOptions={{ position: 'bottom' }}>
          <Link to={`user/${rowData.id}`}>
            <i className="pi pi-eye"></i>
          </Link>
        </Button>
        {(!rowIsAdmin || !isAdmin) && (
        <Button className="btn btn-link" tooltip="Edit" severity="secondary" tooltipOptions={{ position: 'bottom' }}>
          <Link to={`update-user/${rowData.id}`}>
            <i className="pi pi-pen-to-square text-secondary"></i>
          </Link>
        </Button>
      )}
      </div>
    );
  };

  return (
    <div className="user-list">
      <Helmet>
        <title>User List</title>
      </Helmet>
      <div className="tab-content">
        <div className="p-5">
          <div className="d-flex justify-content-between">
            <div className="d-flex ">
              <div>
                {loadingOptions ? <Skeleton width="222px" height="41px" className=''></Skeleton> :
                  <IconField iconPosition="right" >
                    <InputIcon className="pi pi-search" />
                    <InputText
                      placeholder="Enter something ..."
                      value={searchInput}
                      onChange={handleSearchInput}
                      maxLength={30} />
                  </IconField>
                }
              </div>
              <div className='ml-2'>
                {loadingOptions ? <Skeleton width="160px" height="41px" className=''></Skeleton> :
                  <Select
                    value={roles.find(role => role.value === searchRole)}
                    onChange={handleSearchRoleChange}
                    options={roles}
                    placeholder="Select a Role"
                    isSearchable={false}
                  />
                }
              </div>
              <div>
                <Button label="Search" severity="secondary" className='ml-2' />
              </div>
            </div>
            <div>
              <NavLink to={'/create-user'}>
                <Button label="Add new User" className='mr-0' severity='secondary' />
              </NavLink>
            </div>
          </div>
          <div className="mt-3 mb-3">
            {loading ? (
              <div className='loading-container-all'>
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="5" fill="var(--surface-ground)" animationDuration=".8s" />
              </div>
            ) : (
              <div className="">
                <DataTable value={users} emptyMessage={error ? error : 'No item matches with your search data. Please try again.'}>
                  <Column field="username" header="User Name" />
                  <Column field="email" header="Email" />
                  <Column field="phoneNumber" header="Phone No." />
                  <Column field="roles" header="Role" />
                  <Column field="active" header="Status" body={(rowData) => (rowData.isActive === 'true' ? 'Active' : 'Inactive')} />
                  <Column
                    header="Action"
                    style={{ maxWidth: '80px' }}
                    body={actionBodyTemplate}
                  />
                </DataTable>
                <Paginator first={(currentPage - 1) * rowsPerPage} rows={rowsPerPage} totalRecords={totalPages * rowsPerPage} onPageChange={onPageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
