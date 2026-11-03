import { motion } from 'framer-motion';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Privacy = () => {
    return (
        <div className="min-h-screen pt-36 sm:pt-32 md:pt-28 pb-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-secondary-200 shadow-soft p-8 md:p-12 prose max-w-none text-gray-600"
                >
                    <h1 className="text-3xl font-black text-gray-900 mb-6 gradient-text w-fit">Privacy Policy</h1>
                    <p className="text-sm text-gray-400 mb-8">Last Updated: July 2026</p>
                    
                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Information We Collect</h2>
                    <p className="mb-4">
                        We collect information you provide directly to us when registering an account, purchasing products, subscribing to emails, or contacting support. This includes your name, email address, shipping address, billing address, phone number, and payment information.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
                    <p className="mb-4">
                        We use the information we collect to process orders, manage accounts, improve customer service, communicate about promotions/updates, and detect or prevent fraud.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. Sharing of Information</h2>
                    <p className="mb-4">
                        We do not sell your personal data. We only share information with trusted third-party providers necessary to complete services, such as payment gateways (Cashfree), database managers, and delivery services.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. Security</h2>
                    <p className="mb-4">
                        We use administrative, technical, and physical security measures (like SSL encryption) to protect your personal information.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
