const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
// Explicitly point to the .env file in the same directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 Checking DATABASE_URL...');
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
}

// Create a local pool
// IMPORTANT: We use the DATABASE_URL from .env but override the database name if needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('/lokerrealty', '/listing_alerts'),
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function generateSitemap() {
  const BASE_URL = 'https://gorgerealty.com';
  
  // Static pages
  const staticPages = [
    '',
    '/contact',
    '/map',
    '/dashboard',
    '/market/hood-river',
    '/market/white-salmon',
    '/market/the-dalles'
  ];

  try {
    // 1. Fetch all active listings from the database
    const result = await pool.query(`
      SELECT mls_number, address 
      FROM listings 
      WHERE is_published = true AND status = 'Active'
    `);
    const listings = result.rows;

    // 2. Start building the XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 3. Add Static Pages
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // 4. Add Dynamic Property Pages
    listings.forEach(listing => {
      // Create slug: Since address already includes city/state, we just slugify it directly
      const slug = `${listing.address}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      xml += `
  <url>
    <loc>${BASE_URL}/property/${slug}/${listing.mls_number}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    // 5. Write to the frontend public folder AND the production folder if it exists
    const localPath = path.join(__dirname, '../frontend/public/sitemap.xml');
    const prodPath = '/var/www/lokerrealty/sitemap.xml';

    fs.writeFileSync(localPath, xml);
    console.log(`✅ Local sitemap generated at ${localPath}`);

    // Try to write to production path if accessible
    try {
        if (fs.existsSync('/var/www/lokerrealty')) {
            fs.writeFileSync(prodPath, xml);
            console.log(`🚀 Production sitemap updated at ${prodPath}`);
        }
    } catch (e) {
        console.log(`⚠️ Could not write to ${prodPath} (likely permission issue).`);
    }

    console.log(`✅ Sitemap generated with ${staticPages.length} static pages and ${listings.length} listings!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    process.exit(1);
  }
}

generateSitemap();
