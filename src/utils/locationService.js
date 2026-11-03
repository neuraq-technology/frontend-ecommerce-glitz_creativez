/**
 * Glitz Creativez - Location & Address Helper Service
 * Provides GPS Geolocation ("Use My Location") and Indian Pincode Auto-lookup
 */

// Reverse geocode latitude & longitude to address fields
export const fetchLocationDetails = async () => {
    if (!('geolocation' in navigator)) {
        throw new Error('Geolocation is not supported by your browser.');
    }

    // 1. Get browser coordinates
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            resolve,
            (error) => {
                let msg = 'Failed to retrieve location.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Location permission was denied. Please allow location access in your browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = 'Location information is currently unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    msg = 'Location request timed out. Please try again.';
                }
                reject(new Error(msg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    });

    const { latitude, longitude } = position.coords;

    // 2. Try BigDataCloud reverse geocode client first (fast, reliable, CORS enabled)
    try {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (response.ok) {
            const data = await response.json();
            const state = data.principalSubdivision || '';
            // Locality or city or localityInfo administrative level 2 (District in India)
            const district =
                data.localityInfo?.administrative?.find(a => a.adminLevel === 6 || a.name?.toLowerCase().includes('district'))?.name?.replace(/ District$/i, '') ||
                data.city ||
                data.locality ||
                '';
            const pincode = data.postcode || '';
            const roadArea = [data.locality, data.localityInfo?.informative?.[0]?.name].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ') || '';

            return {
                latitude,
                longitude,
                state,
                district,
                city: data.city || district,
                pincode,
                roadArea
            };
        }
    } catch (e) {
        console.warn('BigDataCloud reverse geocode failed, falling back to Nominatim...', e);
    }

    // 3. Fallback to OpenStreetMap Nominatim
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const state = addr.state || '';
            const district = (addr.state_district || addr.county || addr.city || '').replace(/ District$/i, '');
            const pincode = addr.postcode || '';
            const roadArea = [addr.road, addr.neighbourhood || addr.suburb].filter(Boolean).join(', ');

            return {
                latitude,
                longitude,
                state,
                district,
                city: addr.city || addr.town || addr.village || district,
                pincode,
                roadArea
            };
        }
    } catch (e) {
        console.warn('Nominatim reverse geocode failed:', e);
    }

    throw new Error('Could not translate GPS coordinates to an address. Please enter manually.');
};

// Auto-lookup district & state from 6-digit Indian Pincode
export const lookupPincode = async (pincode) => {
    const cleanPin = (pincode || '').toString().trim();
    if (!/^\d{6}$/.test(cleanPin)) return null;

    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            return {
                state: po.State || '',
                district: po.District || '',
                city: po.Block || po.District || '',
                area: po.Name || ''
            };
        }
    } catch (e) {
        console.warn('Postal pincode API lookup error:', e);
    }
    return null;
};
