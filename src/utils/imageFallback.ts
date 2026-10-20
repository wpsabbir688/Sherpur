/**
 * High-reliability image fallback utility.
 * Generates an SVG data URL with an elegant nature gradient
 * ensuring no image ever renders as a broken box.
 */
export const FALLBACK_IMAGE_DATA_URI =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#143E27"/>
          <stop offset="50%" stop-color="#1E5638"/>
          <stop offset="100%" stop-color="#0F291B"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)"/>
      <g fill="#A7F3D0" opacity="0.3">
        <!-- Mountain silhouette -->
        <polygon points="0,600 200,320 400,600"/>
        <polygon points="250,600 500,240 750,600"/>
        <polygon points="550,600 680,380 800,600"/>
      </g>
      <g fill="#FFFFFF" opacity="0.9" transform="translate(360, 240) scale(3.5)">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </g>
      <text x="400" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="bold" fill="#ECFDF5" text-anchor="middle">শেরপুর ভ্রমণ গাইড</text>
      <text x="400" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#A7F3D0" text-anchor="middle">গারো পাহাড় ও প্রাকৃতিক নিসর্গ</text>
    </svg>
  `);

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  secondaryUrl?: string
) => {
  const target = e.currentTarget;
  if (!target.dataset.hasRetried && secondaryUrl) {
    target.dataset.hasRetried = 'true';
    target.src = secondaryUrl;
  } else {
    target.onerror = null;
    target.src = FALLBACK_IMAGE_DATA_URI;
  }
};
