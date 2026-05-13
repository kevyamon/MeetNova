import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));

function getGitInfo(command) {
  try {
    return execSync(command).toString().trim();
  } catch (e) {
    console.warn(`Avertissement : Impossible d'exécuter la commande git. Utilisation de valeurs par défaut.`);
    return command.includes('rev-parse') ? 'local' : new Date().toISOString();
  }
}

export default function versionInjector() {
  const manualVersion = pkg.version;
  const gitCommitHash = getGitInfo('git rev-parse --short HEAD');
  const commitDate = getGitInfo('git log -1 --format=%cI');
  const fullVersion = `${manualVersion}-${gitCommitHash}`;

  return {
    name: 'version-injector',
    
    transformIndexHtml(html) {
      const metaTag = `<meta name="app-version" content="${fullVersion}">`;
      return html.replace('</head>', `  ${metaTag}\n</head>`);
    },
    
    closeBundle() {
      const distPath = path.resolve(process.cwd(), 'dist');
      if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);
      
      const meta = { 
        fullVersion: fullVersion,
        version: manualVersion,
        commitDate: commitDate
      };
      fs.writeFileSync(path.join(distPath, 'meta.json'), JSON.stringify(meta, null, 2));
      
      console.log(`\nVersion complète injectée : ${fullVersion}`);
    }
  };
}
