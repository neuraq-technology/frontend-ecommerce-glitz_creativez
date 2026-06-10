import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = ({ className = '', onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-100 hover:shadow-md transition-all group ${className}`}
            aria-label="Go back"
        >
            <FiArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        </motion.button>
    );
};

export default BackButton;
