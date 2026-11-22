export const SHOP_CDN_BASE = 'https://cdn.shoptiengaming.com/shop';
export const APK_CDN_URL = 'https://cdn.shoptiengaming.com/download/MongThienCuu_s0_beta_online.apk';

const ROOT_CDN_FILES = new Set([
  '/Logo.png',
  '/Tiengaming.png',
  '/appdieukhien.png',
  '/currency_coins.png',
  '/dragon_anvil.jpg',
  '/dragon_blacksmith.jpg',
  '/dragon_blacksmith_cinematic.jpg',
  '/event_1111_x2.png',
  '/frame_banana_wings_slim.png',
  '/frame_rank_bakhi.png',
  '/frame_rank_bakhi_overlay.png',
  '/frame_rank_devuong.png',
  '/frame_rank_devuong_overlay.png',
  '/frame_rank_vodich.png',
  '/frame_rank_vodich_overlay.png',
  '/gem_ruby.png',
  '/guide-hoptodesk.png',
  '/hat_huyen_thoai.png',
  '/hat_wizard_legendary.png',
  '/installnow.png',
  '/item_attack_turn.png',
  '/item_spin_ticket_5.png',
  '/item_the_dotpha_giay.png',
  '/item_the_giam_suc_manh.png',
  '/item_the_reroll.png',
  '/item_the_reroll_sieucap.png',
  '/mongthienhuyen.jpg',
  '/rank_bac.png',
  '/rank_bakhi.png',
  '/rank_caothu.png',
  '/rank_daicaothu.png',
  '/rank_devuong.png',
  '/rank_dong.png',
  '/rank_kimcuong.png',
  '/rank_vang.png',
  '/rank_vodich.png',
  '/shoes_huyen_thoai.jpg',
  '/shoes_huyen_thoai.png',
  '/shoes_thuong.png',
  '/spin_ticket.jpg',
  '/spin_ticket.png',
  '/tocdo.png',
  '/tpbank.png',
  '/wizard_card_back.jpg',
  '/wizard_card_back.png',
]);

const CDN_PREFIXES = ['/game-assets/', '/mtc-showcase/'];
const failedCdnPaths = new Set();
let runtimeInstalled = false;

export function extractLocalShopPath(src) {
  if (!src || typeof src !== 'string') return null;
  const trimmed = src.trim();
  if (trimmed.startsWith(`${SHOP_CDN_BASE}/`)) {
    return trimmed.slice(SHOP_CDN_BASE.length);
  }
  if (trimmed.startsWith('/')) {
    const clean = trimmed.split('?')[0].split('#')[0];
    if (CDN_PREFIXES.some((prefix) => clean.startsWith(prefix)) || ROOT_CDN_FILES.has(clean)) {
      return trimmed;
    }
  }
  return null;
}

export function toShopCdnUrl(src) {
  if (!src || typeof src !== 'string') return src;
  if (import.meta.env.VITE_SHOP_CDN_ENABLED === 'false') return src;
  const trimmed = src.trim();
  if (!trimmed.startsWith('/')) return src;
  const clean = trimmed.split('?')[0].split('#')[0];
  if (failedCdnPaths.has(clean)) return src;
  if (CDN_PREFIXES.some((prefix) => clean.startsWith(prefix)) || ROOT_CDN_FILES.has(clean)) {
    return `${SHOP_CDN_BASE}${trimmed}`;
  }
  return src;
}

export function installShopCdnRuntime() {
  if (runtimeInstalled || typeof window === 'undefined' || typeof HTMLImageElement === 'undefined') {
    return;
  }
  if (import.meta.env.VITE_SHOP_CDN_ENABLED === 'false') {
    return;
  }
  runtimeInstalled = true;

  const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  const origSetAttribute = HTMLImageElement.prototype.setAttribute;

  if (srcDescriptor && typeof srcDescriptor.set === 'function') {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true,
      enumerable: srcDescriptor.enumerable,
      get: srcDescriptor.get,
      set(value) {
        if (this.dataset?.cdnFallback === '1') {
          this.dataset.cdnFallback = '';
          return srcDescriptor.set.call(this, value);
        }
        return srcDescriptor.set.call(this, typeof value === 'string' ? toShopCdnUrl(value) : value);
      },
    });
  }

  if (typeof origSetAttribute === 'function') {
    HTMLImageElement.prototype.setAttribute = function setAttributePatched(name, value) {
      if (typeof name === 'string' && name.toLowerCase() === 'src' && typeof value === 'string') {
        if (this.dataset?.cdnFallback === '1') {
          this.dataset.cdnFallback = '';
          return origSetAttribute.call(this, name, value);
        }
        return origSetAttribute.call(this, name, toShopCdnUrl(value));
      }
      return origSetAttribute.call(this, name, value);
    };
  }

  window.addEventListener(
    'error',
    (event) => {
      const target = event?.target;
      if (!target || target.tagName !== 'IMG') return;
      const curSrc = target.getAttribute('src') || target.src || '';
      if (!curSrc.startsWith(`${SHOP_CDN_BASE}/`)) return;
      const localPath = extractLocalShopPath(curSrc);
      if (!localPath) return;
      const cleanLocal = localPath.split('?')[0].split('#')[0];
      failedCdnPaths.add(cleanLocal);
      target.dataset.cdnFallback = '1';
      target.src = localPath;
    },
    true
  );
}
