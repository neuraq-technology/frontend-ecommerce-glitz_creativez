import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import BackButton from '../components/common/BackButton';

const AdminAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                dispatch(setCredentials(data.data));
                dispatch(addToast({
                    type: 'success',
                    message: 'Admin access granted',
                }));
                navigate('/admin');
            } else {
                throw new Error(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/">
                            <BackButton className="!w-10 !h-10" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                            <p className="text-gray-500">Secure access only</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2"
                            >
                                <FiLock size={16} /> {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Admin Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="admin@example.com"
                                icon={<FiMail />}
                                required
                            />

                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                                icon={<FiLock />}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={loading}
                            icon={<FiCheck />}
                        >
                            Authenticate
                        </Button>
                    </form>
                </div>

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Unauthorized access is strictly prohibited. IP address logging is enabled.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminAuth;
