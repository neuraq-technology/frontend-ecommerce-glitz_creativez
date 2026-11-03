import { motion } from 'framer-motion';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Terms = () => {
    return (
        <div className="min-h-screen pt-36 sm:pt-32 md:pt-28 pb-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-secondary-200 shadow-soft p-8 md:p-12 prose max-w-none text-gray-600"
                >
                    <h1 className="text-3xl font-black text-gray-900 mb-6 gradient-text w-fit">Terms & Conditions</h1>
                    <p className="text-sm text-gray-400 mb-8">Last Updated: July 2026</p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Agreement to Terms</h2>
                    <p className="mb-4">
                        By accessing or using our website, you agree to comply with and be bound by these Terms and Conditions. Please review them carefully.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. User Accounts</h2>
                    <p className="mb-4">
                        When creating an account, you must provide accurate, current, and complete information. You are responsible for safeguarding your password and account credentials.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. Payments & Orders</h2>
                    <p className="mb-4">
                        All orders are subject to availability and acceptance. We reserve the right to cancel or refuse any order. Payments are processed securely via Cashfree, and orders will only ship once payment is confirmed.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. Limitation of Liability</h2>
                    <p className="mb-4">
                        Glitz Creativez shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or services.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
