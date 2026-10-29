/**
 * Image Optimization Utility for PrimeAuction
 * Transforms Cloudinary URLs on-the-fly to serve responsive, WebP/AVIF, auto-compressed images.
 */

export function optimizeImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return '';

  const {
    width = 600,
    quality = 'auto',
    format = 'auto',
    crop = 'limit'
  } = options;

  // Cloudinary URL transformation
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // If transformations are already present, avoid duplicating
    if (url.includes('/f_auto') || url.includes('/q_auto')) {
      return url;
    }

    const transformParams = `f_${format},q_${quality},w_${width},c_${crop}`;
    return url.replace('/image/upload/', `/image/upload/${transformParams}/`);
  }

  return url;
}

export function getThumbnailUrl(url) {
  return optimizeImageUrl(url, { width: 320 });
}

export function getCardImageUrl(url) {
  return optimizeImageUrl(url, { width: 640 });
}

export function getDetailImageUrl(url) {
  return optimizeImageUrl(url, { width: 1200 });
}

export function getBannerImageUrl(url) {
  return optimizeImageUrl(url, { width: 1600 });
}
