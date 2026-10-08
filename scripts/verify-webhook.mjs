import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const url=process.env.N8N_TEST_WEBHOOK_URL??'http://localhost:5678/webhook/ai-grocery-portfolio-demo';
const payload=JSON.parse(await readFile(new URL('../automation/example-order.json',import.meta.url),'utf8'));
payload.idempotencyKey=`${Date.now()}:DEMO-001`;
const accepted=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:4173'},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
assert.equal(accepted.status,200);const receipt=await accepted.json();
assert.equal(receipt.accepted,true);assert.equal(receipt.idempotencyKey,payload.idempotencyKey);
assert.equal(receipt.totalCents,249);assert.equal(receipt.notifications.length,1);
assert.equal(receipt.notifications[0].simulated,true);
const invalid=[];
for(const changed of [{...payload,demo:false},{...payload,order:{...payload.order,totalCents:1}}]) {
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(changed),signal:AbortSignal.timeout(10000)});
  assert.equal(response.status,400);const data=await response.json();assert.equal(data.accepted,false);
  invalid.push({status:response.status,description:data.description});
}
await writeFile(new URL('../docs/n8n-http-verification.json',import.meta.url),JSON.stringify({verifiedAt:new Date().toISOString(),receipt,invalid},null,2));
console.log(`n8n HTTP-Nachweis: Ausführung ${receipt.executionId}, Warnung simuliert, beide ungültigen Ereignisse mit HTTP 400 abgelehnt.`);
