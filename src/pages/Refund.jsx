import { motion } from 'framer-motion';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useStoreContact } from '../utils/useStoreContact';

const Refund = () => {
    const { supportEmail } = useStoreContact();

    return (
        <div className="min-h-screen pt-36 sm:pt-32 md:pt-28 pb-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Breadcrumbs items={[{ label: 'Refund & Cancellation Policy' }]} />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-secondary-200 shadow-soft p-8 md:p-12 prose max-w-none text-gray-600"
                >
                    <h1 className="text-3xl font-black text-gray-900 mb-6 gradient-text w-fit">Refund & Cancellation Policy</h1>
                    <p className="text-sm text-gray-400 mb-8">Last Updated: July 2026</p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Cancellations</h2>
                    <p className="mb-4">
                        You may cancel your order within **2 hours** of placing it. Once an order is processed or shipped, it cannot be cancelled. To cancel, please email us immediately at <a href={`mailto:${supportEmail || 'hello@glitzcreativez.com'}`} className="font-semibold text-primary-600">{supportEmail || 'hello@glitzcreativez.com'}</a> with your order number.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. Returns & Refunds</h2>
                    <p className="mb-4">
                        We accept returns within **7 days** of delivery. The item must be in its original, unused, and undamaged packaging. Customized or personalized gifts are **not eligible** for returns.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. Refund Processing</h2>
                    <p className="mb-4">
                        Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and the amount will be automatically credited back to your original payment method (via Cashfree) within **5-7 business days**.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. Damaged or Defective Items</h2>
                    <p className="mb-4">
                        If you receive a damaged or defective product, please email us with photos of the product and packaging within **24 hours** of delivery. We will issue a replacement or full refund immediately.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Refund;
