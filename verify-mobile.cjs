const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');

async function main() {
  fs.mkdirSync('test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [390, 320, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto((process.env.TEMPUS_BASE_URL || 'http://127.0.0.1:4174') + '/contratar', { waitUntil: 'networkidle' });
      await expect(page.getByRole('img', { name: 'Tempus', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const navigation = page.getByRole('group', { name: 'Navegar entre planos' });
      await navigation.getByRole('button', { name: 'Profissional', exact: true }).tap();
      await expect(navigation.getByRole('button', { name: 'Profissional', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await navigation.getByRole('button', { name: 'Premium', exact: true }).tap();
      await expect(navigation.getByRole('button', { name: 'Premium', exact: true })).toHaveAttribute('aria-pressed', 'true');
      const cta = page.getByRole('button', { name: 'Escolher Premium', exact: true });
      expect((await cta.boundingBox()).height).toBeGreaterThanOrEqual(48);
      if (width === 390) {
        await navigation.getByRole('button', { name: 'Essencial', exact: true }).tap();
        await expect(navigation.getByRole('button', { name: 'Essencial', exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect.poll(() => page.locator('.premium-plans-grid').evaluate(el => el.scrollLeft)).toBeLessThan(2);
        // Verify a real touch swipe updates the active-plan control.
        await page.evaluate(() => window.scrollTo(0, 160));
        const cardBox = await page.locator('#plan-essencial').boundingBox();
        const swipeY = Math.min(650, cardBox.y + 90);
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y: swipeY }] });
        for (const x of [290, 260, 230, 200, 170, 140, 110, 80, 45]) {
          await page.waitForTimeout(25);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: swipeY }] });
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expect.poll(() => navigation.getByRole('button', { name: 'Essencial', exact: true }).getAttribute('aria-pressed')).toBe('false');
        await navigation.getByRole('button', { name: 'Profissional', exact: true }).tap();
        await expect(navigation.getByRole('button', { name: 'Profissional', exact: true })).toHaveAttribute('aria-pressed', 'true');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: 'test-results/tempus-mobile-first.png', fullPage: true });
        const scene = page.locator('.plan-stage');
        const before = await scene.evaluate(el => parseFloat(el.style.getPropertyValue('--scene-scroll')));
        await page.evaluate(() => window.scrollTo(0, 350));
        await expect.poll(() => scene.evaluate(el => parseFloat(el.style.getPropertyValue('--scene-scroll')))).toBeGreaterThan(before);
        expect(await page.locator('.subscription-card').first().evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42)).toBe(0);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await expect.poll(() => scene.evaluate(el => el.style.getPropertyValue('--scene-scroll'))).toBe('0px');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await navigation.getByRole('button', { name: 'Premium', exact: true }).tap();
        await expect(navigation.getByRole('button', { name: 'Premium', exact: true })).toHaveAttribute('aria-pressed', 'true');
      }
      await cta.tap();
      await expect(page.getByRole('button', { name: 'Continuar com Google', exact: true })).toBeVisible();
      await expect(page.locator('.selected-plan')).toContainText('Premium');
      console.log(`PASS ${width}px: plan navigation, touch target, correct checkout and no overflow`);
    }
    await context.close();
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await desktop.goto((process.env.TEMPUS_BASE_URL || 'http://127.0.0.1:4174') + '/contratar', { waitUntil: 'networkidle' });
    const atmosphere = desktop.locator('.plan-ambient');
    const before = await atmosphere.evaluate(el => getComputedStyle(el).transform);
    await desktop.evaluate(() => window.scrollTo(0, 300));
    await expect.poll(() => atmosphere.evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
    expect(await desktop.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    console.log('PASS native swipe, mobile background parallax, stable cards, reduced motion and desktop parallax');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
