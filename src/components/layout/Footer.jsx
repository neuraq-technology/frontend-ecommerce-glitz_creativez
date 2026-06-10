import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiFacebook,
    FiInstagram,
    FiYoutube,
    FiMail,
    FiMapPin,
    FiGift,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import logoImg from '../../assets/images/PNG.png';

const Footer = () => {
    const footerLinks = {
        shop: [
            { name: 'All Gifts', path: '/products' },
            { name: 'Birthday Gifts', path: '/products?category=birthday' },
            { name: 'Wedding Gifts', path: '/products?category=wedding' },
            { name: 'Corporate Gifts', path: '/products?category=corporate' },
        ],
        support: [
            { name: 'Contact Us', path: '/contact' },
            { name: 'FAQs', path: '/faq' },
            { name: 'Shipping Info', path: '/shipping' },
            { name: 'Gift Wrapping', path: '/gift-wrapping' },
        ],
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Our Story', path: '/story' },
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
        ],
    };

    const socialLinks = [
        { icon: <FiFacebook size={20} />, url: '#', label: 'Facebook' },
        { icon: <FaWhatsapp size={20} />, url: '#', label: 'WhatsApp' },
        { icon: <FiInstagram size={20} />, url: '#', label: 'Instagram' },
        { icon: <FiYoutube size={20} />, url: '#', label: 'YouTube' },
    ];

    return (
        <footer className="hidden md:block relative mt-0 sm:mt-12 bg-white border-t border-secondary-200">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent opacity-50" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <img src={logoImg} alt="Glitz Creativez" className="h-24 w-auto" />
                        </Link>
                        <p className="text-gray-500 leading-relaxed max-w-sm">
                            Curating unforgettable moments with premium gifts for every occasion.
                            Wrap your love in our signature elegance.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.url}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2.5 rounded-lg bg-white border border-secondary-200 text-primary-600 hover:bg-primary-50 hover:border-primary-300 shadow-sm transition-colors"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-2">
                        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-6">Shop</h3>
                        <ul className="space-y-4">
                            {footerLinks.shop.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-600 hover:text-primary-600 transition-colors block text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-6">Support</h3>
                        <ul className="space-y-4">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-600 hover:text-primary-600 transition-colors block text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-4">
                        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-6">Contact Us</h3>

                        {/* Contact Info (Enhanced) */}
                        <div className="flex flex-col gap-4 w-full lg:w-auto">
                            <a
                                href="mailto:hello@glitzcreativez.com"
                                className="group flex items-center gap-4 p-4 rounded-xl bg-secondary-50 hover:shadow-gold transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                    <FiMail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-0.5">Email Us</p>
                                    <span className="text-gray-900 font-medium group-hover:text-primary-700 transition-colors">hello@glitzcreativez.com</span>
                                </div>
                            </a>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary-50">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary-500">
                                    <FiMapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-0.5">Visit Us</p>
                                    <span className="text-gray-900 font-medium">New York, NY 10001</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-secondary-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Glitz Creativez. Luxury Gifting Reimagined.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
                        <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-primary-600 transition-colors">Terms</Link>
                        <Link to="/cookies" className="hover:text-primary-600 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
