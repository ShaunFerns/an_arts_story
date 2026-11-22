import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const source = readFileSync(process.argv[2], 'utf8');
function section(start, end) {
  const first = source.indexOf(start);
  const last = source.indexOf(end, first + start.length);
  if (first < 0 || last < 0) throw Error('Unexpected v1.3 source structure: ' + start);
  return source.slice(first, last).trim();
}
const digest = createHash('sha256').update(source).digest('hex');
const sections = [
  section('const places=[', 'let state='),
  section('const html=s=>', 'const addUnique='),
  section('function storyMarkup(', 'function canBegin('),
  section('function degreeMarkup(', 'function allocated('),
  section('const N={', 'function renderIntro(')
    .replace('Sam’s idea','Cian’s idea')
    .replace("Sam's plan","Cian's plan")
    .replace('A small favour for Leah','A small favour for Saoirse'),
  section('function guideMarkup()', 'function storeSurvey(').replace(/function surveyData\(\)[\s\S]*$/, ''),
  section('function renderEnding()', 'function phone(){'),
];
const stateful = sections.slice(-2).join('\n').replace(
  /function (exitSurveyMarkup|renderEnding)\(\)/g, 'function $1(state)',
);
writeFileSync(new URL('../geo/assets/semester/source.mjs', import.meta.url),
  '// Generated from First_Semester_An_Arts_Story_Playable_v1_3.html.\n' +
  '// SHA-256 ' + digest + '\n\n' + sections.slice(0,-2).join('\n\n') + '\n\n' +
  stateful.trim() + '\n\n' +
  'export {N as nodes, CHAPTERS as chapters, places, FRIEND_LEADS as leads, missionInfo, base, MODULES as modules, makeModules, storyMarkup, degreeMarkup, guideMarkup, exitSurveyMarkup, renderEnding};\n',
);
