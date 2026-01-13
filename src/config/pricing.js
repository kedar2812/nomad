export const PRICING_CONFIG = {
    ODD_HOUR_RATE: 50,  // 1st, 3rd, 5th hour...
    EVEN_HOUR_RATE: 20, // 2nd, 4th, 6th hour...
};

export const calculatePrice = (durationHours) => {
    let price = 0;
    for (let i = 1; i <= durationHours; i++) {
        if (i % 2 !== 0) {
            price += PRICING_CONFIG.ODD_HOUR_RATE;
        } else {
            price += PRICING_CONFIG.EVEN_HOUR_RATE;
        }
    }
    return price;
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
