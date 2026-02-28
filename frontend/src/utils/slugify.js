// frontend/src/utils/slugify.js

export const createSlug = (address) => {
    if (!address) return 'property';
    
    
    // Result: 123-main-st-portland-or-97204
    const combined = `${address}`;
    
    return combined
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars (like #, commas)
        .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};