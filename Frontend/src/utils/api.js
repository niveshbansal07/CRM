export const API_BASE_URL = "http://localhost:5000/api";

export const getAccessToken = () => {
    return localStorage.getItem("accessToken");
};

export const authHeaders = () => {
    const accessToken = getAccessToken();

    return {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
    };
};