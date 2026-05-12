import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

function getGitCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 7);
  } catch {
    return 'unknown';
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'git-version',
      generateBundle(_, bundle) {
        const hash = getGitCommitHash();
        for (const file in bundle) {
          if (bundle[file].type === 'chunk') {
            bundle[file].code = `const __GIT_HASH__ = '${hash}';\n` + bundle[file].code;
          }
        }
      }
    }
  ],
  define: {
    __GIT_HASH__: JSON.stringify(getGitCommitHash())
  }
})
