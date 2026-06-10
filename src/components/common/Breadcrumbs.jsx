import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';

const Breadcrumbs = ({ items }) => {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto scrollbar-hide"
        >
            <Link to="/" className="hover:text-primary-600 transition-colors flex-shrink-0">Home</Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <FiChevronRight size={12} className="text-gray-400" />
                    {item.path ? (
                        <Link to={item.path} className="hover:text-primary-600 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-xs block">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </motion.nav>
    );
};

export default Breadcrumbs;
