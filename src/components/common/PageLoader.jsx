import { motion } from 'framer-motion';
import logoImg from '../../assets/images/PNG.png';
import { HiSparkles } from 'react-icons/hi2';

const PageLoader = ({ isReady, onFinish }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] bg-[#fafcff] flex flex-col items-center justify-center p-6 select-none"
        >
            {/* Background Ambient Glow */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#FF64B4]/15 via-[#4cc9f0]/15 to-transparent blur-3xl pointer-events-none" />

            {/* Central Branded Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto"
            >
                {/* Logo with gentle pulse */}
                <div className="relative mb-6">
                    <motion.div
                        animate={{
                            scale: [1, 1.04, 1],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2.4,
                            ease: 'easeInOut',
                        }}
                        className="relative"
                    >
                        <img
                            src={logoImg}
                            alt="Glitz Creativez"
                            className="h-20 sm:h-24 w-auto object-contain drop-shadow-md"
                        />
                    </motion.div>
                    {/* Floating Sparkle */}
                    <motion.div
                        animate={{
                            rotate: [0, 180, 360],
                            scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: 'easeInOut',
                        }}
                        className="absolute -top-2 -right-2 text-[#FF64B4]"
                    >
                        <HiSparkles size={20} />
                    </motion.div>
                </div>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-gray-500 mb-6">
                    Bespoke Keepsakes • Curated Gifts
                </p>

                {/* Loading / Ready Button */}
                {isReady ? (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onFinish}
                        className="inline-flex items-center gap-2 bg-[#FF64B4] hover:bg-[#e0529f] text-white font-bold px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer"
                    >
                        <span>Visit Website</span>
                        <HiSparkles size={16} />
                    </motion.button>
                ) : (
                    <div className="w-48 sm:w-56 h-1.5 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                ease: 'easeInOut',
                            }}
                            className="w-1/2 h-full bg-gradient-to-r from-[#FF64B4] via-[#ff389a] to-[#4cc9f0] rounded-full"
                        />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default PageLoader;
