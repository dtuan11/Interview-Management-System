// axios.ts
import axios from 'axios';

const axiosCandidate = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'multipart/form-data',
      },
    timeout: 15000,
});

// Add a request interceptor
axiosCandidate.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosCandidate.interceptors.response.use(
    function (response) {
        //console.log("responsess", response);

        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    },
    function (error) {
       // console.log("err1", error);
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        if (error.response && error.response.status === 400) {
            // localStorage.clear();
            // window.location.href = "/login";
        } else if (error.response && error.response.status === 403) {
            // window.location.href = "/access-denied"
        }
        return Promise.reject(error);
    }
);

export default axiosCandidate;
