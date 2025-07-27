import { Route, Routes } from "react-router-dom"
import { ProtectedRoutes } from "./PrivateRoute"
function AppRoute() {
    return (
        <Routes>
            <Route path="*" element={<ProtectedRoutes />} />
        </Routes>
    )

}

export default AppRoute