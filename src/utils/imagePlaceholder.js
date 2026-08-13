// utils/imagePlaceholder.js
// A local, network-free fallback image. Using a remote placeholder service here is
// risky: if that service is ever blocked (ad-blocker, firewall) or down, the fallback
// image itself fails to load, re-triggering onError and causing an infinite retry loop.
const buildPlaceholderSvg = (size, text) => {
  const fontSize = Math.max(10, Math.round(size / 10));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Use as an <img onError={...}> handler. Safe to call even if it somehow fires
 * more than once - onerror is cleared first so it can never loop.
 */
export const handleImageFallback = (event, size = 200, text = 'Image Error') => {
  event.target.onerror = null;
  event.target.src = buildPlaceholderSvg(size, text);
};
