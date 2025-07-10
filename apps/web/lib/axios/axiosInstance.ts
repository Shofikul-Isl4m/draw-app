import axios from "axios";
import { cookies } from "next/headers";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HTTP_URL,
  withCredentials: true,
});

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match && match[2] ? decodeURIComponent(match[2]) : undefined;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    let token: string | undefined;
    if (typeof window === "undefined") {
      const cookieStore = await cookies();
      token = cookieStore.get("jwt")?.value;
    } else {
      token = getCookie("jwt");
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
