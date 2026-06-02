import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetRegex = /const configPromise = supabase\.from\('site_config'\)\.select\('\*'\)\.eq\('id', 'deposit_bonus'\)\.maybeSingle\(\)\.then\(\(\{ data: configData \}\) => \{\s*if \(configData && configData\.value\) \{\s*setDepositBonusConfig\(configData\.value\);\s*\} else \{\s*const savedDepositConfig = localStorage\.getItem\('shop_deposit_config'\);\s*if \(savedDepositConfig\) setDepositBonusConfig\(JSON\.parse\(savedDepositConfig\)\);\s*\}\s*\}\);/;

const replaceStr = `const configPromise = supabase.from('site_config').select('*').eq('id', 'deposit_bonus').maybeSingle().then(({ data: configData }) => {
        if (configData && configData.value) {
          setDepositBonusConfig(configData.value);
        } else {
          const savedDepositConfig = localStorage.getItem('shop_deposit_config');
          if (savedDepositConfig) setDepositBonusConfig(JSON.parse(savedDepositConfig));
        }
      });

      const winnersPromise = supabase.from('transactions').select('*').eq('type', 'spin_win').neq('amount', 0).order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setGlobalRecentWinners(data.filter(t => !t.isSpinCost)); });`;

if(targetRegex.test(content)) {
  content = content.replace(targetRegex, replaceStr);
  fs.writeFileSync('src/App.jsx', content);
  console.log('winnersPromise injected successfully.');
} else {
  console.log('Regex did not match.');
}
