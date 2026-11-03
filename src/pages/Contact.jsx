import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useStoreContact } from '../utils/useStoreContact';

const Contact = () => {
    const { supportEmail, phone } = useStoreContact();

    return (
        <div className="min-h-screen pt-36 sm:pt-32 md:pt-28 pb-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Breadcrumbs items={[{ label: 'Contact Us' }]} />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-secondary-200 shadow-soft p-8 md:p-12"
                >
                    <h1 className="text-3xl font-black text-gray-900 mb-6 gradient-text w-fit">Contact Us</h1>
                    <p className="text-gray-600 mb-10 text-sm md:text-base">
                        Have any questions or need custom gifting solutions? Feel free to reach out to us. We would love to assist you!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                                    <FiPhone size={22} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-1">Call Us</h3>
                                    <a href={`tel:${(phone || '+91 9567924716').replace(/\s+/g, '')}`} className="text-gray-600 hover:text-primary-600 font-medium">
                                        {phone || '+91 9567924716'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                                    <FiMail size={22} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-1">Email Us</h3>
                                    <a href={`mailto:${supportEmail || 'hello@glitzcreativez.com'}`} className="text-gray-600 hover:text-primary-600 font-medium">
                                        {supportEmail || 'hello@glitzcreativez.com'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                                    <FiMapPin size={22} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-1">Visit Us</h3>
                                    <p className="text-gray-600 font-medium">New York, NY 10001</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                                    <FiClock size={22} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-1">Business Hours</h3>
                                    <p className="text-gray-600 font-medium">Mon - Sat: 10:00 AM - 7:00 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Dummy Contact Form */}
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm" placeholder="Type your message here..."></textarea>
                            </div>
                            <button type="submit" className="w-full btn-primary py-3">Send Message</button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
