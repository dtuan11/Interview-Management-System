export class UserModel {
    id: number;
    username?: string;
    email?: string;
    phoneNumber?: string;
    roles?: string[];
    isActive: boolean;
    fullName: string;
    dob: Date;
    address: string;
    gender: boolean;
    department: string;
    note: string;
    version?: number;

    constructor(
        id: number,
        fullName: string,
        email: string,
        dob: Date,
        address: string,
        phoneNumber: string,
        gender: boolean,
        department: string,
        note: string,
        isActive: boolean,
        username?: string,
        roles?: string[],
        version?: number
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
        this.isActive = isActive;
        this.fullName = fullName;
        this.dob = dob;
        this.address = address;
        this.gender = gender;
        this.department = department;
        this.note = note;
        this.version = version;
    }
}
