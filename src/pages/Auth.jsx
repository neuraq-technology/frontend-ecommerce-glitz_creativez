import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { FiGift, FiMail, FiLock, FiUser, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import logoImg from '../assets/images/PNG.png';
import { selectIsAuthenticated, selectCurrentUser, setCredentials } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Auth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    // Form State
    const [isLogin, setIsLogin] = useState(true);
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: ''
    });

    useEffect(() => {
        let interval;
        if (showOtp && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showOtp, resendTimer]);

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.isAdmin) navigate('/admin');
            else navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/send-otp';
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isLogin ? {
                    email: formData.email,
                    password: formData.password
                } : {
                    email: formData.email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (isLogin) {
                if (data.requiresOtp) {
                    setShowOtp(true);
                    setResendTimer(60);
                    dispatch(addToast({ type: 'success', message: 'OTP sent to your email!' }));
                } else {
                    dispatch(setCredentials(data.data));
                    dispatch(addToast({ type: 'success', message: 'Logged in successfully!' }));
                }
            } else {
                setShowOtp(true);
                setResendTimer(60);
                dispatch(addToast({ type: 'success', message: 'OTP sent to your email!' }));
            }
        } catch (error) {
            dispatch(addToast({ type: 'error', message: error.message }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/verify-login-otp' : '/api/auth/register-otp';
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            dispatch(setCredentials(data.data));
            dispatch(addToast({ type: 'success', message: isLogin ? 'Logged in successfully!' : 'Account created successfully!' }));
        } catch (error) {
            dispatch(addToast({ type: 'error', message: error.message }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        try {
            const endpoint = isLogin ? '/api/auth/resend-login-otp' : '/api/auth/send-otp';
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
            
            setResendTimer(60);
            dispatch(addToast({ type: 'success', message: 'New OTP sent to your email!' }));
        } catch (error) {
            dispatch(addToast({ type: 'error', message: error.message }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50/50 px-4 overflow-hidden relative">
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[450px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 sm:p-10 border border-white/50 relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-2">
                    <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                        <img src={logoImg} alt="Glitz Creativez" className="h-20 w-auto" />
                    </Link>
                </div>


                <AnimatePresence mode="wait">
                    {!showOtp ? (
                        <motion.form
                            key="auth-form"
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="hello@example.com"
                                icon={<FiMail />}
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                icon={<FiLock />}
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-4 text-lg rounded-2xl group"
                                isLoading={isLoading}
                                icon={!isLogin ? <FiArrowRight className="group-hover:translate-x-1 transition-transform" /> : null}
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-6 text-center"
                        >
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Verify your email</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    We've sent a 6-digit code to <span className="font-bold text-gray-700">{formData.email}</span>
                                </p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Input
                                    name="otp"
                                    type="text"
                                    placeholder="000000"
                                    maxLength="6"
                                    className="text-center text-2xl tracking-[1em] font-bold w-full h-16 rounded-2xl"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    autoComplete="one-time-code"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full py-4 text-lg rounded-2xl"
                                    isLoading={isLoading}
                                    icon={<FiCheckCircle />}
                                >
                                    {isLogin ? 'Verify & Sign In' : 'Verify & Create Account'}
                                </Button>
                                
                                <div className="text-sm text-gray-500">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendTimer > 0}
                                        className={`font-bold transition-colors ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline'}`}
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowOtp(false)}
                                    className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors mt-2"
                                >
                                    Go back to details
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {!showOtp && (
                    <>
                        <div className="mt-8 text-center text-sm">
                            <p className="text-gray-500">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-bold text-primary-600 hover:text-primary-700 transition-colors underline-offset-4 hover:underline"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>

                        <div className="relative my-6 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <span className="relative px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
                        </div>

                        {/* Google Auth - Now at the bottom */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full relative flex items-center justify-center gap-4 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-bold py-4 px-4 border border-gray-200 rounded-2xl transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:outline-none group"
                        >
                            <FcGoogle size={26} className="group-hover:scale-110 transition-transform" />
                            Continue with Google
                        </button>
                    </>
                )}

                <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider font-bold">
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">Privacy Policy</a>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
