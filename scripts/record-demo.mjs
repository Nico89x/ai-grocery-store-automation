import { chromium, expect } from '@playwright/test';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const target=process.env.DEMO_URL??'http://127.0.0.1:4173/';
await mkdir('work/video',{recursive:true});await mkdir('public',{recursive:true});
const browser=await chromium.launch({channel:'chromium',args:['--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:'work/video',size:{width:1440,height:1000}}});
const page=await context.newPage();
try {
  await page.goto(target);await expect(page.locator('canvas')).toBeVisible({timeout:30000});
  await page.waitForTimeout(3500);
  await page.getByRole('button',{name:'Simulation starten',exact:true}).click();
  await page.getByRole('button',{name:'Kund:innen pausieren',exact:true}).click();
  await page.getByRole('button',{name:'Simulation beschleunigen',exact:true}).click();
  await page.getByRole('button',{name:'Laden betreten',exact:true}).click();
  await page.locator('canvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3500);
  await page.getByRole('button',{name:/^Kesselchips Meersalz –/}).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:'In Warenkorb',exact:true}).click();
  await page.getByRole('button',{name:/Warenkorb ansehen/}).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:'Demo-Kauf auslösen',exact:true}).click();
  await expect(page.locator('.success-note')).toBeVisible({timeout:20000});
  await page.locator('.workflow-panel').scrollIntoViewIfNeeded();await page.waitForTimeout(4500);
  await page.getByLabel('Fehler beim Workflow simulieren',{exact:true}).check();
  await page.getByRole('button',{name:/^Mineralwasser still –/}).click();
  await page.getByRole('button',{name:'In Warenkorb',exact:true}).click();
  await page.getByRole('button',{name:/Warenkorb ansehen/}).click();
  await page.getByRole('button',{name:'Demo-Kauf auslösen',exact:true}).click();
  await expect(page.getByRole('button',{name:'Erneut versuchen',exact:true})).toBeVisible({timeout:20000});
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:'Erneut versuchen',exact:true}).click();
  await expect(page.locator('.success-note')).toBeVisible();await page.waitForTimeout(2500);
  await page.getByRole('button',{name:'Augenhöhe',exact:true}).click();
  await page.getByRole('button',{name:'Kund:innen starten',exact:true}).click();
  await page.locator('canvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(14000);
  await page.screenshot({path:'public/demo-poster.png'});
  await page.waitForTimeout(2500);
} finally {
  await context.close();
  const videoPath=await page.video().path();
  await copyFile(videoPath,path.resolve('work/video/demo-source.webm'));
  await browser.close();
}
console.log('Echte Browseraufnahme gespeichert: work/video/demo-source.webm. Mit FFmpeg nach public/demo.mp4 exportieren.');
