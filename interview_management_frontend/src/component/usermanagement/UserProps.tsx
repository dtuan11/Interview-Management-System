import React from "react";
import { UserModel } from "./UserMode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye } from "@fortawesome/free-solid-svg-icons";

interface UserProps {
    user: UserModel
}

export const UserModelProps: React.FC<UserProps> = ({ user }) => {
    return (
        <tr style={{ height: '10px' }}>
            <td style={{ height: '10px' }} scope="row">{user.username}</td>
            <td>{user.email}</td>
            <td>{user.phoneNumber}</td>
            <td>{user.role}</td>
            <td>{user.active ? 'Active' : 'InActive'}</td>
            <td>
                <button className="btn btn-link">
                    <FontAwesomeIcon icon={faEye} />
                </button>
                <button className="btn btn-link">
                    <FontAwesomeIcon icon={faEdit} />
                </button>
            </td>
        </tr>
    );
}
