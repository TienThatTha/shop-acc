import React from 'react';
import {
  User, Phone, ShieldCheck, CheckCircle2, LogOut, Key, Wallet, Gamepad2, X,
  Clock, Flame, History, Target, Gift, QrCode, Copy, Check, AlertCircle,
  RefreshCw, ChevronDown, ChevronUp, Sparkles, Ticket, MessageCircle, Send,
  Eye, EyeOff, ArrowLeftRight, RotateCcw, Swords, Link
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getRecordTime, getActiveStatus, enforceNumberInput, getCustomerFriendlyError } from '../utils/shopHelpers';

export const SecurityScreen = ({
  currentUser, setCurrentView, showToast, setCurrentUser, setUsersDb, usersDb,
  setProfileTab, profileTab, calculateTotalRecharged, verifyCooldown, handleSendVerification,
  showOldPass, setShowOldPass, showNewPass, setShowNewPass, showConfirmPass, setShowConfirmPass,
  messagesDb, setMessagesDb, messagesEndRef, unreadCount, sendAdminAlert, setConfirmDialog, renderNavbar
}) => {
  if (!currentUser) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-300">
      <AlertCircle size={60} className="text-yellow-500 mb-4 animate-bounce" />
      <h2 className="text-2xl font-bold text-white mb-4">Phiên đăng nhập đã hết hạn</h2>
      <p className="text-slate-400 mb-6">Vui lòng đăng nhập lại để xem thông tin cá nhân của bạn.</p>
      <button onClick={() => setCurrentView('login')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20">
        Đi Trở Về Form Đăng Nhập
      </button>
    </div>
  );

  // ... tất cả code còn lại của hàm giữ nguyên ...
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    const newEmail = e.target.email.value;
    const newPhone = e.target.phone.value;
    const newName = e.target.name.value;

    // 1. Cập nhật bảng 'users' trước để giao diện hiện đúng
    const updatePayload = { name: newName, phone: newPhone, email: newEmail };

    // Nếu đổi email → reset trạng thái xác thực
    if (newEmail !== currentUser.email) {
      updatePayload.is_email_verified = false;
    }

    const { error: dbError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', currentUser?.id);

    if (dbError) return showToast("Lỗi cập nhật bảng: " + dbError.message, 'error');

    // 2. Nếu đổi email, phải báo cho hệ thống Auth
    if (newEmail !== currentUser.email) {
      const { error: authErr } = await supabase.auth.updateUser({ email: newEmail });
      if (authErr) {
        return showToast("Lỗi Auth: " + authErr.message, 'error');
      }
      showToast("Đã đổi Email! Bạn cần xác thực lại Email mới.", 'success');
    } else {
      showToast("Đã cập nhật thông tin thành công!");
    }

    // Cập nhật lại state cục bộ để web không bị treo
    const updatedUser = {
      ...currentUser,
      name: newName,
      phone: newPhone,
      email: newEmail,
      ...(newEmail !== currentUser.email ? { is_email_verified: false } : {})
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
    setUsersDb(usersDb.map(u => u.id === currentUser?.id ? updatedUser : u));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newPass = e.target.newPass.value;
    if (e.target.newPass.value !== e.target.confirmPass.value) return showToast("Mật khẩu xác nhận không khớp!", 'error');

    // 1. Cập nhật mật khẩu THẬT trong hệ thống đăng nhập
    const { error: authErr } = await supabase.auth.updateUser({ password: newPass });
    if (authErr) return showToast("Lỗi: " + authErr.message, 'error');

    // 2. Cập nhật mật khẩu trong bảng users (để Admin quản lý nếu cần)
    await supabase.from('users').update({ password: newPass }).eq('id', currentUser?.id);

    setCurrentUser({ ...currentUser, password: newPass });
    showToast("Đổi mật khẩu đăng nhập thành công!");
    e.target.reset();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const input = e.target.message.value.trim();
    if (!input || !currentUser) return;

    // Tìm ID của Admin thật trong hệ thống
    let adminId = null;
    if (usersDb && usersDb.length > 0) {
      const adminUser = usersDb.find(u => u.role?.toLowerCase() === 'admin');
      if (adminUser) adminId = adminUser.id;
    }

    // Nếu không có trong RAM (Khách không load usersDb), tự động gọi DB để tìm Admin
    if (!adminId) {
      const { data } = await supabase.from('users').select('id, role');
      if (data) {
        const foundAdmin = data.find(u => u.role?.toLowerCase() === 'admin');
        if (foundAdmin) adminId = foundAdmin.id;
      }
    }

    if (!adminId) return showToast("Hiện tại không có Admin trực tuyến!", "error");

    const newMsg = {
      id: `MSG${Date.now()}`,
      senderId: currentUser?.id,
      receiverId: adminId, // Gửi đến đúng ID Admin
      content: input,
      timestamp: Date.now(),
      isRead: false
    };

    // Optimistic update để hiện ngay lên màn hình
    setMessagesDb(prev => {
      if (prev.find(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    await supabase.from('messages').insert([newMsg]);
    e.target.reset();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    sendAdminAlert('TIN NHẮN HỖ TRỢ', `Khách ${currentUser?.name} vừa nhắn: "${input}"`);
  };

  const userMessages = messagesDb.filter(m => m.senderId === currentUser?.id || m.receiverId === currentUser?.id);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
      {renderNavbar()}
      <main className="w-full max-w-[1400px] mx-auto px-4 lg:pr-28 pt-4 md:pt-6 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-800 scrollbar-hide">
          <button onClick={() => setProfileTab('info')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 ${profileTab === 'info' ? 'bg-blue-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}><User size={18} /> Quản lý chung</button>
          <button onClick={() => setProfileTab('transfer')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 ${profileTab === 'transfer' ? 'bg-emerald-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}><ArrowLeftRight size={18} /> Chuyển tiền</button>
          <button onClick={() => setProfileTab('vip')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 ${profileTab === 'vip' ? 'bg-yellow-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}><Sparkles size={18} /> VIP</button>
          {currentUser?.role !== 'admin' && (
            <button onClick={() => setProfileTab('inbox')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 relative ${profileTab === 'inbox' ? 'bg-rose-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}>
              <MessageCircle size={18} /> Hộp thư hỗ trợ
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
            </button>
          )}
        </div>

        {profileTab === 'info' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Thông tin cá nhân</h3>
              <form className="space-y-4" onSubmit={handleUpdateInfo}>
                <div><label className="text-xs text-slate-400 mb-1 block">Tên hiển thị</label><input name="name" defaultValue={currentUser?.name} className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none text-white" required /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-slate-400 mb-1 block">Số điện thoại</label><input name="phone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} defaultValue={currentUser?.phone} className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 outline-none text-white" required title="Nhập 10-11 số" /></div>
                  <div><div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-xs text-slate-400 block">Email</label>
                      {currentUser?.is_email_verified ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={12} /> Đã xác thực</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendVerification}
                          disabled={verifyCooldown > 0}
                          className={`text-[10px] text-white font-bold px-2 py-0.5 rounded shadow-lg transition-colors flex items-center gap-1 ${verifyCooldown > 0 ? 'bg-slate-600 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'}`}
                        >
                          {verifyCooldown > 0 ? <><Clock size={12} className="animate-pulse" /> Gửi lại sau {verifyCooldown}s</> : 'Chưa xác thực (Bấm để xác nhận)'}
                        </button>)}
                    </div>
                    <input name="email" type="email" defaultValue={currentUser?.email} className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 outline-none text-white" required />
                  </div></div>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg w-full md:w-auto">Lưu thông tin</button>
              </form>
            </div>

            <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2"><Key size={18} className="text-rose-500" /> Đổi mật khẩu</h3>
              <form className="space-y-4" onSubmit={handleChangePassword}>
                <div className="relative">
                  <input name="oldPass" type={showOldPass ? "text" : "password"} placeholder="Mật khẩu hiện tại" className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none text-white pr-12" required />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-[14px] text-slate-500 hover:text-white transition-colors">
                    {showOldPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input name="newPass" type={showNewPass ? "text" : "password"} placeholder="Mật khẩu mới" className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none text-white pr-12" required />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-[14px] text-slate-500 hover:text-white transition-colors">
                      {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input name="confirmPass" type={showConfirmPass ? "text" : "password"} placeholder="Nhập lại mật khẩu mới" className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none text-white pr-12" required />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-[14px] text-slate-500 hover:text-white transition-colors">
                      {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg w-full md:w-auto">Cập nhật mật khẩu</button>
              </form>
            </div>
            <button onClick={() => {
              setConfirmDialog({
                title: 'Đăng xuất', message: 'Bạn có chắc muốn đăng xuất khỏi hệ thống?',
                onConfirm: async () => {
                  await supabase.auth.signOut();
                  localStorage.removeItem('shop_cached_user'); // <--- Hủy hoàn toàn phiên đăng nhập ngầm
                  localStorage.removeItem('shop_user_id');
                  setCurrentUser(null);
                  setCurrentView('dashboard');
                  showToast("Đã đăng xuất an toàn!");
                }
              });
            }} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-xl flex items-center justify-center gap-2 border border-red-500/20 font-bold transition-colors">
              <LogOut size={18} /> Đăng xuất tài khoản
            </button>
          </div>
        )}

        {profileTab === 'transfer' && (() => {
          const senderIsVip = calculateTotalRecharged(currentUser?.id) >= 3000000;
          const TRANSFER_FEE_RATE = 0.025; // 2.5%
          return (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><ArrowLeftRight size={20} className="text-emerald-500" /> Chuyển tiền cho người khác</h3>
                <p className="text-xs text-slate-400 mb-4">Chuyển số dư chính (không bao gồm Quỹ Bảo Lưu) sang tài khoản khác trong hệ thống. Nhập SĐT người nhận để tìm kiếm.</p>

                {/* THÔNG BÁO PHÍ CHUYỂN TIỀN */}
                {senderIsVip ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                    <Sparkles size={20} className="text-yellow-500 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold text-yellow-400">Đặc quyền VIP: Miễn phí chuyển tiền!</p>
                      <p className="text-[11px] text-yellow-500/70">Bạn được miễn toàn bộ phí giao dịch chuyển tiền.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                    <AlertCircle size={20} className="text-rose-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-rose-400">Phí chuyển tiền: 2.5%</p>
                      <p className="text-[11px] text-rose-400/70">Nâng cấp VIP (nạp tích lũy 3 triệu) để được miễn phí chuyển tiền.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const phone = e.target.receiverPhone.value.trim();
                  const amount = parseInt(e.target.transferAmount.value);

                  if (!phone || !amount || amount <= 0) return showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
                  if (amount < 1000) return showToast('Số tiền chuyển tối thiểu là 1.000đ!', 'error');

                  // Tính phí chuyển tiền (VIP miễn phí)
                  const fee = senderIsVip ? 0 : Math.ceil(amount * TRANSFER_FEE_RATE);
                  const totalDeduct = amount + fee;

                  if (currentUser.balance < totalDeduct) return showToast(`Số dư không đủ! Cần ${new Intl.NumberFormat('vi-VN').format(totalDeduct)}đ (gồm phí ${new Intl.NumberFormat('vi-VN').format(fee)}đ). Bạn chỉ có ${new Intl.NumberFormat('vi-VN').format(currentUser.balance)}đ.`, 'error');

                  // Tìm người nhận theo SĐT
                  const receiver = usersDb.find(u => u.phone === phone);
                  if (!receiver) {
                    // Nếu không có trong RAM, thử gọi DB
                    const { data: dbUser } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('phone', phone).single();
                    if (!dbUser) return showToast('Không tìm thấy tài khoản với SĐT này!', 'error');
                    // Tìm thấy trên DB
                    handleTransferMoney(dbUser, amount, fee, totalDeduct, e.target);
                  } else {
                    if (receiver.id === currentUser.id) return showToast('Không thể chuyển tiền cho chính mình!', 'error');
                    handleTransferMoney(receiver, amount, fee, totalDeduct, e.target);
                  }

                  async function handleTransferMoney(receiver, amount, fee, totalDeduct, formEl) {
                    if (receiver.id === currentUser.id) return showToast('Không thể chuyển tiền cho chính mình!', 'error');
                    if (currentUser.balance < totalDeduct) return showToast(`Số dư không đủ! Cần ${new Intl.NumberFormat('vi-VN').format(totalDeduct)}đ.`, 'error');

                    const feeText = fee > 0
                      ? `\n\nPhí chuyển tiền (2.5%): ${new Intl.NumberFormat('vi-VN').format(fee)}đ\nTổng trừ: ${new Intl.NumberFormat('vi-VN').format(totalDeduct)}đ`
                      : '\n\n✨ VIP: Miễn phí chuyển tiền!';

                    setConfirmDialog({
                      title: 'Xác nhận chuyển tiền',
                      message: `Chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho "${receiver.name}" (SĐT: ${receiver.phone})?${feeText}\n\nSố dư sau giao dịch: ${new Intl.NumberFormat('vi-VN').format(currentUser.balance - totalDeduct)}đ`,
                      onConfirm: async () => {
                        // 1. Lấy dữ liệu sống từ DB
                        const { data: liveSender } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', currentUser.id).single();
                        const { data: liveReceiver } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', receiver.id).single();
                        if (!liveSender || !liveReceiver) return showToast('Lỗi hệ thống!', 'error');
                        if (liveSender.balance < totalDeduct) return showToast('Số dư không đủ (đã tính phí)!', 'error');

                        // 2. Ghi lịch sử giao dịch cho CẢ HAI
                        const now = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN');
                        const feeNote = fee > 0 ? ` (Phí: ${new Intl.NumberFormat('vi-VN').format(fee)}đ)` : ' (VIP miễn phí)';

                        const txSender = {
                          id: `TF${Date.now()}S`, user: liveSender.name,
                          action: `Chuyển tiền cho ${liveReceiver.name} (${liveReceiver.phone})${feeNote}`,
                          amount: -totalDeduct, date: now, status: 'Thành công', type: 'transfer_out',
                          accDetails: { balanceAfter: liveSender.balance - totalDeduct, fundAfter: liveSender.rentFund || 0, fee: fee, originalAmount: amount }
                        };
                        const txReceiver = {
                          id: `TF${Date.now()}R`, user: liveReceiver.name,
                          action: `Nhận tiền từ ${liveSender.name} (${liveSender.phone})`,
                          amount: amount, date: now, status: 'Thành công', type: 'transfer_in',
                          accDetails: { balanceAfter: liveReceiver.balance + amount, fundAfter: liveReceiver.rentFund || 0 }
                        };

                        // 3. Gọi RPC an toàn trên Backend
                        const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_transfer_money', {
                          p_receiver_phone: receiver.phone,
                          p_amount: amount,
                          p_fee: fee,
                          p_tx_sender: txSender,
                          p_tx_receiver: txReceiver
                        });

                        if (rpcError || !rpcData?.success) {
                          return showToast(rpcError?.message || rpcData?.message || 'Lỗi chuyển tiền!', 'error');
                        }

                        // 5. Cập nhật giao diện
                        const updatedSender = { ...currentUser, balance: liveSender.balance - totalDeduct };
                        setCurrentUser(updatedSender);
                        localStorage.setItem('shop_cached_user', JSON.stringify(updatedSender));
                        setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedSender : u.id === receiver.id ? { ...u, balance: liveReceiver.balance + amount } : u));

                        formEl.reset();
                        const successMsg = fee > 0
                          ? `Đã chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho ${liveReceiver.name}! (Phí: ${new Intl.NumberFormat('vi-VN').format(fee)}đ)`
                          : `Đã chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho ${liveReceiver.name} thành công!`;
                        showToast(successMsg);
                        sendAdminAlert('CHUYỂN TIỀN', `${liveSender.name} vừa chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho ${liveReceiver.name}.${fee > 0 ? ` Phí: ${new Intl.NumberFormat('vi-VN').format(fee)}đ.` : ' (VIP miễn phí)'}`);
                      }
                    });
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">SĐT người nhận</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input name="receiverPhone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} required placeholder="Nhập số điện thoại..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-emerald-500 outline-none text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Số tiền chuyển (VNĐ)</label>
                    <div className="relative">
                      <Wallet size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input name="transferAmount" type="number" min="1000" required placeholder="Nhập số tiền..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-emerald-500 outline-none text-white" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Số dư hiện có: <strong className="text-emerald-400">{new Intl.NumberFormat('vi-VN').format(currentUser.balance)}đ</strong> (Quỹ thuê không được tính)</p>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2">
                    <ArrowLeftRight size={18} /> Chuyển tiền
                  </button>
                </form>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="text-yellow-400 font-bold">Lưu ý quan trọng:</p>
                    <p>• Phí chuyển tiền: <strong className="text-rose-400">2.5%</strong> trên số tiền chuyển. Khách hàng <strong className="text-yellow-400">VIP được miễn phí</strong>.</p>
                    <p>• Chỉ chuyển được <strong className="text-white">Số dư chính</strong>, không chuyển được Quỹ Bảo Lưu Thuê.</p>
                    <p>• Giao dịch chuyển tiền <strong className="text-white">không thể hoàn tác</strong>. Hãy kiểm tra kỹ SĐT trước khi xác nhận.</p>
                    <p>• Mọi giao dịch đều được ghi lại trong Lịch sử và thông báo cho Admin.</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {profileTab === 'vip' && (
          <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            {/* BANNER VIP */}
            <div className="w-full bg-gradient-to-br from-yellow-600/20 to-amber-900/20 border border-yellow-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <Sparkles size={50} className="text-yellow-500 mb-3 animate-pulse" />
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1 uppercase tracking-tighter">Khách Hàng VIP</h2>
              <p className="text-yellow-500/80 font-medium text-sm">Nâng tầm trải nghiệm - Khẳng định đẳng cấp</p>
            </div>

            {/* THANH TIẾN TRÌNH */}
            <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tiến trình VIP</span>
                <span className="text-sm font-black text-yellow-500">
                  {new Intl.NumberFormat('vi-VN').format(calculateTotalRecharged(currentUser?.id))} / 3.000.000đ
                </span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.4)] transition-all duration-1000 rounded-full"
                  style={{ width: `${Math.min((calculateTotalRecharged(currentUser?.id) / 3000000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                {calculateTotalRecharged(currentUser?.id) >= 3000000
                  ? '🎉 Chúc mừng! Bạn đã đạt hạng VIP và được hưởng đầy đủ đặc quyền!'
                  : `Cần nạp thêm ${new Intl.NumberFormat('vi-VN').format(3000000 - calculateTotalRecharged(currentUser?.id))}đ để lên VIP`}
              </p>
            </div>

            {/* ĐẶC QUYỀN VIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#151D2F] border border-slate-800 p-5 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold text-yellow-500 mb-4 flex items-center gap-2"><Target size={18} /> Cách thức lên VIP</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                    <span>Tổng tiền nạp tích lũy đạt từ <strong className="text-white">3.000.000 VNĐ</strong> trở lên.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                    <span>Hệ thống tự động nâng cấp ngay khi bạn đủ điều kiện.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#151D2F] border border-slate-800 p-5 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold text-rose-500 mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Đặc quyền VIP</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><ShieldCheck size={16} /></div>
                    <span><strong className="text-white">MIỄN CCCD:</strong> Thuê acc không cần chụp giấy tờ.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Wallet size={16} /></div>
                    <span><strong className="text-white">MIỄN CỌC:</strong> Không bị thu 500k tiền cọc an toàn.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500"><ArrowLeftRight size={16} /></div>
                    <span><strong className="text-white">MIỄN PHÍ CHUYỂN TIỀN:</strong> Không mất phí 2.5% khi chuyển tiền.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {profileTab === 'inbox' && (
          <div className="bg-[#151D2F] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[calc(100vh-280px)] md:h-[60vh] min-h-[350px] max-h-[800px]">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#0B1120] rounded-t-2xl">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center"><Gamepad2 size={20} /></div>
              <div>
                <h3 className="font-bold text-white">Admin Hệ Thống Shop</h3>
                {(() => {
                  const adminUser = usersDb.find(u => u.role?.toLowerCase() === 'admin');
                  const status = getActiveStatus(adminUser?.last_active);
                  return (
                    <p className={`text-[10px] flex items-center gap-1 ${status.isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <span className={`w-2 h-2 rounded-full block ${status.isOnline ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                      {status.isOnline ? 'Đang trực tuyến' : (status.text === 'Ngoại tuyến' ? 'Ngoại tuyến' : `Hoạt động: ${status.text}`)}
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
              {userMessages.length === 0 ? <p className="text-center text-slate-500 mt-10 text-sm">Chưa có tin nhắn nào. Hãy gửi lời chào đến Admin!</p> : (
                userMessages.sort((a, b) => a.timestamp - b.timestamp).map(m => {
                  const isMine = m.senderId === currentUser?.id;
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                        <p className="text-sm">{m.content}</p>
                        <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(m.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 border-t border-slate-800 bg-[#0B1120] rounded-b-2xl">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                <input name="message" type="text" placeholder="Nhập tin nhắn..." className="flex-1 bg-[#151D2F] border border-slate-700 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" autoComplete="off" />
                <button type="submit" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 shrink-0 transition-colors"><Send size={18} /></button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export const NaptienScreen = ({
  renderNavbar, renderFooter, currentUser, depositRequests, setDepositRequests,
  depositAmount, setDepositAmount, voucherInput, setVoucherInput, vouchersDb,
  isDepositing, setIsDepositing, showToast, setPayosPaymentData, payosPaymentData,
  setPayosSuccess, payosSuccess, payosTimeLeft, depositMethod,
  setDepositMethod, cardTelco, setCardTelco, cardAmount, setCardAmount,
  cardCode, setCardCode, cardSerial, setCardSerial, liveCardError, setLiveCardError,
  formatPayosTime, handleCancelDepositClient, visibleDepsClient, setVisibleDepsClient,
  copyToClipboard, sendAdminAlert, isGlobalProcessing, setIsGlobalProcessing
}) => {
  // 1. TẠO BIẾN KIỂM TRA LỆNH ĐANG CHỜ DUYỆT
  const hasPendingRequest = depositRequests.some(d => d.userId === currentUser?.id && d.status === 'Chờ duyệt' && d.type !== 'live_donate');
  const activePendingBankingReq = depositRequests.find(d => d.userId === currentUser?.id && d.status === 'Chờ duyệt' && d.type !== 'card' && d.type !== 'live_donate');
  const displayAmount = activePendingBankingReq ? activePendingBankingReq.amount : null;

  const handleCreatePayosLink = async (e) => {
    e.preventDefault();
    if (hasPendingRequest) {
      return showToast("Bạn đang có lệnh nạp chờ duyệt. Vui lòng đợi Admin xử lý!", "error");
    }
    const parsedAmount = parseInt(depositAmount.toString().replace(/\D/g, ''));
    if (!parsedAmount || parsedAmount < 10000) return showToast("Số tiền tối thiểu 10.000đ", 'error');

    let bonusAmount = 0;
    let bonusSpins = 0;
    let appliedVoucher = null;

    if (voucherInput.trim() !== '') {
      const validVoucher = vouchersDb.find(v => v.code === voucherInput.trim().toUpperCase() && v.isActive);
      if (!validVoucher) {
        setIsGlobalProcessing(false);
        return showToast("Mã voucher không hợp lệ hoặc đã bị vô hiệu hóa!", 'error');
      }
      bonusAmount = (parsedAmount * (validVoucher.percent || 0)) / 100;
      bonusSpins = validVoucher.bonusSpins || 0;
      appliedVoucher = validVoucher.code;
    }

    if (isGlobalProcessing) return;
    setIsGlobalProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('payos-create-payment', {
        body: {
          amount: parsedAmount,
          userId: currentUser.id,
          phone: currentUser.phone || currentUser.name,
          bonusAmount: bonusAmount,
          voucherSpins: bonusSpins,
          voucherCode: appliedVoucher,
          returnUrl: window.location.origin + '/?tab=history' // Quay về trang lịch sử
        }
      });

      if (error) throw new Error(error.message);
      if (data && data.checkoutUrl) {
        setPayosPaymentData(data);
        // Cập nhật giao diện Lịch sử nạp ngay lập tức
        const newDraft = {
          id: `PAYOS_${data.orderCode}`,
          userId: currentUser.id,
          amount: parsedAmount,
          bonusAmount: bonusAmount,
          voucherCode: appliedVoucher,
          status: 'Chờ duyệt',
          type: 'banking',
          created_at: new Date().toISOString()
        };
        setDepositRequests(prev => [newDraft, ...prev]);
      } else {
        showToast("Không thể tạo link thanh toán, vui lòng thử lại sau.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi hệ thống khi gọi PayOS", "error");
    } finally {
      setIsGlobalProcessing(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (isDepositing || window.isSubmittingCard) return;
    window.isSubmittingCard = true;
    setLiveCardError(null);

    if (!cardAmount || !String(cardAmount).trim() || cardAmount === '0') {
      window.isSubmittingCard = false;
      return showToast("Vui lòng chọn mệnh giá thẻ!", "error");
    }

    if (!cardCode.trim() || !cardSerial.trim()) {
      window.isSubmittingCard = false;
      return showToast("Vui lòng nhập đầy đủ Mã thẻ và Số Serial!", "error");
    }

    setIsDepositing(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-card', {
        body: {
          telco: cardTelco,
          amount: parseInt(cardAmount),
          code: cardCode,
          serial: cardSerial,
          userId: currentUser.id
        }
      });

      if (error) throw error;

      if (data.success) {
        showToast("Gửi thẻ thành công! Vui lòng chờ hệ thống xử lý trong ít phút.", "success");
        setCardCode('');
        setCardSerial('');
        setCardAmount('');
        // Add to local state to reflect UI immediately
        setDepositRequests(prev => [{
          id: data.requestId,
          userId: currentUser.id,
          amount: parseInt(cardAmount),
          status: 'Chờ duyệt',
          type: 'card',
          details: `Nạp thẻ ${cardTelco} - Mã: ${cardCode} - Seri: ${cardSerial}`,
          created_at: new Date().toISOString()
        }, ...prev]);

        sendAdminAlert('NẠP THẺ CÀO', `Khách ${currentUser.name} vừa nạp thẻ ${cardTelco} mệnh giá ${new Intl.NumberFormat('vi-VN').format(cardAmount)}đ. Thẻ đang được xử lý.`);
      } else {
        showToast(data.message || "Lỗi khi gửi thẻ. Vui lòng kiểm tra lại!", "error");
      }
    } catch (err) {
      console.error("Lỗi gửi thẻ:", err);
      showToast("Lỗi kết nối máy chủ nạp thẻ!", "error");
    } finally {
      setIsDepositing(false);
      window.isSubmittingCard = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
      {renderNavbar()}
      <div className="w-full max-w-[1500px] mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-[1fr_1fr_350px] xl:grid-cols-[1fr_1fr_400px] gap-6">

        {/* CỘT 1: MÃ QR */}
        <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden h-fit">

          {/* OVERLAY THÀNH CÔNG */}
          {payosSuccess && (
            <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <Check size={40} className="text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl text-white font-bold mb-3 uppercase tracking-wider">Thành Công!</h3>
              <p className="text-sm md:text-base text-emerald-100 mb-6">Số tiền đã được cộng vào tài khoản của bạn.</p>
              <button onClick={() => setPayosSuccess(false)} className="px-6 py-2 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg">Đóng</button>
            </div>
          )}

          {!payosPaymentData && !payosSuccess && (
            <div className="absolute inset-0 bg-[#151D2F]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <QrCode size={48} className="text-slate-500 mb-4" />
              <h3 className="text-white font-bold mb-2">{activePendingBankingReq ? "Đang có lệnh chờ" : "Chưa có mã QR"}</h3>
              <p className="text-sm text-slate-400">{activePendingBankingReq ? "Vui lòng hủy lệnh chờ ở bảng bên cạnh để tạo mã mới." : "Vui lòng điền số tiền ở Form bên cạnh và bấm Tạo lệnh để lấy mã quét."}</p>
            </div>
          )}

          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2"><QrCode className="text-blue-500" /> {payosPaymentData ? "Thanh Toán Tự Động" : "Nạp Tiền Chuyển Khoản"}</h2>
          {payosPaymentData && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4 mb-4 text-center shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/50">
              <p className="text-xs md:text-sm text-red-400 font-bold uppercase animate-pulse flex items-center justify-center gap-1.5">
                <AlertCircle size={18} className="shrink-0" /> Cảnh báo: KHÔNG tải lại hoặc tắt trang web trong quá trình nạp để tránh phát sinh lỗi !!!
              </p>
            </div>
          )}
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden border-2 border-white flex items-center justify-center w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
              {payosPaymentData ? (
                <img src={`https://img.vietqr.io/image/${payosPaymentData.bin}-${payosPaymentData.accountNumber}-qr_only.png?amount=${payosPaymentData.amount}&addInfo=${encodeURIComponent(payosPaymentData.description)}&accountName=${encodeURIComponent(payosPaymentData.accountName)}`} alt="QR Code" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <QrCode size={48} className="text-slate-300" />
                </div>
              )}
            </div>
            {payosPaymentData && (
              <div className="mt-4 bg-[#0B1120] px-5 py-2 rounded-full border border-rose-500/30 text-rose-500 font-black text-xl md:text-2xl tracking-[0.2em] font-mono shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                {formatPayosTime(payosTimeLeft)}
              </div>
            )}
          </div>
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Ngân hàng:</span><span className="font-bold text-white">{payosPaymentData ? ({ '970416': 'ACB (Ngân hàng Á Châu)', '970436': 'Vietcombank', '970422': 'MBBank', '970415': 'VietinBank', '970418': 'BIDV', '970407': 'Techcombank', '970423': 'TPBank' }[payosPaymentData.bin] || payosPaymentData.bin) : "..."}</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Số tài khoản:</span><span className="font-bold text-emerald-400 flex items-center gap-2">{payosPaymentData ? payosPaymentData.accountNumber : "..."} <button onClick={() => copyToClipboard(payosPaymentData ? payosPaymentData.accountNumber : '')} className="relative z-20"><Copy size={14} className="text-slate-500 hover:text-white" /></button></span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Chủ tài khoản:</span><span className="font-bold text-white uppercase text-right ml-2 line-clamp-1">{payosPaymentData ? payosPaymentData.accountName : "..."}</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Nội dung CK:</span><span className="font-bold text-rose-400 flex items-center justify-end gap-2 ml-2 text-right">{payosPaymentData ? payosPaymentData.description : "..."} <button onClick={() => copyToClipboard(payosPaymentData ? payosPaymentData.description : '')} className="relative z-20 shrink-0"><Copy size={14} className="text-slate-500 hover:text-white" /></button></span></div>
            {(payosPaymentData || activePendingBankingReq) && (
              <div className="flex justify-between border-b border-slate-800 pb-2 bg-emerald-500/10 p-2 rounded mt-2"><span className="text-slate-400 font-bold">Số tiền:</span><span className="font-black text-emerald-400">{new Intl.NumberFormat('vi-VN').format(payosPaymentData ? payosPaymentData.amount : displayAmount)} đ</span></div>
            )}
          </div>
          <p className="text-[10px] md:text-xs text-yellow-500 flex gap-1"><AlertCircle size={14} className="shrink-0" /> Vui lòng chuyển đúng Số tiền và Nội dung để được duyệt tự động.</p>
        </div>

        {/* CỘT 2: FORM */}
        <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 h-fit shadow-xl">
          <div className="flex gap-2 mb-4 p-1 bg-[#0B1120] rounded-xl border border-slate-800">
            <button
              onClick={() => setDepositMethod('banking')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${depositMethod === 'banking' || depositMethod === 'payos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Chuyển Khoản
            </button>
            <button
              onClick={() => setDepositMethod('card')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${depositMethod === 'card' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Thẻ Cào
            </button>
          </div>

          {depositMethod === 'banking' || depositMethod === 'payos' ? (
            <>
              <h3 className="font-bold text-white mb-4 text-lg">Nạp Tiền Chuyển Khoản</h3>
              {activePendingBankingReq ? (
                <div className="text-center bg-[#0B1120] p-4 md:p-6 rounded-xl border border-indigo-500/30 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                    <QrCode size={30} className="text-indigo-400" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">Đang chờ thanh toán</h4>
                  <p className="text-sm text-slate-400 mb-6">Bạn đang có một lệnh nạp <strong className="text-indigo-400">{new Intl.NumberFormat('vi-VN').format(activePendingBankingReq.amount)}đ</strong> chờ xử lý. Hãy quét mã QR hoặc hủy lệnh để tạo mới.</p>

                  <button onClick={() => {
                    handleCancelDepositClient(activePendingBankingReq.id);
                  }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 md:py-4 rounded-xl font-bold transition-colors text-sm">Hủy / Tạo lệnh mới</button>
                </div>
              ) : payosPaymentData ? (
                <div className="text-center bg-[#0B1120] p-4 md:p-6 rounded-xl border border-indigo-500/30 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                    <QrCode size={30} className="text-indigo-400" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">Đang chờ thanh toán</h4>
                  <p className="text-sm text-slate-400 mb-6">Hãy sử dụng App Ngân hàng quét mã QR bên cạnh để chuyển số tiền <strong className="text-indigo-400">{new Intl.NumberFormat('vi-VN').format(payosPaymentData.amount)}đ</strong>.</p>

                  <button onClick={() => {
                    handleCancelDepositClient(`PAYOS_${payosPaymentData.orderCode}`);
                  }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 md:py-4 rounded-xl font-bold transition-colors text-sm">Hủy / Tạo lệnh mới</button>
                </div>
              ) : (
                <form onSubmit={handleCreatePayosLink}>
                  <p className="text-sm text-slate-400 mb-4">Hệ thống sẽ tạo mã QR chuyển khoản tự động. Tiền sẽ được cộng ngay lập tức sau khi chuyển thành công.</p>
                  <div className="mb-4">
                    <label className="text-xs text-slate-400 font-bold mb-1 block">Số tiền cần nạp (Tối thiểu 10.000đ)</label>
                    <input type="text" value={depositAmount} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val) {
                        setDepositAmount(new Intl.NumberFormat('vi-VN').format(val));
                      } else {
                        setDepositAmount('');
                      }
                    }} placeholder="VD: 10.000" className="w-full p-4 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:border-indigo-500 outline-none text-lg font-bold" required />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><Ticket size={14} className="text-rose-400" /> Mã Khuyến Mãi (Nếu có)</label>
                    <input type="text" value={voucherInput} onChange={e => setVoucherInput(e.target.value.toUpperCase())} placeholder="Nhập mã voucher..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-rose-400 focus:border-rose-500 outline-none text-base font-bold uppercase" />
                  </div>

                  <button type="submit" disabled={isGlobalProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-colors shadow-lg shadow-blue-600/20 text-base md:text-lg flex items-center justify-center gap-2">
                    {isGlobalProcessing ? <RefreshCw className="animate-spin" size={20} /> : "Tạo Mã QR Nạp"}
                  </button>
                </form>
              )}
            </>
          ) : (

            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg text-rose-400 text-xs md:text-sm leading-relaxed">
                <strong>Lưu ý quan trọng:</strong>
                <ul className="list-disc pl-4 mt-1">
                  <li>Nạp thẻ cào chịu phí cố định <strong>20%</strong> (Thẻ 100k nhận 80k).</li>
                  <li><strong className="text-red-500">CHỌN SAI MỆNH GIÁ SẼ BỊ TRỪ 50% GIÁ TRỊ THẺ HOẶC MẤT THẺ.</strong></li>
                </ul>
              </div>

              {liveCardError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 animate-fade-in shadow-sm">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <span className="text-red-500 text-sm font-bold">{getCustomerFriendlyError(liveCardError)}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold mb-1 block">Nhà mạng</label>
                  <select value={cardTelco} onChange={e => setCardTelco(e.target.value)} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white outline-none">
                    <option value="VIETTEL">Viettel</option>
                    <option value="VINAPHONE">Vinaphone</option>
                    <option value="ZING">Zing</option>
                    <option value="VCOIN">Vcoin</option>
                    <option value="GARENA">Garena</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold mb-1 block">Mệnh giá</label>
                  <select
                    value={cardAmount}
                    onChange={e => setCardAmount(e.target.value)}
                    className={`w-full p-3 bg-[#0B1120] border rounded-xl outline-none transition-colors ${!cardAmount ? 'text-slate-400 border-slate-700' : 'text-white border-slate-700'}`}
                    required
                  >
                    <option value="" disabled>-- Chọn mệnh giá --</option>
                    <option value="10000">10.000 đ</option>
                    <option value="20000">20.000 đ</option>
                    <option value="50000">50.000 đ</option>
                    <option value="100000">100.000 đ</option>
                    <option value="200000">200.000 đ</option>
                    <option value="500000">500.000 đ</option>
                    <option value="1000000">1.000.000 đ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold mb-1 block">Số Serial</label>
                <input type="text" value={cardSerial} onChange={e => setCardSerial(e.target.value)} placeholder="Nhập số seri..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold mb-1 block">Mã Thẻ (PIN)</label>
                <input type="text" value={cardCode} onChange={e => setCardCode(e.target.value)} placeholder="Nhập mã thẻ..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none" required />
              </div>

              <button type="submit" disabled={isDepositing} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-4 rounded-xl font-bold text-white transition-colors shadow-lg shadow-emerald-600/20 text-base md:text-lg flex items-center justify-center gap-2">
                {isDepositing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Nạp Thẻ Ngay'}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-slate-800 pt-4">
            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><History size={16} /> Lịch sử lệnh nạp của bạn</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar" onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.target;
              if (scrollTop + clientHeight >= scrollHeight - 10) setVisibleDepsClient(prev => prev + 5);
            }}>
              {depositRequests.filter(d => d.userId === currentUser?.id && d.type !== 'live_donate').length === 0 ? <p className="text-xs text-slate-500 italic">Chưa có lệnh nạp nào.</p> :
                depositRequests.filter(d => d.userId === currentUser?.id && d.type !== 'live_donate').slice(0, visibleDepsClient).map(d => (
                  <div key={d.id} className="flex justify-between items-center text-sm bg-[#0B1120] p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">
                        {(d.type === 'card' || (d.details && d.details.toLowerCase().includes('thẻ')) || String(d.id).startsWith('CARD')) ? '💳 Thẻ cào: ' : '🏦 Chuyển khoản: '}
                        {new Intl.NumberFormat('vi-VN').format(d.amount)}đ
                      </span>
                      {d.bonusAmount > 0 && <span className="text-[10px] text-rose-400 font-bold">+{new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Mã: {d.voucherCode})</span>}
                      {d.status === 'Thất bại' && d.details && getCustomerFriendlyError(d.details) && (
                        <span className="text-[10px] text-red-400 block mt-0.5 leading-tight">{getCustomerFriendlyError(d.details)}</span>
                      )}
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(getRecordTime(d) || Date.now()).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 items-end whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold ${d.status === 'Thành công' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'Từ chối' || d.status === 'Thất bại' || d.status === 'Đã hủy' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{d.status === 'Chờ duyệt' && d.type === 'banking' ? 'Chờ thanh toán' : d.status}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* CỘT 3: ĐẶC QUYỀN NẠP */}
        <div className="bg-gradient-to-br from-[#151D2F] to-[#1e1423] p-5 rounded-2xl border border-pink-500/30 h-fit shadow-lg shadow-pink-500/5">
          <div className="flex items-center gap-4 mb-5 border-b border-slate-800/80 pb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-[#0B1120] rounded-xl flex items-center justify-center border border-pink-500/40 z-10 relative shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <Gift size={24} className="text-pink-400" />
              </div>
              <div className="absolute inset-0 bg-pink-500/20 blur-md rounded-xl"></div>
            </div>
            <div>
              <h3 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 text-lg uppercase tracking-wide">Đặc Quyền Nạp</h3>
              <p className="text-[11px] text-slate-400 font-medium">Chỉ dành cho bạn hôm nay</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="group bg-[#0B1120]/60 hover:bg-[#0B1120] transition-colors p-4 rounded-xl border border-slate-800/80 hover:border-pink-500/30 flex items-start gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-bl-full -z-0"></div>
              <Ticket size={22} className="text-pink-400 shrink-0 relative z-10 mt-0.5" />
              <div className="relative z-10">
                <p className="text-sm text-slate-300">Nhận ngay <strong className="text-pink-400 text-base">1 Lượt Quay</strong> cho mỗi <strong className="text-white">20.000đ</strong> nạp vào.</p>
                <p className="text-[11px] text-pink-500/80 mt-1.5 flex items-center gap-1 font-medium"><CheckCircle2 size={12} /> Tích lũy không giới hạn</p>
              </div>
            </div>

            <div className="group bg-[#0B1120]/60 hover:bg-[#0B1120] transition-colors p-4 rounded-xl border border-slate-800/80 hover:border-yellow-500/30 flex items-start gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-full -z-0"></div>
              <Flame size={22} className="text-yellow-400 shrink-0 relative z-10 mt-0.5" />
              <div className="relative z-10">
                <p className="text-sm text-slate-300">Thử vận may với giải thưởng cực khủng lên đến:</p>
                <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mt-1 drop-shadow-sm">500.000 VNĐ</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      {renderFooter()}
    </div>
  );
};

export const LichsuScreen = ({
  renderNavbar, renderFooter, currentUser, transactionsDb, boostingRequests,
  depositRequests, historyTab, setHistoryTab, visibleHistoryCount, setVisibleHistoryCount,
  expandedTx, setExpandedTx, copyToClipboard, copiedText, handleCancelDepositClient
}) => {
  // Bộ lọc dữ liệu siêu chuẩn cho từng Tab
  const myTransactions = transactionsDb.filter(t => t.user === currentUser?.name);

  const historyBuy = myTransactions.filter(t => t.type === 'buy_acc' && !t.action.includes('Cày thuê') && !t.action.includes('cày thuê'));
  const historyBossGame = myTransactions.filter(t => t.type === 'boss_game_topup');
  const historyRent = myTransactions.filter(t => t.type?.includes('rent') || t.type?.includes('fund') || t.type === 'deposit_refund' || t.action?.toLowerCase().includes('thuê nick') || t.action?.toLowerCase().includes('quy đổi') || t.action?.toLowerCase().includes('hoàn cọc'));
  const historySpin = myTransactions.filter(t => t.type === 'spin_win' && t.amount !== 0 && !t.isSpinCost);
  const historyBoost = boostingRequests.filter(r => r.user === currentUser?.name);
  const historyDeposit = depositRequests.filter(d => d.userId === currentUser?.id && d.type !== 'live_donate');
  const historyTransfer = myTransactions.filter(t => t.type === 'transfer_out' || t.type === 'transfer_in');

  // Cấu hình các Tab
  const tabs = [
    { id: 'buy', name: 'Mua Acc', icon: <Gamepad2 size={16} />, data: historyBuy },
    { id: 'bossgame', name: 'Nạp Game Boss', icon: <Swords size={16} />, data: historyBossGame },
    { id: 'rent', name: 'Thuê Acc', icon: <Clock size={16} />, data: historyRent },
    { id: 'spin', name: 'Vòng Quay', icon: <Gift size={16} />, data: historySpin },
    { id: 'boost', name: 'Cày Thuê', icon: <Target size={16} />, data: historyBoost },
    { id: 'deposit', name: 'Nạp Tiền', icon: <Wallet size={16} />, data: historyDeposit },
    { id: 'transfer', name: 'Chuyển Tiền', icon: <ArrowLeftRight size={16} />, data: historyTransfer }
  ];

  const currentData = [...(tabs.find(t => t.id === historyTab)?.data || [])].sort((a, b) => getRecordTime(b) - getRecordTime(a));
  const visibleData = currentData.slice(0, visibleHistoryCount); // Chỉ cắt lấy số lượng đang hiển thị

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
      {renderNavbar()}
      <div className="w-full max-w-5xl mx-auto mt-4 md:mt-10 p-4 md:p-8 bg-[#151D2F] rounded-2xl border border-slate-800 text-center flex flex-col items-center shadow-xl">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mb-4 md:mb-6 shadow-inner"><History className="w-8 h-8 md:w-10 md:h-10" /></div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 uppercase tracking-wider">Lịch Sử Giao Dịch</h2>

        {/* MENU CÁC TAB LỊCH SỬ */}
        <div className="flex gap-2 overflow-x-auto w-full pb-3 mb-6 border-b border-slate-800 scrollbar-hide justify-start md:justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setHistoryTab(tab.id); setVisibleHistoryCount(5); setExpandedTx(null); }} // Reset về 5 khi đổi tab
              className={`px-4 py-2.5 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 text-sm transition-all ${historyTab === tab.id ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500' : 'bg-[#0B1120] text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800'}`}
            >
              {tab.icon} {tab.name} <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">{tab.data.length}</span>
            </button>
          ))}
        </div>

        {/* KHUNG DANH SÁCH & CUỘN VÔ HẠN */}
        <div
          className="w-full text-left bg-[#0B1120] rounded-xl overflow-auto max-h-[500px] border border-slate-800 custom-scrollbar relative"
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollTop + clientHeight >= scrollHeight - 20) setVisibleHistoryCount(prev => prev + 5); // Kéo xuống đáy nảy thêm 5 dòng
          }}
        >
          {visibleData.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center text-slate-500 h-full min-h-[200px]">
              <AlertCircle size={40} className="mb-3 opacity-30" />
              <p>Chưa có giao dịch nào ở mục này.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* 1. RENDER LỊCH SỬ MUA ACC (CÓ TÍNH NĂNG MỞ RỘNG XEM PASS) */}
              {historyTab === 'bossgame' && visibleData.map(tx => {
                const details = tx.accDetails || {};
                return (
                  <div key={tx.id} className="bg-[#1A233A] border border-slate-700/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Swords size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{tx.action}</h4>
                        <p className="text-xs text-slate-400">{tx.date} • Mã đơn: <span className="font-mono text-slate-300">{tx.id}</span></p>
                        {details.rewards && (
                          <p className="text-xs text-amber-400 font-semibold mt-1">
                            Quà: {details.rewards.attacks ? `+${new Intl.NumberFormat('vi-VN').format(details.rewards.attacks)} lượt` : ''}
                            {details.rewards.royal_chests ? ` • +${details.rewards.royal_chests} Rương HK` : ''}
                            {details.rewards.coins ? ` • +${new Intl.NumberFormat('vi-VN').format(details.rewards.coins)} Xu` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-400 font-black text-base">-{new Intl.NumberFormat('vi-VN').format(tx.amount)}đ</span>
                      <div className="mt-1">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status || 'Thành công'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {historyTab === 'buy' && visibleData.map(tx => (
                <div key={tx.id} className="border-b border-slate-800 flex flex-col">
                  <div
                    className="p-4 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors cursor-pointer"
                    onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm md:text-base">{tx.action}</p>
                        {expandedTx === tx.id ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-1">{tx.date}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-black text-base md:text-lg text-rose-500">-{new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ</p>
                      <p className="text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 text-emerald-500 bg-emerald-500/10">Thành công</p>
                    </div>
                  </div>
                  {expandedTx === tx.id && tx.accDetails && (
                    <div className="bg-slate-900/80 p-4 border-t border-slate-800 animate-fade-in text-sm">
                      <p className="text-emerald-400 font-bold mb-3 flex items-center gap-2"><CheckCircle2 size={16} /> Thông tin tài khoản bạn đã mua (Mã: #{tx.accDetails.code}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs font-bold">Tài khoản Game:</span>
                            <div className="flex items-center">
                              <input readOnly value={tx.accDetails.username} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                              <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.username); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs font-bold">Mật khẩu Game:</span>
                            <div className="flex items-center">
                              <input readOnly value={tx.accDetails.password} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                              <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.password); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs font-bold">Email đăng ký:</span>
                            <div className="flex items-center">
                              <input readOnly value={tx.accDetails.email} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                              <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.email); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs font-bold">SĐT xác minh:</span>
                            <div className="flex items-center">
                              <input readOnly value={tx.accDetails.phone} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                              <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.phone); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {copiedText && <p className="text-emerald-400 text-xs mt-3 italic animate-pulse text-center bg-emerald-500/10 py-1 rounded">Đã copy vào khay nhớ tạm!</p>}
                    </div>
                  )}
                </div>
              ))}

              {/* 2. RENDER LỊCH SỬ THUÊ ACC */}
              {historyTab === 'rent' && visibleData.map(tx => (
                <div key={tx.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                  <div>
                    <p className="font-bold text-white text-sm md:text-base">{tx.action}</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">{tx.date}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-black text-base md:text-lg ${tx.amount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {tx.amount > 0 ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ
                    </p>
                    <p className={`text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 
                      ${tx.status.includes('+') || tx.status === 'Thành công' ? 'text-emerald-500 bg-emerald-500/10'
                        : tx.status.includes('cọc') ? 'text-yellow-500 bg-yellow-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                      {tx.status}
                    </p>
                    {tx.accDetails && tx.accDetails.balanceAfter !== undefined && (
                      <div className="mt-1.5 flex flex-col md:items-end text-[10px]">
                        <p className="text-slate-400">Dư ví: <span className="font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.balanceAfter)}đ</span></p>
                        {tx.accDetails.fundAfter !== undefined && (
                          <p className="text-slate-400">Dư quỹ: <span className="font-bold text-yellow-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.fundAfter)}đ</span></p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 3. RENDER LỊCH SỬ VÒNG QUAY (TRÚNG THƯỞNG) */}
              {historyTab === 'spin' && visibleData.map(tx => (
                <div key={tx.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                  <div>
                    <p className="font-bold text-white text-sm md:text-base"><Gift size={14} className="inline mr-1 text-rose-500" /> {tx.action}</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">{tx.date}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-black text-base md:text-lg text-emerald-400">
                      {tx.isSpinCost ? `+${Math.abs(tx.amount)} Lượt` : `+${new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ`}
                    </p>
                    <p className="text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 text-emerald-500 bg-emerald-500/10">{tx.status}</p>
                  </div>
                </div>
              ))}

              {/* 4. RENDER LỊCH SỬ CÀY THUÊ */}
              {historyTab === 'boost' && visibleData.map(req => (
                <div key={req.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded shadow-sm">GÓI ĐẶT</span>
                      <p className="font-bold text-white text-sm md:text-base">{req.boostingTitle}</p>
                    </div>
                    {req.info?.username && (
                      <p className="text-[10px] md:text-xs text-slate-400 mt-1">
                        {req.info.loginMethod === 'Không Cần' ? (
                          <>Mã sự kiện / Link: <span className="font-mono text-white">{req.info.username}</span></>
                        ) : (
                          <>TK: <span className="font-mono text-white">{req.info.username}</span> | Nền tảng: <span className="text-white">{req.info.loginMethod}</span></>
                        )}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1.5">{req.date}</p>
                  </div>
                  <div className="text-left md:text-right">
                    {req.status === 'Đã hủy' && req.info?.amount > 0 && (
                      <p className="text-xs text-emerald-400 font-bold mb-1">Đã hoàn +{new Intl.NumberFormat('vi-VN').format(req.info.amount)}đ</p>
                    )}
                    <p className={`text-xs font-bold inline-block px-3 py-1 rounded mt-1 
                      ${req.status === 'Hoàn thành' ? 'text-emerald-500 bg-emerald-500/10' : req.status === 'Đang cày' ? 'text-blue-400 bg-blue-500/10' : req.status === 'Đã hủy' ? 'text-rose-400 bg-rose-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                      {req.status === 'Hoàn thành' ? <CheckCircle2 size={12} className="inline mr-1" /> : req.status === 'Đang cày' ? <RefreshCw size={12} className="inline mr-1 animate-spin" /> : req.status === 'Đã hủy' ? <RotateCcw size={12} className="inline mr-1" /> : <Clock size={12} className="inline mr-1" />}
                      {req.status || 'Chờ xử lý'}
                    </p>
                  </div>
                </div>
              ))}

              {/* 5. RENDER LỊCH SỬ NẠP TIỀN */}
              {historyTab === 'deposit' && visibleData.map(d => (
                <div key={d.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                  <div>
                    <p className="font-bold text-white text-sm md:text-base"><Wallet size={14} className="inline mr-1 text-emerald-500" /> Nạp tiền chuyển khoản</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">{new Date(d.id).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-black text-base md:text-lg text-emerald-400">
                      +{new Intl.NumberFormat('vi-VN').format(d.amount)}đ
                    </p>
                    {d.bonusAmount > 0 && <p className="text-[10px] text-rose-400 font-bold mb-1">+ {new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Voucher)</p>}
                    <p className={`text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 
                      ${d.status === 'Thành công' ? 'text-emerald-500 bg-emerald-500/10' : d.status === 'Từ chối' || d.status === 'Đã hủy' ? 'text-rose-400 bg-rose-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                      {d.status}
                    </p>
                    {d.status === 'Chờ duyệt' && (
                      <button onClick={() => handleCancelDepositClient(d.id)} className="text-[10px] text-rose-400 hover:text-rose-300 underline font-bold ml-2 block md:inline-block">Hủy đơn</button>
                    )}
                  </div>
                </div>
              ))}

              {/* 6. RENDER LỊCH SỬ CHUYỂN TIỀN */}
              {historyTab === 'transfer' && visibleData.map(tx => (
                <div key={tx.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${tx.type === 'transfer_out' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                        <ArrowLeftRight size={14} className={tx.type === 'transfer_out' ? 'text-rose-400' : 'text-emerald-400'} />
                      </span>
                      <p className="font-bold text-white text-sm md:text-base">{tx.action}</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1 ml-9">{tx.date}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-black text-base md:text-lg ${tx.type === 'transfer_out' ? 'text-rose-500' : 'text-emerald-400'}`}>
                      {tx.type === 'transfer_out' ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(tx.amount)}đ
                    </p>
                    <p className="text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 text-emerald-500 bg-emerald-500/10">{tx.status}</p>
                    {tx.accDetails && tx.accDetails.balanceAfter !== undefined && (
                      <div className="mt-1.5 flex flex-col md:items-end text-[10px]">
                        <p className="text-slate-400">Dư ví: <span className="font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.balanceAfter)}đ</span></p>
                        {tx.accDetails.fee > 0 && (
                          <p className="text-slate-400">Phí: <span className="font-bold text-rose-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.fee)}đ</span></p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {renderFooter()}
    </div>
  );
};

export const CayThueScreen = ({
  renderNavbar, renderFooter, boostingDb, boostingRequests, currentUser,
  activeBoostingTab, setActiveBoostingTab, activeBoostingGameClient,
  setActiveBoostingGameClient, renderBoostingCard
}) => {
  const boostingTabs = [
    { id: 'rank', label: 'Cày Rank' },
    { id: 'event', label: 'Cày Sự Kiện' }
  ];

  // Hàm Helper lấy tên game thật
  const getGameName = (gameStr) => {
    if (!gameStr) return '';
    try { return JSON.parse(gameStr).name || gameStr; } catch { return gameStr; }
  };

  // Tìm danh sách Game duy nhất cho Tab hiện tại
  const currentTabGames = ['Tất cả', ...new Set(boostingDb.filter(b => (b.type || 'rank') === activeBoostingTab).map(b => getGameName(b.game)))];

  const filteredBoosting = boostingDb.filter(b => {
    const type = b.type || 'rank'; // Mặc định là rank nếu không có type
    const matchType = type === activeBoostingTab;
    const gName = getGameName(b.game);
    const matchGame = activeBoostingGameClient === 'Tất cả' || gName === activeBoostingGameClient;
    return matchType && matchGame;
  }).sort((a, b) => {
    let aFeatured = false, bFeatured = false;
    try { aFeatured = JSON.parse(a.game).isFeatured || false; } catch { /* ignore */ }
    try { bFeatured = JSON.parse(b.game).isFeatured || false; } catch { /* ignore */ }
    return (bFeatured === true) - (aFeatured === true);
  });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
      {renderNavbar()}
      {/* Đã mở rộng max-w và thêm lề phải (pr-24) để né 3 nút liên hệ */}
      <div className="w-full max-w-[1400px] mx-auto mt-8 px-4 md:px-6 lg:pr-24">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center gap-2"><Target className="text-blue-500" /> Dịch Vụ Cày Thuê</h2>
          <p className="text-slate-400 mt-2 text-sm md:text-base">Uy tín, tốc độ, bảo mật tuyệt đối. Giá tốt nhất thị trường.</p>
        </div>

        {/* --- KHU VỰC CHỌN LỌC GAME VÀ THỂ LOẠI --- */}
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {boostingTabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveBoostingTab(tab.id); setActiveBoostingGameClient('Tất cả'); }} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${activeBoostingTab === tab.id ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentTabGames.map(game => {
              let gAvatar = null;
              if (game !== 'Tất cả') {
                const matchedItem = boostingDb.find(b => getGameName(b.game) === game);
                if (matchedItem) {
                  try { gAvatar = JSON.parse(matchedItem.game).avatar; } catch { /* ignore */ }
                }
              }
              return (
                <button key={game} onClick={() => setActiveBoostingGameClient(game)} className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${activeBoostingGameClient === game ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                  {gAvatar && <img src={gAvatar} alt={game} className="w-4 h-4 rounded-full object-cover shrink-0" />}
                  {game === 'Tất cả' ? 'Tất cả Game' : game}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tự động chia lên 4 cột trên màn hình rộng (xl) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredBoosting.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#151D2F] shadow-lg">
              <Target size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">Đang cập nhật các gói dịch vụ cho mục này...</p>
            </div>
          ) : filteredBoosting.map((b, index) => renderBoostingCard(b, index))}
        </div>
        {/* LỊCH SỬ CÀY THUÊ CHO BẠN */}
        <div className="mt-16 border-t border-slate-800 pt-8">
          <div className="flex items-center gap-2 mb-6">
            <History size={24} className="text-blue-500" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Đơn cày thuê của bạn</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {boostingRequests.filter(r => r.user === currentUser?.name).length === 0 ? (
              <div className="bg-[#151D2F] p-10 rounded-2xl border border-slate-800 text-center text-slate-500 border-dashed">
                <Target size={40} className="mx-auto mb-3 opacity-20" />
                <p>Bạn chưa đặt đơn cày thuê nào ở shop.</p>
              </div>
            ) : (
              boostingRequests.filter(r => r.user === currentUser?.name).map(req => (
                <div key={req.id} className="bg-[#151D2F] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center hover:border-blue-500/30 transition-colors shadow-lg">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg shadow-lg shadow-blue-600/20">{req.boostingTitle}</span>
                      <span className="text-xs text-slate-500 font-medium">{req.date}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-slate-300">Tài khoản: <span className="text-white font-mono font-bold bg-[#0B1120] px-2 py-0.5 rounded">{req.info.username}</span></p>
                      <p className="text-[11px] text-slate-500">Hình thức: <span className="text-slate-400 font-bold">{req.info.loginMethod}</span></p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 flex items-center justify-between md:justify-end gap-6">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Trạng thái đơn</p>
                      <div className={`flex items-center gap-1.5 font-black text-sm ${req.status === 'Hoàn thành' ? 'text-emerald-400' : req.status === 'Đang cày' ? 'text-blue-400' : 'text-yellow-500'}`}>
                        {req.status === 'Hoàn thành' ? <CheckCircle2 size={16} /> : req.status === 'Đang cày' ? <RefreshCw size={16} className="animate-spin" /> : <Clock size={16} />}
                        {req.status || 'Chờ xử lý'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {renderFooter()}
    </div>
  );
};
