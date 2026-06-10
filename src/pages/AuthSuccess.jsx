import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { FiLoader } from 'react-icons/fi';
import { addToast } from '../store/slices/uiSlice';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // We will get the token from URL, but we need user data.
    // The easiest way is to temporarily set the token in Redux/localStorage, 
    // then call `useGetMeQuery` or just manually fetch `/api/auth/me`.

    // Extract token from query params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    useEffect(() => {
        if (!token) {
            dispatch(addToast({ type: 'error', message: 'Authentication failed: No token received.' }));
            navigate('/auth');
            return;
        }

        // Store token immediately so subsequent requests work
        localStorage.setItem('token', token);

        const fetchUser = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    dispatch(setCredentials({ user: result.data, token }));
                    dispatch(addToast({ type: 'success', message: 'Successfully logged in!' }));

                    if (result.data.isAdmin) {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                } else {
                    throw new Error('Failed to fetch user');
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                localStorage.removeItem('token');
                dispatch(addToast({ type: 'error', message: 'User verification failed.' }));
                navigate('/auth');
            }
        };

        fetchUser();

    }, [token, navigate, dispatch]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <FiLoader size={48} className="text-primary-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Verifying authentication...</h2>
            <p className="text-gray-500 mt-2">Please wait while we log you in securely.</p>
        </div>
    );
};

export default AuthSuccess;
