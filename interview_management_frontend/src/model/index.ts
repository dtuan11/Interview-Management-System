interface Ilogin {
    username: string,
    password: string,
}
interface IgetOffer {
    pageIndex: number,
    pageSize: number
}
interface IsearchOffer {
    search: string,
    department: string,
    status: string,
    pageIndex: number,
    pageSize: number,
}
export type {
    IgetOffer,
    IsearchOffer,

}
export { type Ilogin }