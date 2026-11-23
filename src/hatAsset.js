// Tệp asset Nón Huyền Thoại (Static WebP tại public/game-assets/, tự ánh xạ sang R2 CDN qua cdnAsset.js)
export const LEGENDARY_HAT_IMG = '/game-assets/hat_huyen_thoai_legendary.webp';

export const getHatImage = (imgSrc) => {
  if (!imgSrc) return LEGENDARY_HAT_IMG;
  if (typeof imgSrc === 'string') {
    const lower = imgSrc.toLowerCase();
    if (
      lower.includes('hat') ||
      lower.includes('non') ||
      lower.includes('mu') ||
      lower.includes('nón') ||
      lower.includes('mũ') ||
      lower.includes('helmet') ||
      lower.includes('crown')
    ) {
      if (lower.includes('thuong') || lower.includes('thường') || lower.includes('iron') || lower.includes('sat')) {
        return '/game-assets/hat_thuong.png';
      }
      return LEGENDARY_HAT_IMG;
    }
  }
  return imgSrc || LEGENDARY_HAT_IMG;
};
