// -*- coding: utf-8 -*-
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Crown, PlusCircle, Trash2, Edit3, Save, Clock, 
  Search, Filter, Image as ImageIcon, Check, X, Shield, RefreshCw 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import allGameItems from '../all_game_items.json';
import { LEGENDARY_HAT_IMG } from '../hatAsset';

const DEFAULT_WIZARD_ITEMS = [
  {
    id: 'hat_wizard_legendary',
    name: 'Nón Phù Thủy Tối Thượng (Huyền Thoại)',
    category: 'Trang bị Nón',
    type: 'hat',
    value: 1,
    rate: 0.5,
    color: '#f59e0b',
    image: '/game-assets/hat_wizard_legendary.png',
    isLegendary: true,
    is_special: true,
    desc: 'Mũ Phù Thủy Huyền Thoại (+450 Phép & +250 Kháng Phép). Áp dụng bảo hiểm 120 lượt chắc chắn nhận!'
  },
  {
    id: 'item_the_reroll_sieucap',
    name: 'Thẻ Reroll Siêu Cấp',
    category: 'Vật phẩm tiêu hao',
    type: 'consumable',
    value: 1,
    rate: 4.5,
    color: '#ec4899',
    image: '/game-assets/item_the_reroll_sieucap.png',
    isLegendary: false,
    desc: 'Tẩy toàn bộ chỉ số trang bị và đảm bảo ít nhất 2 dòng Cam/Đỏ tối thượng!'
  },
  {
    id: 'item_the_dotpha_giay',
    name: 'Thẻ Đột Phá Giày Thần Tốc',
    category: 'Vật phẩm tiêu hao',
    type: 'consumable',
    value: 1,
    rate: 8.0,
    color: '#a855f7',
    image: '/game-assets/item_the_dotpha_giay.png',
    isLegendary: false,
    desc: 'Đột phá tăng bậc và mở khóa hiệu ứng ẩn cho Giày Thần Tốc.'
  },
  {
    id: 'item_spin_ticket_5',
    name: '5 Thẻ may mắn',
    category: 'Thẻ sự kiện',
    type: 'ticket',
    value: 5,
    rate: 12.0,
    color: '#3b82f6',
    image: '/game-assets/item_spin_ticket_5.png',
    isLegendary: false,
    desc: 'Nhận ngay +5 Thẻ may mắn (Lượt chơi chung Vòng Quay & Lật Thẻ Phù Thủy).'
  },
  {
    id: 'item_attack_turn',
    name: '+3 Lượt Đánh Boss',
    category: 'Vật phẩm tiêu hao',
    type: 'consumable',
    value: 3,
    rate: 15.0,
    color: '#10b981',
    image: '/game-assets/item_attack_turn.png',
    isLegendary: false,
    desc: 'Tăng ngay 3 lượt khiêu chiến Boss Thế Giới để săn trang bị quý hiếm.'
  },
  {
    id: 'gem_ruby',
    name: '500 Hồng Thạch (Ruby)',
    category: 'Tiền tệ',
    type: 'ruby',
    value: 500,
    rate: 18.0,
    color: '#f43f5e',
    image: '/game-assets/gem_ruby.png',
    isLegendary: false,
    desc: '500 Hồng ngọc quý hiếm dùng để mua vật phẩm cao cấp.'
  },
  {
    id: 'currency_coins',
    name: '50.000 Xu Nâng Cấp',
    category: 'Tiền tệ',
    type: 'coins',
    value: 50000,
    rate: 22.0,
    color: '#eab308',
    image: '/game-assets/currency_coins.png',
    isLegendary: false,
    desc: '50.000 Xu dùng để cường hóa trang bị và nâng cấp kỹ năng.'
  },
  {
    id: 'item_the_reroll',
    name: 'Thẻ Tẩy Luyện Thường',
    category: 'Vật phẩm tiêu hao',
    type: 'consumable',
    value: 2,
    rate: 20.0,
    color: '#06b6d4',
    image: '/game-assets/item_the_reroll.png',
    isLegendary: false,
    desc: 'Tẩy lại 1 dòng chỉ số bất kỳ của trang bị.'
  }
];

