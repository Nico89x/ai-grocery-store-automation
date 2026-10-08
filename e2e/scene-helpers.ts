import { expect, type Page } from '@playwright/test';
import { PerspectiveCamera, Vector3 } from 'three';
export async function selectChipsMesh(page:Page) {
  await page.getByRole('button',{name:'Laden',exact:true}).click();
  await expect(page.locator('.scene-overlays')).not.toHaveClass(/camera-moving/);
  await page.locator('canvas').scrollIntoViewIfNeeded();
  const box=await page.locator('canvas').boundingBox();
  if(!box)throw new Error('3D-Canvas fehlt');
  // Public scene coordinates, independent of React state and DOM product buttons.
  const aspect=box.width/box.height;
  const camera=new PerspectiveCamera(49+(aspect<1.1?24:0),aspect,.1,90);
  camera.position.set(.5,3.4,8.8);camera.lookAt(0,1,-1.1);camera.updateMatrixWorld();
  const point=new Vector3(-3.9,1.49,1.9).project(camera);
  expect(Math.abs(point.x)).toBeLessThan(1);
  expect(Math.abs(point.y)).toBeLessThan(1);
  await page.mouse.click(box.x+(point.x+1)*box.width/2,box.y+(1-point.y)*box.height/2);
  await expect(page.getByRole('dialog',{name:'Produktdetails'})).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Kesselchips Meersalz',exact:true})).toBeVisible();
}
