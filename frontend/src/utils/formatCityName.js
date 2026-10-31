// Display labels for the multiword cities in the existing search filters.
// Keep source values intact for API filters and matching.
const cityLabels = {
  hoodriver: 'Hood River',
  whitesalmon: 'White Salmon',
  thedalles: 'The Dalles',
  cascadelocks: 'Cascade Locks',
  troutlake: 'Trout Lake',
  bzcorner: 'BZ Corner',
  mthoodprkdl: 'Parkdale',
};

export const formatCityName = (city) => {
  if (!city) return '';
  const name = city.trim().replace(/\s+/g, ' ');
  const key = name.replace(/\s/g, '').toLowerCase();
  return Object.prototype.hasOwnProperty.call(cityLabels, key) ? cityLabels[key] : name;
};
