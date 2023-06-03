import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import userService from "../services/user.service";
import { toast } from "react-toastify";

const httpAuth = axios.create();
const AuthContext = React.createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const TOKEN_KEY = "jwt-token";
const REFRESH_KEY = "jwt-refresh-token";
const EXPIRES_KEY = "jwt-expires";

const AuthProvider = ({ children }) => {
    const [createdUser, setCreatedUser] = useState({});
    const [error, setError] = useState(null);
    function setTokens({ refreshToken, idToken, expiresIn = 3600 }) {
        const expiresDate = new Date().getTime() + expiresIn * 1000;
        localStorage.setItem(TOKEN_KEY, idToken);
        localStorage.setItem(REFRESH_KEY, refreshToken);
        localStorage.setItem(EXPIRES_KEY, expiresDate);
    }
    async function signUp({ email, password, ...rest }) {
        const key = "AIzaSyBZ2T9s5RMAG1DIIH-szNnm7VqLqIDAwTk";
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${key}`;
        try {
            const { data } = await httpAuth.post(url, {
                email,
                password,
                returnSecureToken: true
            });
            setTokens(data);
            await createUser({ _id: data.localId, email, ...rest });
        } catch (error) {
            errorCatcher(error);
        }
    }
    async function createUser(data) {
        try {
            const { content } = await userService.create(data);
            setCreatedUser(content);
        } catch (error) {
            errorCatcher(error);
        }
    }
    function errorCatcher(error) {
        const { data } = error.response;
        setError(data.message || "Произошла ошибка");
    }
    useEffect(() => {
        if (error !== null) {
            toast(error);
            setError(null);
        }
    }, [error]);
    return (
        <AuthContext.Provider value={{ signUp, createdUser }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};

export default AuthProvider;
