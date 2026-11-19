import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {storyClips} from '../public/stories.mjs';
const renderer=fileURLToPath(new URL('./render-voices.py',import.meta.url));
execFileSync('python3',[renderer],{input:JSON.stringify(storyClips()),stdio:['pipe','inherit','inherit']});
writeFileSync(new URL('../public/performance.mjs',import.meta.url),'export const recorded = true;\n');
