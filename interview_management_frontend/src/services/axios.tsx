// axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
    // baseURL: "http://152.42.194.78:8080",
    // baseURL: "https://152.42.194.78:8443",
      baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Check if data is an instance of FormData and set the appropriate Content-Type
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
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
 

export default axiosInstance;
