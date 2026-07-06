const fs = require('fs');
const path = require('path');

const replacements = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã\xad': 'í',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã‘': 'Ñ',
  'Ã\x81': 'Á',
  'Ã‰': 'É',
  'Ã\x8d': 'Í',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Â¿': '¿',
  'Â¡': '¡'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) {
        processDirectory(fullPath);
      }
    } else if (/\.(js|jsx|ts|tsx|html|css|json)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed encoding in ${fullPath}`);
      }
    }
  }
}

processDirectory('./src');
processDirectory('./components');
console.log("Done");
