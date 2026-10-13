import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:4173';
const base = '/transformer-explainer/';
let ready = false;
for (let attempt = 0; attempt < 90; attempt++) {
  try { const result = await fetch(origin + base); if (result.ok) {ready = true; break;} } catch {}
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
assert.ok(ready, 'Production preview did not become ready at expected GitHub Pages base');

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [], modelRequests = [], tokenizerRequests = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (request) => {
    if (/gpt2\.onnx\.part\d+/.test(request.url())) modelRequests.push(request.url());
    if (/huggingface\.co.*(tokenizer|gpt2)/i.test(request.url())) tokenizerRequests.push(request.url());
  });
  const response = await page.goto(origin + base, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  assert.equal(response?.status(), 200);
  const present = page.getByRole('button', { name: 'Presentar', exact: true });
  await present.waitFor({ timeout: 45_000 });
  assert.equal(modelRequests.length, 0, 'Demo downloaded large ONNX weights automatically');
  assert.equal(tokenizerRequests.length, 0, 'Demo contacted Hugging Face for a tokenizer');
  // The second snapshot must load dynamically, still without GPT-2 runtime assets.
  const examplesButton = page.locator('[data-click="dropdown-btn"]');
  await examplesButton.waitFor();
  await page.waitForFunction(() => {
    const control = document.querySelector('[data-click="dropdown-btn"]');
    return control && !control.disabled;
  }, { timeout: 45_000 });
  await examplesButton.click();
  const nextExample = page.locator('[data-click="dropdown-item-1"]');
  await nextExample.waitFor({ timeout: 15_000 });
  await nextExample.click();
  await page.getByText('Artificial Intelligence is transforming the', { exact: false }).first().waitFor();
  assert.equal(modelRequests.length, 0);
  assert.equal(tokenizerRequests.length, 0);
  await present.click();
  await page.getByText('Diapositiva 1 / 6').waitFor();
  const next = page.locator('.workshop-nav button').last();
  await next.click();
  await page.getByText('Diapositiva 2 / 6').waitFor();
  for (let step = 3; step <= 6; step++) {
    await next.click();
    await page.getByText(`Diapositiva ${step} / 6`).waitFor();
  }
  await page.getByText('Experimento · Softmax').waitFor();
  await page.getByRole('button', { name: 'No', exact: true }).click();
  await page.getByRole('status').getByText(/Correcto/).waitFor();
  const slider = page.locator('.exercise input[type=range]');
  const before = await slider.inputValue();
  await slider.focus(); await page.keyboard.press('End');
  const after = await slider.inputValue();
  assert.notEqual(before, after, 'Temperature slider did not change');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByText('Experiment · Softmax').waitFor();
  assert.equal(modelRequests.length, 0);
  assert.equal(tokenizerRequests.length, 0);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/workshop-presentation.png', fullPage: false });
  assert.deepEqual(errors, [], 'Uncaught browser errors: ' + errors.join('; '));
  console.log('Browser smoke passed: demo, 6 slides, softmax, language, no heavy model fetch');
} finally { await browser.close(); }
