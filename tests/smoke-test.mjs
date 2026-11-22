import { chromium } from 'playwright';

const messages = [];
const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
page.on('console', message => {if (message.type() === 'error' || message.type() === 'warning') messages.push('Console: ' + message.text())});
page.on('pageerror', error => messages.push('Page error: ' + (error.stack || error.message)));
await page.goto('http://127.0.0.1:8765/', { waitUntil: 'load' });
await page.waitForFunction(() => window.__artsThreeReady || window.__artsEngineFailed, {timeout: 20000});
const result = await page.evaluate(() => ({
  ready: !!window.__artsThreeReady, failed: !!window.__artsEngineFailed,
  status: document.querySelector('#engineStatus')?.textContent,
  help: document.querySelector('#threeHelp')?.innerText,
  canvas: !!document.querySelector('#app canvas')
}));
console.log('3D startup state:', JSON.stringify(result));
console.log('Browser warnings and errors:', JSON.stringify(messages.slice(-25), null, 2));
if (!result.ready || !result.canvas) {
  await page.screenshot({ path: '/tmp/arts-three-startup-failure.png', fullPage: true });
  await browser.close();
  process.exit(1);
}
await page.locator('#startFull').click();
await page.waitForTimeout(900);
const arrival = await page.evaluate(() => ({
  running: window.__artsArrival?.active,
  visible: !document.querySelector('#arrivalScene')?.hidden,
  startHidden: document.querySelector('#startScreen')?.hidden
}));
console.log('Luas arrival cinematic:', JSON.stringify(arrival));
if(!arrival.running || !arrival.visible || !arrival.startHidden) {
  throw new Error('The in-engine Luas cinematic did not start correctly');
}
await page.locator('#arrivalSkip').click();
await page.waitForTimeout(400);
const gameplay = await page.evaluate(() => ({
  arrivalHidden: document.querySelector('#arrivalScene')?.hidden,
  dialogueVisible: getComputedStyle(document.querySelector('#dialogueOverlay')).display,
  canvas: document.querySelector('#app canvas')?.getBoundingClientRect().width
}));
console.log('After skipping arrival:', JSON.stringify(gameplay));
if(!gameplay.arrivalHidden || gameplay.dialogueVisible!=='flex' || !gameplay.canvas) {
  throw new Error('Luas cinematic failed to transfer control to the interactive story');
}
// Before the Friday publication scene the student's own timetable must not be shown.
await page.locator('#dialogueChoices .choiceBtn').first().click();
await page.keyboard.press('p');
await page.locator('#phoneTabs .tabBtn').filter({ hasText:'Timetable' }).click();
const timetableText = await page.locator('#phoneContent').innerText();
console.log('Timetable before publication:', timetableText.slice(0, 180));
if (!timetableText.toLowerCase().includes('awaiting publication') || !timetableText.toLowerCase().includes('friday')) {
  throw new Error('The induction timetable must remain unpublished until Friday before classes');
}
await page.locator('#phoneCloseBtn').click();
console.log('3D arrival, skip, story, and timetable-timing smoke checks passed');
await browser.close();
