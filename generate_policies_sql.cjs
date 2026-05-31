const fs = require('fs');
const csv = require('csv-parser');

const csvPath = 'C:\\Users\\PC\\shop-acc\\DATA Supabase\\policies.csv';
const sqlPath = 'C:\\Users\\PC\\shop-acc\\recreate_policies.sql';

const results = [];
fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    let sql = '';
    const tables = new Set(results.map(r => r.tablename));
    
    // Enable RLS on all affected tables
    tables.forEach(table => {
      sql += `ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;\n`;
    });
    sql += '\n';

    // Generate policies
    results.forEach(row => {
      const { tablename, policyname, cmd, qual, with_check } = row;
      let policySql = `CREATE POLICY "${policyname}" ON public."${tablename}" FOR ${cmd} TO public `;
      
      if (qual && qual !== 'null') {
        policySql += `USING (${qual}) `;
      }
      
      if (with_check && with_check !== 'null') {
        policySql += `WITH CHECK (${with_check})`;
      }
      
      sql += policySql.trim() + ';\n';
    });

    fs.writeFileSync(sqlPath, sql);
    console.log(`Generated SQL for ${results.length} policies.`);
  });
