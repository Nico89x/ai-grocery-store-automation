import type { Order } from '../domain/simulation';

export interface WebhookResult { mode:'local'|'connected'; description:string; executionId?:string; receivedAt?:string }
export function orderPayload(order:Order,session:number) {
  return {schemaVersion:1, demo:true, event:'order.completed', idempotencyKey:`${session}:${order.id}`, order:{id:order.id,source:order.source,createdAt:order.createdAt,totalCents:order.total,items:order.lines},lowStockProducts:order.warnings};
}

/** Einziger externer Erweiterungspunkt. Die lokale Buchung ist bereits abgeschlossen.
 * Kein Geheimnis im Browser: für produktive Integrationen einen eigenen Server verwenden.
 */
export async function deliverOrder(order:Order,session:number,url='',signal?:AbortSignal,transport:typeof fetch=fetch):Promise<WebhookResult> {
  if(!url.trim())return {mode:'local',description:'Lokale Demo-Verarbeitung · kein externer Dienst konfiguriert.'};
  try {
    const parsed=new URL(url);
    if(parsed.protocol!=='https:' && !(parsed.protocol==='http:' && ['localhost','127.0.0.1'].includes(parsed.hostname)))throw new Error('HTTPS-URL erforderlich');
    const timeout=AbortSignal.timeout(5000);
    const response=await transport(parsed.toString(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(orderPayload(order,session)),signal:signal?AbortSignal.any([signal,timeout]):timeout});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const receipt:unknown=await response.json();
    if(!receipt||typeof receipt!=='object')throw new Error('Ungültiger Empfangsbeleg');
    const proof=receipt as Record<string,unknown>;
    if(proof.accepted!==true||proof.demo!==true||proof.schemaVersion!==1||proof.processor!=='n8n'||proof.idempotencyKey!==orderPayload(order,session).idempotencyKey||proof.orderId!==order.id||proof.totalCents!==order.total||typeof proof.executionId!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(proof.executionId)||typeof proof.receivedAt!=='string'||!Number.isFinite(Date.parse(proof.receivedAt)))throw new Error('Empfang nicht bestätigt');
    return {mode:'connected',description:`Webhook verbunden · ${order.id} bestätigt · n8n-Ausführung ${proof.executionId}.`,executionId:proof.executionId,receivedAt:proof.receivedAt};
  }catch(error) {
    if(signal?.aborted)throw error;
    return {mode:'local',description:'Webhook nicht erreichbar. Kauf vollständig lokal verarbeitet; keine Rücknahme der Bestandsbuchung.'};
  }
}
