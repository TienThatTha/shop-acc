const fs = require('fs')
const path = require('path')

const dataDir = 'C:\\Users\\PC\\shop-acc\\DATA Supabase'
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'))

files.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8')
  const lines = content.split('\n').slice(0, 3)
  console.log(`\n--- ${file} ---`)
  lines.forEach(line => console.log(line.trim()))
})
