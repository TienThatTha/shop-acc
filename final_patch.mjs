import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Inject winnersPromise properly
const configBlock = `      const configPromise = supabase.from('site_config').select('*').eq('id', 'deposit_bonus').maybeSingle().then(({ data: configData }) => {
        if (configData && configData.value) {
          setDepositBonusConfig(configData.value);
        } else {
          const savedDepositConfig = localStorage.getItem('shop_deposit_config');
          if (savedDepositConfig) setDepositBonusConfig(JSON.parse(savedDepositConfig));
        }
      });`;

const newConfigBlock = configBlock + `\n\n      const winnersPromise = supabase.from('transactions').select('*').eq('type', 'spin_win').neq('amount', 0).order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setGlobalRecentWinners(data.filter(t => !t.isSpinCost)); });`;

if (content.includes(configBlock)) {
  content = content.replace(configBlock, newConfigBlock);
  console.log('winnersPromise injected successfully.');
} else {
  console.error('Could not find configBlock in App.jsx to inject winnersPromise.');
}

// 2. Sort Lịch sử vòng quay
const historyTarget = `{transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).slice(0, visibleSpinsClient).map((tx, idx) => {`;
const historyReplacement = `{transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, visibleSpinsClient).map((tx, idx) => {`;

if (content.includes(historyTarget)) {
  content = content.replace(historyTarget, historyReplacement);
  console.log('History sort added successfully.');
} else {
  console.error('Could not find history map in App.jsx.');
}

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx final patch completed.');
