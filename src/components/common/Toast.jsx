import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import { selectToasts, removeToast } from '../../store/slices/uiSlice';

const Toast = ({ toast, onRemove }) => {
    const icons = {
        success: <FiCheckCircle className="w-5 h-5" />,
        error: <FiAlertCircle className="w-5 h-5" />,
        warning: <FiAlertTriangle className="w-5 h-5" />,
        info: <FiInfo className="w-5 h-5" />,
    };

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const iconStyles = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-amber-500',
        info: 'text-blue-500',
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        border shadow-soft-lg backdrop-blur-sm
        ${styles[toast.type]}
      `}
        >
            <span className={iconStyles[toast.type]}>
                {icons[toast.type]}
            </span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors"
            >
                <FiX className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

const ToastContainer = () => {
    const dispatch = useDispatch();
    const toasts = useSelector(selectToasts);

    const handleRemove = (id) => {
        dispatch(removeToast(id));
    };

    return (
        <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onRemove={handleRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
