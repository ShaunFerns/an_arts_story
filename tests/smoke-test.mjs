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
await page.waitForTimeout(1500);
const gameplay = await page.evaluate(() => ({
  startHidden: document.querySelector('#startScreen')?.hidden,
  dialogueVisible: getComputedStyle(document.querySelector('#dialogueOverlay')).display,
  canvas: document.querySelector('#app canvas')?.getBoundingClientRect().width
}));
console.log('After start:', JSON.stringify(gameplay));
if(!gameplay.startHidden) process.exitCode=1;
await browser.close();
