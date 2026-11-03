import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';

export const DEFAULT_STORE_CONTACT = {
    supportEmail: 'hello@glitzcreativez.com',
    phone: '+91 9567924716',
    name: 'Glitz Creativez'
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom React Hook that returns the dynamic store contact details (support email and phone)
 * Synchronized with MongoDB and Redux state.
 */
export const useStoreContact = () => {
    const user = useSelector(selectCurrentUser);
    const [contact, setContact] = useState({
        supportEmail: user?.supportEmail || DEFAULT_STORE_CONTACT.supportEmail,
        phone: user?.phone || DEFAULT_STORE_CONTACT.phone,
        name: user?.name || DEFAULT_STORE_CONTACT.name
    });

    useEffect(() => {
        let isMounted = true;

        const loadContact = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/store-contact`);
                const result = await res.json();
                if (result.success && result.data && isMounted) {
                    setContact({
                        supportEmail: result.data.supportEmail || DEFAULT_STORE_CONTACT.supportEmail,
                        phone: result.data.phone || DEFAULT_STORE_CONTACT.phone,
                        name: result.data.name || DEFAULT_STORE_CONTACT.name
                    });
                }
            } catch (err) {
                // Silently fallback to current user or default
            }
        };

        loadContact();

        return () => {
            isMounted = false;
        };
    }, [user?.supportEmail, user?.phone]);

    return contact;
};

export default useStoreContact;
