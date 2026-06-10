import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    hover = true,
    glow = false,
    gradient = false,
    ...props
}) => {
    return (
        <motion.div
            whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
            className={`
        relative overflow-hidden rounded-2xl
        bg-white border border-gray-100
        shadow-card
        ${hover ? 'hover:shadow-soft-lg hover:border-gray-200 transition-all duration-300' : ''}
        ${glow ? 'shadow-glow' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Gradient overlay */}
            {gradient && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-purple-50/50 pointer-events-none" />
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Animated border gradient on hover */}
            {hover && (
                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                    }}
                />
            )}
        </motion.div>
    );
};

export default Card;
