// Tệp asset Giày Huyền Thoại Thần Tốc (Static WebP tại public/game-assets/, tự ánh xạ sang R2 CDN qua cdnAsset.js)
export const LEGENDARY_SHOES_IMG = '/game-assets/shoes_huyen_thoai_legendary.webp';

export const getShoesImage = (imgSrc) => {
  if (!imgSrc) return LEGENDARY_SHOES_IMG;
  if (typeof imgSrc === 'string') {
    const lower = imgSrc.toLowerCase();
    if (
      lower.includes('shoes') ||
      lower.includes('giay') ||
      lower.includes('giày') ||
      lower.includes('huyen_thoai') ||
      lower.includes('than_toc')
    ) {
      return LEGENDARY_SHOES_IMG;
    }
  }
  return imgSrc || LEGENDARY_SHOES_IMG;
};
