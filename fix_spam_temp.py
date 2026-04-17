import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add global lock variable
if 'let isProcessingAction = false;' not in text:
    text = text.replace('const App = () => {', 'let isProcessingAction = false;\n\nconst App = () => {')

# 2. Fix confirmDialog
old_confirm = '<button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="flex-1 p-4 font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">Đồng Ý</button>'
new_confirm = '''<button onClick={async () => {
                  if (isProcessingAction) return;
                  isProcessingAction = true;
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  try { await action(); } catch(e) { console.error(e); } finally { isProcessingAction = false; }
                }} className="flex-1 p-4 font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">Đồng Ý</button>'''
text = text.replace(old_confirm, new_confirm)

# 3. Fix Approve Deposit Form Modals
# Finds <form onSubmit={async (e) => { ... }}> for approve deposit. To be safe, we just use regex for the start block inside ApproveDepositModal if possible, or just replace the specific string
approve_deposit_old = '''<form onSubmit={async (e) => {
                  e.preventDefault();
                  const finalAmount = parseInt(e.target.finalAmount.value);
                  const bonusSpins = parseInt(e.target.bonusSpins.value || 0);

                  // Lấy Data sống của khách từ Database trước khi cộng tiền nạp
                  const { data: userToUpdate } = await supabase.from('users').select('*').eq('id', approveDepositModal.userId).single();'''

approve_deposit_new = '''<form onSubmit={async (e) => {
                  e.preventDefault();
                  if (isProcessingAction) return;
                  isProcessingAction = true;
                  try {
                  const finalAmount = parseInt(e.target.finalAmount.value);
                  const bonusSpins = parseInt(e.target.bonusSpins.value || 0);
                  const targetModal = approveDepositModal;
                  setApproveDepositModal(null);

                  // Lấy Data sống của khách từ Database trước khi cộng tiền nạp
                  const { data: userToUpdate } = await supabase.from('users').select('*').eq('id', targetModal.userId).single();'''
text = text.replace(approve_deposit_old, approve_deposit_new)

# Now fix the end of approveDepositModal
# It originally had: 
# showToast(`Đã cộng ${new Intl.NumberFormat('vi-VN').format(finalAmount)}đ và ${bonusSpins} lượt quay!`);
# setApproveDepositModal(null);
# }} className="space-y-4">

approve_deposit_end_old = '''showToast(`Đã cộng ${new Intl.NumberFormat('vi-VN').format(finalAmount)}đ và ${bonusSpins} lượt quay!`);
                  setApproveDepositModal(null);
                }} className="space-y-4">'''
approve_deposit_end_new = '''showToast(`Đã cộng ${new Intl.NumberFormat('vi-VN').format(finalAmount)}đ và ${bonusSpins} lượt quay!`);
                  } finally { isProcessingAction = false; }
                }} className="space-y-4">'''
text = text.replace(approve_deposit_end_old, approve_deposit_end_new)

# Fix editRentModal
edit_rent_old = '''<form onSubmit={async (e) => {
                  e.preventDefault();
                  const action = e.target.actionType.value;
                  if (action === 'stop') {
                    const acc = editRentModal.acc;
                    const currentReq = editRentModal.req;'''
edit_rent_new = '''<form onSubmit={async (e) => {
                  e.preventDefault();
                  if (isProcessingAction) return;
                  isProcessingAction = true;
                  try {
                  const action = e.target.actionType.value;
                  const targetModal = editRentModal;
                  setEditRentModal(null);
                  if (action === 'stop') {
                    const acc = targetModal.acc;
                    const currentReq = targetModal.req;'''
text = text.replace(edit_rent_old, edit_rent_new)

edit_rent_end_old = '''showToast(`Đã ${action === 'stop' ? 'thu hồi' : 'trừ giờ'} Nick #${currentReq.accCode}!`);
                  setEditRentModal(null);
                }} className="space-y-4">'''
edit_rent_end_new = '''showToast(`Đã ${action === 'stop' ? 'thu hồi' : 'trừ giờ'} Nick #${currentReq.accCode}!`);
                  } finally { isProcessingAction = false; }
                }} className="space-y-4">'''
text = text.replace(edit_rent_end_old, edit_rent_end_new)

# Fix approveDepositModal.userId inside approveDeposit
text = text.replace("eq('id', approveDepositModal.userId);", "eq('id', targetModal.userId);")
text = text.replace("eq('id', approveDepositModal.id);", "eq('id', targetModal.id);")
text = text.replace("approveDepositModal.id ?", "targetModal.id ?")
text = text.replace("u.id === approveDepositModal.userId", "u.id === targetModal.userId")
text = text.replace("currentUser?.id === approveDepositModal.userId", "currentUser?.id === targetModal.userId")

# Fix editRentModal usage in editRentModal
text = text.replace("editRentModal.req.userId", "targetModal.req.userId")
text = text.replace("eq('id', editRentModal.req.id)", "eq('id', targetModal.req.id)")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done python script updates.")
