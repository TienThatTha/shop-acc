import { LEGENDARY_SHOES_IMG } from '../shoesAsset';

// --- BẢO HIỂM VÒNG QUAY 120 LẦN CHO GIÀY HUYỀN THOẠI (LẦN 121: 100% TRÚNG) ---
export const isLegendaryShoes = (item) => {
  if (!item) return false;
  const type = String(item.type || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();
  return type === 'game_shoes_legendary' ||
         (type === 'other' && (name.includes('giày huyền thoại') || name.includes('giày thần tốc'))) ||
         name.includes('giày huyền thoại') ||
         name.includes('giày thần tốc');
};

export const isGameItem = (item) => {
  if (!item) return false;
  const type = String(item.type || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();
  if (type.startsWith('game_')) return true;
  if (type === 'coins' || type === 'xu') return true;
  if (name.includes('xu nâng cấp') || name.includes('xu game') || name.includes('hòm boss') || name.includes('hòm hoàng kim') || name.includes('lượt đánh') || name.includes('đá tinh hoa') || name.includes('tinh thể') || name.includes('tinh hoa')) {
    return true;
  }
  return false;
};

// CATALOG VẬT PHẨM TRONG GAME CHO VÒNG QUAY & TỰ ĐỘNG LẤY DỮ LIỆU
export const IN_GAME_REWARD_CATALOG = {
  game_shoes_legendary: {
    id: 'game_shoes_legendary',
    name: 'Giày Thần Tốc (Huyền Thoại)',
    badge: '👟 Giày HT (Pity 121)',
    label: 'Số lượng Giày tặng',
    unit: 'Đôi',
    defaultValue: 1,
    defaultRate: '0.5%',
    defaultColor: '#f59e0b',
    image: LEGENDARY_SHOES_IMG,
    desc: '👟 Trang bị Huyền Thoại (+300 Tốc độ). Áp dụng cơ chế Bảo hiểm 121 lần quay.'
  },
  game_essence_stone: {
    id: 'game_essence_stone',
    name: '+5 Đá Tinh Hoa',
    badge: '💎 Đá Tinh Hoa',
    label: 'Số lượng Đá Tinh Hoa tặng',
    unit: 'Viên',
    defaultValue: 5,
    defaultRate: '10%',
    defaultColor: '#a855f7',
    image: '/game-assets/da_tinh_hoa.png',
    desc: '💎 Đá quý chứa tinh hoa trời đất, tự động chuyển vào túi đồ nhân vật game để nâng cấp Level Kỹ Năng Nhẫn Thần Binh.'
  },
  game_ring_crystal: {
    id: 'game_ring_crystal',
    name: '+10 Viên Tinh Thể',
    badge: '🔮 Viên Tinh Thể',
    label: 'Số lượng Tinh Thể tặng',
    unit: 'Viên',
    defaultValue: 10,
    defaultRate: '10%',
    defaultColor: '#ec4899',
    image: '/game-assets/ring_crystal.png',
    desc: '🔮 Tinh thể tinh khiết tự động chuyển vào túi đồ nhân vật game để cường hóa, tăng sao và đột phá Nhẫn Thần Binh.'
  },
  game_attacks: {
    id: 'game_attacks',
    name: '+50.000 Lượt Đánh Boss',
    badge: '⚔️ Lượt Đánh',
    label: 'Số lượng lượt đánh tặng',
    unit: 'Lượt',
    defaultValue: 50000,
    defaultRate: '15%',
    defaultColor: '#3b82f6',
    image: '/game-assets/weapon_song_dao.png',
    desc: '⚔️ Tự động cộng số lượt đánh Boss vào nhân vật game (vĩnh viễn).'
  },
  game_boss_chests: {
    id: 'game_boss_chests',
    name: '+3 Hòm Boss',
    badge: '📦 Hòm Boss',
    label: 'Số lượng Hòm Boss tặng',
    unit: 'Hòm',
    defaultValue: 3,
    defaultRate: '20%',
    defaultColor: '#10b981',
    image: '/game-assets/mystery_box_closed.png',
    desc: '📦 Tự động gửi Hòm Boss thường vào túi đồ nhân vật game.'
  },
  game_royal_chests: {
    id: 'game_royal_chests',
    name: '+1 Hòm Hoàng Kim',
    badge: '👑 Hòm HK',
    label: 'Số lượng Hòm HK tặng',
    unit: 'Hòm HK',
    defaultValue: 1,
    defaultRate: '5%',
    defaultColor: '#8b5cf6',
    image: '/game-assets/royal_chest.png',
    desc: '👑 Tự động gửi Hòm Hoàng Kim cao cấp vào túi đồ nhân vật game.'
  },
  game_coins: {
    id: 'game_coins',
    name: '+20 Xu Nâng Cấp',
    badge: '🪙 Xu Game',
    label: 'Số lượng Xu Nâng Cấp tặng',
    unit: 'Xu',
    defaultValue: 20,
    defaultRate: '5%',
    defaultColor: '#eab308',
    image: '/game-assets/gold_coin.png',
    desc: '🪙 Tự động cộng Xu Nâng Cấp Boss vào nhân vật game.'
  }
};