export default function WizardAdminPanel(props) {
  const {
    wizardEventConfig: propConfig,
    config,
    setWizardEventConfig: propSetConfig,
    onSaveConfig,
    wizardItems: propItems,
    rewards,
    setWizardItems: propSetItems,
    onSaveRewards,
    showToast
  } = props;

  const wizardEventConfig = propConfig || config || {};
  const setWizardEventConfig = (newCfg) => {
    if (typeof propSetConfig === 'function') propSetConfig(newCfg);
    if (typeof onSaveConfig === 'function') onSaveConfig(newCfg);
  };

  const initialItems = (Array.isArray(propItems) && propItems.length > 0)
    ? propItems
    : ((Array.isArray(rewards) && rewards.length > 0) ? rewards : DEFAULT_WIZARD_ITEMS);

  const [wizardItems, setLocalWizardItems] = useState(initialItems);

  useEffect(() => {
    if (Array.isArray(propItems) && propItems.length > 0) setLocalWizardItems(propItems);
    else if (Array.isArray(rewards) && rewards.length > 0) setLocalWizardItems(rewards);
  }, [propItems, rewards]);

  const setWizardItems = (newList) => {
    setLocalWizardItems(newList);
    if (typeof propSetItems === 'function') propSetItems(newList);
    if (typeof onSaveRewards === 'function') onSaveRewards(newList);
  };

  // Event settings state
  const [eventStatus, setEventStatus] = useState(wizardEventConfig?.status || 'hidden');
  const [startTime, setStartTime] = useState(() => {
    if (wizardEventConfig?.start_time || wizardEventConfig?.startTime) {
      try {
        const d = new Date(wizardEventConfig.start_time || wizardEventConfig.startTime);
        return d.toISOString().slice(0, 16);
      } catch (e) {}
    }
    return '2026-10-17T05:00';
  });
  const [pityThreshold, setPityThreshold] = useState(wizardEventConfig?.pity_threshold || wizardEventConfig?.pityTarget || 120);

  // Item editing modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Item form fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('game_attacks');
  const [formValue, setFormValue] = useState(1);
  const [formRate, setFormRate] = useState('10%');
  const [formQuantity, setFormQuantity] = useState(999);
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formImage, setFormImage] = useState('/game-assets/hat_huyen_thoai.png');
  const [formIsSpecial, setFormIsSpecial] = useState(false);
  const [formNotify, setFormNotify] = useState(false);

  // Visual Item Picker state
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');

  // Quick image gallery modal state
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Filtered items in Visual Item Picker
  const filteredCatalog = useMemo(() => {
    return allGameItems.filter(item => {
      const matchSearch = pickerSearch.trim() === '' || 
        item.name.toLowerCase().includes(pickerSearch.toLowerCase()) || 
        item.id.toLowerCase().includes(pickerSearch.toLowerCase());
      
      if (!matchSearch) return false;

      if (pickerCategory === 'all') return true;
      if (pickerCategory === 'hat') return item.category === 'hat';
      if (pickerCategory === 'equipment') return ['weapon', 'armor', 'pants', 'shoes', 'necklace', 'ring', 'pet'].includes(item.category);
      if (pickerCategory === 'chests') return ['boss_chests', 'royal_chests', 'bonus_attacks', 'exp', 'potion', 'revive', 'reset_boss', 'summon_rabbit'].includes(item.category);
      if (pickerCategory === 'cards') return ['reroll_shoes', 'super_reroll', 'limit_break_shoes', 'weaken_card', 'spin_ticket'].includes(item.category);
      if (pickerCategory === 'materials') return item.category === 'material';
      if (pickerCategory === 'currency') return item.category === 'currency';
      return true;
    });
  }, [pickerSearch, pickerCategory]);

  // Unique images available in project for image gallery
  const availableImagesList = useMemo(() => {
    const set = new Set();
    allGameItems.forEach(it => {
      if (it.image) set.add(it.image);
    });
    set.add(LEGENDARY_HAT_IMG);
    set.add('/game-assets/hat_huyen_thoai.png');
    set.add('/game-assets/hat_wizard_legendary.png');
    set.add('/game-assets/shoes_huyen_thoai.png');
    set.add('/game-assets/spin_ticket.png');
    return Array.from(set);
  }, []);

  // Open item modal for creation
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormId(`WIZ_${Date.now()}`);
    setFormName('');
    setFormType('game_attacks');
    setFormValue(1);
    setFormRate('10%');
    setFormQuantity(999);
    setFormColor('#3b82f6');
    setFormImage('/game-assets/hat_huyen_thoai.png');
    setFormIsSpecial(false);
    setFormNotify(false);
    setShowItemModal(true);
  };

  // Open item modal for editing
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormId(item.id);
    setFormName(item.name || '');
    setFormType(item.type || 'game_attacks');
    setFormValue(item.value || 1);
    setFormRate(item.rate || '10%');
    setFormQuantity(item.quantity !== undefined ? item.quantity : 999);
    setFormColor(item.color || '#3b82f6');
    setFormImage(item.image || '');
    setFormIsSpecial(Boolean(item.is_special || item.type === 'game_hat_legendary'));
    setFormNotify(Boolean(item.notify_on_win));
    setShowItemModal(true);
  };

  // Handle click on item in Visual Item Picker (AUTO-FILL)
  const handleSelectFromPicker = (item) => {
    const isHat = item.category === 'hat' || item.name.toLowerCase().includes('nón huyền thoại');
    setFormName(item.name);
    setFormId(item.id.toUpperCase());
    setFormType(isHat ? 'game_hat_legendary' : `game_${item.category}`);
    setFormColor(item.color || '#3b82f6');
    setFormImage(item.image || '/game-assets/hat_huyen_thoai.png');
    setFormIsSpecial(isHat);
    setFormNotify(isHat);
    if (isHat) setFormRate('0.5%');
    setShowPickerModal(false);
    if (typeof showToast === 'function') {
      showToast(`Đã tự động điền thông tin: ${item.name}!`, 'success');
    }
  };

  // Save item (add or update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      if (typeof showToast === 'function') showToast("Vui lòng nhập tên phần thưởng!", "error");
      return;
    }

    const itemObj = {
      id: formId.trim() || `WIZ_${Date.now()}`,
      name: formName.trim(),
      type: formType,
      value: Number(formValue) || 1,
      rate: formRate.trim().endsWith('%') ? formRate.trim() : `${formRate.trim()}%`,
      quantity: Number(formQuantity) || 999,
      color: formColor,
      image: formImage,
      is_special: formIsSpecial,
      notify_on_win: formNotify
    };

    let updatedList = [];
    if (editingItem) {
      updatedList = wizardItems.map(it => it.id === editingItem.id ? itemObj : it);
    } else {
      updatedList = [...wizardItems, itemObj];
    }

    setWizardItems(updatedList);
    localStorage.setItem('shop_wizard_items', JSON.stringify(updatedList));

    try {
      await supabase.from('site_config').upsert({ id: 'wizard_card_items', value: updatedList });
    } catch (err) {}

    setShowItemModal(false);
    if (typeof showToast === 'function') {
      showToast(editingItem ? "Đã cập nhật phần thưởng!" : "Đã thêm phần thưởng mới vào sự kiện!", "success");
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phần thưởng này khỏi sự kiện?")) return;
    const updatedList = wizardItems.filter(it => it.id !== itemId);
    setWizardItems(updatedList);
    localStorage.setItem('shop_wizard_items', JSON.stringify(updatedList));

    try {
      await supabase.from('site_config').upsert({ id: 'wizard_card_items', value: updatedList });
    } catch (err) {}

    if (typeof showToast === 'function') showToast("Đã xóa phần thưởng thành công!", "success");
  };

  // Save event settings
  const handleSaveEventSettings = async (e) => {
    e.preventDefault();
    const formattedStartTime = startTime.includes('+') ? startTime : `${startTime}:00+07:00`;
    const newConfig = {
      status: eventStatus,
      start_time: formattedStartTime,
      pity_threshold: Number(pityThreshold) || 120,
      updated_at: new Date().toISOString()
    };

    setWizardEventConfig(newConfig);
    localStorage.setItem('shop_wizard_config', JSON.stringify(newConfig));

    try {
      await supabase.from('site_config').upsert({ id: 'wizard_event_config', value: newConfig });
    } catch (err) {}

    if (typeof showToast === 'function') {
      showToast("Đã lưu cài đặt sự kiện Phù Thủy thành công!", "success");
    }
  };

  // 1-Click Sample Setup
  const handleInstallSampleRewards = async () => {
    if (!window.confirm("Bạn có muốn tự động cài đặt 8 phần thưởng mẫu chuẩn cho Sự Kiện Phù Thủy (bao gồm Nón Huyền Thoại 0.5% - Bảo hiểm 120 lượt)?")) return;
    
    const sample = [
      { id: 'WIZARD_HAT_LEGENDARY', name: 'Nón Huyền Thoại', type: 'game_hat_legendary', value: 1, rate: '0.5%', quantity: 999, color: '#ffd700', image: LEGENDARY_HAT_IMG, is_special: true, notify_on_win: true },
      { id: 'WIZARD_CRYSTAL', name: '+10 Viên Tinh Thể', type: 'game_ring_crystal', value: 10, rate: '10%', quantity: 999, color: '#ec4899', image: '/game-assets/ring_crystal.png', notify_on_win: false },
      { id: 'WIZARD_STONE', name: '+5 Đá Tinh Hoa', type: 'game_essence_stone', value: 5, rate: '10%', quantity: 999, color: '#a855f7', image: '/game-assets/da_tinh_hoa.png', notify_on_win: false },
      { id: 'WIZARD_ATK', name: '+50.000 Lượt Đánh Boss', type: 'game_attacks', value: 50000, rate: '15%', quantity: 999, color: '#3b82f6', image: '/game-assets/item_attack_turn.png', notify_on_win: false },
      { id: 'WIZARD_CHEST_B', name: '+3 Hòm Boss', type: 'game_boss_chests', value: 3, rate: '20%', quantity: 999, color: '#10b981', image: '/game-assets/mystery_box_closed.png', notify_on_win: false },
      { id: 'WIZARD_CHEST_R', name: '+1 Hòm Hoàng Kim', type: 'game_royal_chests', value: 1, rate: '5%', quantity: 999, color: '#8b5cf6', image: '/game-assets/royal_chest.png', notify_on_win: false },
      { id: 'WIZARD_COINS', name: '+50 Xu Nâng Cấp', type: 'game_coins', value: 50, rate: '10%', quantity: 999, color: '#eab308', image: '/game-assets/gold_coin.png', notify_on_win: false },
      { id: 'WIZARD_NONE', name: 'Chúc may mắn lần sau', type: 'none', value: 0, rate: '29.5%', quantity: 999, color: '#64748b', image: null, notify_on_win: false }
    ];

    setWizardItems(sample);
    localStorage.setItem('shop_wizard_items', JSON.stringify(sample));

    try {
      await supabase.from('site_config').upsert({ id: 'wizard_card_items', value: sample });
    } catch (err) {}

    if (typeof showToast === 'function') {
      showToast("Đã cài đặt 8 phần thưởng mẫu chuẩn Sự Kiện Phù Thủy thành công!", "success");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 text-slate-200">
      
      {/* 1. KHỐI CÀI ĐẶT TRẠNG THÁI & HẸN GIỜ SỰ KIỆN */}
      <div className="bg-[#0B1120] border border-purple-500/30 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <h3 className="text-purple-300 font-bold flex items-center gap-2 text-base sm:text-lg">
            <Clock size={20} className="text-amber-400" />
            Cấu Hình Trạng Thái & Hẹn Giờ Mở Sự Kiện Phù Thủy
          </h3>
          <span className="text-xs text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/30 font-bold">
            Mặc định: 05:00 sáng ngày mai
          </span>
        </div>

        <form onSubmit={handleSaveEventSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1.5">Trạng thái sự kiện</label>
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value)}
              className="w-full p-3 bg-[#151D2F] border border-purple-500/40 rounded-xl text-sm font-bold text-amber-300 outline-none focus:border-purple-400"
            >
              <option value="auto">⏰ Tự động theo giờ (Mở vào 05:00 sáng mai)</option>
              <option value="public">🟢 Luôn bật (Công khai toàn bộ người chơi)</option>
              <option value="hidden">🔴 Đang ẩn (Chỉ Admin thấy để test)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1.5">Hẹn giờ mở tự động (UTC+7)</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 bg-[#151D2F] border border-purple-500/40 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1.5">Mốc nổ Bảo Hiểm (Nón Huyền Thoại)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={pityThreshold}
              onChange={(e) => setPityThreshold(e.target.value)}
              className="w-full p-3 bg-[#151D2F] border border-purple-500/40 rounded-xl text-sm font-bold text-amber-300 outline-none focus:border-purple-400"
              required
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Save size={16} /> Lưu Cài Đặt Sự Kiện
            </button>
          </div>
        </form>
      </div>

      {/* 2. QUẢN LÝ DANH SÁCH PHẦN THƯỞNG */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400" />
              Danh Sách Phần Thưởng Sự Kiện Lật Thẻ ({(wizardItems || []).length} món)
            </h3>
            <p className="text-xs text-slate-400">
              Admin có thể chọn từ 100% kho item game sẵn có hoặc tùy chỉnh tỉ lệ rơi và bảo hiểm.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleInstallSampleRewards}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <RefreshCw size={15} /> Cài Đặt 8 Quà Mẫu Chuẩn
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <PlusCircle size={16} /> Thêm Phần Thưởng Mới
            </button>
          </div>
        </div>

        {/* BẢNG PHẦN THƯỞNG */}
        <div className="bg-[#0B1120] border border-purple-500/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-purple-950/80 border-b border-purple-500/30 text-purple-300">
                  <th className="p-3">Hình Ảnh</th>
                  <th className="p-3">Tên Phần Thưởng</th>
                  <th className="p-3">Mã ID</th>
                  <th className="p-3">Tỉ Lệ (%)</th>
                  <th className="p-3">Số Lượng</th>
                  <th className="p-3">Giải Đặc Biệt</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30">
                {(wizardItems || []).map((item, idx) => {
                  const isHat = item.is_special || item.type === 'game_hat_legendary' || (item.name && item.name.includes('Nón Huyền Thoại'));
                  return (
                    <tr key={item.id || idx} className={`hover:bg-purple-950/30 transition-colors ${isHat ? 'bg-amber-950/30' : ''}`}>
                      <td className="p-3">
                        <div className="w-12 h-12 rounded-lg bg-purple-950/50 border border-purple-500/30 flex items-center justify-center p-1 overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-contain"
                              onError={(e) => { e.target.src = '/game-assets/hat_huyen_thoai.png'; }}
                            />
                          ) : (
                            <span className="text-xl">💨</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-black block ${isHat ? 'text-amber-300' : 'text-white'}`}>
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{item.type || 'item'}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-purple-300">{item.id}</td>
                      <td className="p-3 font-black text-amber-300">{item.rate || '10%'}</td>
                      <td className="p-3 text-slate-300">{item.quantity !== undefined ? item.quantity : 999}</td>
                      <td className="p-3">
                        {isHat ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black">
                            👑 NÓN HUYỀN THOẠI (BẢO HIỂM 120)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Quà thường</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: THÊM / CHỈNH SỬA PHẦN THƯỞNG */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#130b29] border border-purple-500/50 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-purple-950/60"
            >
              <X size={20} />
            </button>

            <div className="border-b border-purple-900/40 pb-3">
              <h3 className="text-xl font-black text-amber-300 flex items-center gap-2">
                {editingItem ? <Edit3 size={20} /> : <PlusCircle size={20} />}
                {editingItem ? 'Chỉnh Sửa Phần Thưởng' : 'Thêm Phần Thưởng Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Sử dụng nút "Chọn từ kho Item game" để tự động điền ID, Tên và Hình ảnh chuẩn xác nhất.
              </p>
            </div>

            {/* NÚT MỞ BỘ CHỌN ITEM THÔNG MINH */}
            <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Bộ Chọn Vật Phẩm Game (Visual Item Picker)</span>
                <span className="text-[11px] text-purple-300">Quét 100% kho vật phẩm & hình ảnh trong game</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPickerModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Search size={14} /> Chọn Từ Kho Item
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Mã ID Phần Thưởng</label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full p-2.5 bg-[#1c1238] border border-purple-500/30 rounded-xl text-xs font-mono text-white outline-none focus:border-purple-400"
                    placeholder="WIZARD_HAT_LEGENDARY"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Tên Phần Thưởng Hiển Thị</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 bg-[#1c1238] border border-purple-500/30 rounded-xl text-xs font-bold text-amber-300 outline-none focus:border-purple-400"
                    placeholder="Nón Huyền Thoại"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Tỉ Lệ Rơi (%)</label>
                  <input
                    type="text"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full p-2.5 bg-[#1c1238] border border-purple-500/30 rounded-xl text-xs font-black text-rose-400 outline-none focus:border-purple-400"
                    placeholder="0.5%"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Số Lượng Kho</label>
                  <input
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full p-2.5 bg-[#1c1238] border border-purple-500/30 rounded-xl text-xs font-bold text-white outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Giá Trị Cộng (Value)</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full p-2.5 bg-[#1c1238] border border-purple-500/30 rounded-xl text-xs font-bold text-white outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* HÌNH ẢNH & PREVIEW */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-bold">Hình Ảnh Phần Thưởng</label>
                  <button
                    type="button"
                    onClick={() => setShowImageGallery(true)}
                    className="text-xs text-purple-300 hover:text-white font-bold flex items-center gap-1 underline"
                  >
                    <ImageIcon size={14} /> Đổi ảnh từ kho ảnh có sẵn
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-purple-950/60 border border-purple-500/40 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {formImage ? (
                      <img 
                        src={formImage} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/game-assets/hat_huyen_thoai.png'; }}
                      />
                    ) : (
                      <span className="text-xl">💨</span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={formImage || ''}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="flex-1 p-2.5 bg-[#1c1238] border border-purple-500/30 rounded-xl text-xs font-mono text-slate-300 outline-none focus:border-purple-400"
                    placeholder="/game-assets/hat_huyen_thoai.png hoặc URL ảnh..."
                  />
                </div>
              </div>

              {/* CHECKBOXES: BẢO HIỂM & THÔNG BÁO */}
              <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsSpecial}
                    onChange={(e) => setFormIsSpecial(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <Crown size={15} /> Đặt làm Giải Đặc Biệt / Bảo Hiểm (Nón Huyền Thoại)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNotify}
                    onChange={(e) => setFormNotify(e.target.checked)}
                    className="w-4 h-4 accent-purple-400 rounded"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    Phát thông báo chúc mừng trên Discord Bot & Website khi trúng
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <Save size={15} /> Lưu Phần Thưởng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VISUAL ITEM PICKER (CHỌN 100% KHO ITEM GAME SẴN CÓ) */}
      {showPickerModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#120a26] border-2 border-purple-500/60 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] flex flex-col">
            
            <button
              onClick={() => setShowPickerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-purple-950/60"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300 flex items-center gap-2">
                <Sparkles size={22} className="text-amber-300" />
                Kho Vật Phẩm & Hình Ảnh Game (Visual Item Picker)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Nhấp chuột vào bất kỳ vật phẩm nào để hệ thống tự động điền Mã ID, Tên, Loại và Hình ảnh.
              </p>
            </div>

            {/* THANH TÌM KIẾM & BỘ LỌC LOẠI */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc mã ID (ví dụ: Nón, Kiếm, Giáp, Đá, Rương...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1b1036] border border-purple-500/30 rounded-xl text-xs font-bold text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'hat', label: 'Nón & Bảo Vật' },
                  { id: 'equipment', label: 'Trang Bị' },
                  { id: 'chests', label: 'Rương & Lượt' },
                  { id: 'cards', label: 'Thẻ Chức Năng' },
                  { id: 'materials', label: 'Nguyên Liệu' },
                  { id: 'currency', label: 'Tiền Tệ' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setPickerCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                      pickerCategory === cat.id 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DANH SÁCH ITEM GRID */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pr-1">
              {filteredCatalog.map((item, idx) => {
                const isHat = item.category === 'hat';
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => handleSelectFromPicker(item)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group hover:scale-[1.02] ${
                      isHat 
                        ? 'bg-gradient-to-r from-amber-950/60 to-purple-950/60 border-amber-400/60 hover:border-amber-400' 
                        : 'bg-[#180e33]/80 border-purple-500/20 hover:border-purple-500/60 hover:bg-purple-950/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 p-1 flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                          onError={(e) => { e.target.src = '/game-assets/hat_huyen_thoai.png'; }}
                        />
                      ) : (
                        <span className="text-xl">💨</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black truncate block ${isHat ? 'text-amber-300' : 'text-white'}`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-purple-300/80 font-mono">{item.id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/50 text-slate-300 font-bold">
                          {item.tier || item.category}
                        </span>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-300 text-xs font-bold pr-2">
                      Chọn ➔
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: KHO ẢNH SẴN CÓ ĐỂ ĐỔI NHANH (IMAGE GALLERY) */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#120a26] border-2 border-purple-500/60 rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            
            <button
              onClick={() => setShowImageGallery(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-purple-950/60"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                <ImageIcon size={20} /> Thư Viện Ảnh Vật Phẩm Sẵn Có
              </h3>
              <p className="text-xs text-slate-400">
                Nhấp chuột vào bất kỳ biểu tượng nào để đổi ảnh ngay lập tức.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 pr-1">
              {availableImagesList.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormImage(imgUrl);
                    setShowImageGallery(false);
                    if (typeof showToast === 'function') showToast("Đã đổi hình ảnh!", "success");
                  }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-950/60 border p-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:border-amber-400 ${
                    formImage === imgUrl ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-purple-500/30'
                  }`}
                >
                  <img 
                    src={imgUrl} 
                    alt="Asset" 
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
