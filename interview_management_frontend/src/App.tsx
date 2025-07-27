// App.tsx
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import UserService from "./services/user";

import { SendEmail } from "./component/layouts/forgotpassword/SendEmailForgot";
import  ProtectedRoutes from "./utils/PrivateRoute";
import { ResetPassword } from "./component/layouts/forgotpassword/ResetPassword";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./AppStyle.css";
import Sidebar from "./component/Sidebar4";
import Header from "./component/Header";
import Login from "./pages/LoginSrceen";
import { NavigationProvider } from "./utils/NavigationContext";
import MainLayout from "./MainLayout";
import { HomePage } from "./pages/HomepageSrceen";
import { NotFoundModel } from "./utils/404-NotFound";
import CandidateList from "./component/candidatemanagement/CandidateList";
import ProtectedRoute from "./utils/ProtectedRoute";
import CreateNewCandidate from "./component/candidatemanagement/CreateNewCandidate";
import CandidateInformation from "./component/candidatemanagement/CandidateDetail";
import EditCandidate from "./component/candidatemanagement/EditCandidate";
import OfferList from "./component/offermanagement/OffterList";
import CreateNewOffer from "./component/offermanagement/CreateNewOffer";
import EditOffer from "./component/offermanagement/EditOffer";
import OfferDetail from "./component/offermanagement/OfferDetail";
import UserList from "./component/usermanagement/UserList";
import CreateUser from "./component/usermanagement/create/CreateUser";
import ViewUserDetail from "./component/usermanagement/userdetail/UserDetail";
import { EditUser } from "./component/usermanagement/edit-user/Edit-User";
import CreateInterviewSchedule from "./component/interviewmanagement/CreateInterview";
import InterviewList from "./component/interviewmanagement/InterviewList";
import EditInterview from "./component/interviewmanagement/EditInterview";
import InterviewDetail from "./component/interviewmanagement/InterviewDetail";
import InterviewSubmit from "./component/interviewmanagement/InterviewSubmitResult";
import JobDetails from "./component/jobmanagement/JobDetails";
import JobList from "./component/jobmanagement/JobList";
import JobForm from "./component/jobmanagement/JobForm";
import { Helmet } from "react-helmet";


const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(UserService.checkLogin());
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const checkTokenInterval = setInterval(() => {
      UserService.checkExpiredToken(token);
    }, 10 * 60 * 1000);

    UserService.checkExpiredToken(token);

    return () => clearInterval(checkTokenInterval);
  }, []);



  const handleChangeSidebar = () =>{
    setCollapsed(prevState => !prevState);
  }


  return (
    <div className="App">
    
        <BrowserRouter>
          {isLogin ? (
            <Routes>
            <Route path="/" element={<MainLayout collapsed={collapsed} handleChangeSidebar={handleChangeSidebar} activeItem={activeItem} setActiveItem={setActiveItem} />}>
            <Route path="/" element={<ProtectedRoutes element={<HomePage />} />} />
              <Route path="/homepage" element={<ProtectedRoutes element={<HomePage />} />} />
              <Route path="/404-not-found" element={<NotFoundModel />} />
              <Route path="/candidate-list" element={<ProtectedRoutes element={<CandidateList />} />} />
              <Route path="/create-new-candidate" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <CreateNewCandidate />
                </ProtectedRoute>
              } />} />
              <Route path="/candidate-information" element={<ProtectedRoutes element={<CandidateInformation />} />} />
              <Route path="/edit-candidate" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <EditCandidate />
                </ProtectedRoute>
              } />} />
              <Route path="/offer-list" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <OfferList />
                </ProtectedRoute>
              } />} />
              <Route path="/create-new-offer" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <CreateNewOffer />
                </ProtectedRoute>
              } />} />
              <Route path="/edit-offer/:offerId" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <EditOffer />
                </ProtectedRoute>
              } />} />
              <Route path="/offer-detail/:offerId" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <OfferDetail />
                </ProtectedRoute>
              } />} />
              <Route path="/user-list" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <UserList />
                </ProtectedRoute>} />} />
              <Route path="/create-user" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CreateUser />
                </ProtectedRoute>
              } />} />
              <Route path="/user-list/user/:userId" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ViewUserDetail />
                </ProtectedRoute>} />} />
              <Route path="/user-list/update-user/:userId" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <EditUser />
                </ProtectedRoute>
              } />} />
              <Route path="/create-interview" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <CreateInterviewSchedule />
                </ProtectedRoute>
              } />} />
              <Route path="/interview-list" element={<ProtectedRoutes element={<InterviewList />} />} />
              <Route path="/interview-edit/:interviewScheduleId" element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <EditInterview />
                </ProtectedRoute>
              } />
              <Route path="/interview-detail/:interviewScheduleId" element={<ProtectedRoutes element={<InterviewDetail />} />} />
              <Route path="/interview-submit-result/:interviewScheduleId" element={<ProtectedRoutes element={
                <ProtectedRoute allowedRoles={["INTERVIEWER"]}>
                  <InterviewSubmit />
                </ProtectedRoute>
              } />} />
              <Route path="/job-details/:jobId" element={<ProtectedRoutes element={<JobDetails />} />} />
              <Route path="/job-list" element={<ProtectedRoutes element={<JobList />} />} />
              <Route path="/create-job" element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <JobForm />
                </ProtectedRoute>
              } />
              <Route path="/edit-job/:jobId" element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "RECRUITER"]}>
                  <JobForm />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
          ) : (
            <div className="login-container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<SendEmail />} />
                <Route path="/reset-password/:token/:email" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </div>
          )}
        </BrowserRouter>
    </div>
  );
};


export default App;