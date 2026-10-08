import { describe,it,expect,vi } from 'vitest';
import { initialState,reducer,cartTotal,type SimulationState } from './simulation';
import { deliverOrder,orderPayload } from '../services/webhook';

function finish(s:SimulationState) {for(let i=0;i<40;i++)s=reducer(s,{type:'tick',dt:250,now:100000+i*250});return s;}
const buy=(s:SimulationState,q:Record<string,number>)=>reducer(s,{type:'order.create',quantities:q,source:'manual',now:10000});
describe('Lokale Bestellverarbeitung',()=>{
  it('rechnet Mengen und Preise exakt in Cent und begrenzt den Warenkorb',()=>{
    let s=initialState(1);s=reducer(s,{type:'cart.quantity',productId:'chips',quantity:99});
    expect(s.cart.chips).toBe(4);expect(cartTotal({chips:2,water:3})).toBe(765);
    s=reducer(s,{type:'cart.quantity',productId:'chips',quantity:-1});expect(s.cart.chips).toBeUndefined();
    expect(buy(s,{chips:1.5}).orders).toHaveLength(0);
  });
  it('durchläuft die sechs Ereignisse und löst die Niedrigbestandswarnung aus',()=>{
    const s=finish(buy(initialState(1),{chips:1}));
    expect(s.inventory.chips).toBe(3);expect(s.orders[0].status).toBe('completed');
    expect(s.orders[0].steps.map(e=>e.name)).toEqual(['order.created','inventory.checked','inventory.updated','low_stock.detected','notification.sent','order.completed']);
    expect(s.orders[0].steps.every(e=>e.status==='success'&&e.timestamp)).toBe(true);
    expect(s.warnings).toHaveLength(1);
  });
  it('setzt nach dem Testfehler fort, ohne zweimal zu buchen oder zu warnen',()=>{
    let s=reducer(initialState(1),{type:'failure',value:true});s=finish(buy(s,{chips:1}));
    expect(s.orders[0].status).toBe('failed');expect(s.inventory.chips).toBe(3);
    s=finish(reducer(s,{type:'order.retry',orderId:s.orders[0].id,now:20000}));
    expect(s.orders[0].status).toBe('completed');expect(s.orders[0].attempts).toBe(2);
    expect(s.inventory.chips).toBe(3);expect(s.warnings).toHaveLength(1);
    expect(s.logs.filter(l=>l.event==='inventory.updated'&&l.status==='success')).toHaveLength(1);
  });
  it('verhindert negative Bestände und Teilbuchungen bei konkurrierenden Bestellungen',()=>{
    let s=initialState(1);s=buy(s,{chips:4});s=buy(s,{chips:1,water:1});s=finish(s);
    expect(s.orders[0].status).toBe('completed');expect(s.orders[1].status).toBe('failed');
    expect(s.inventory.chips).toBe(0);expect(s.inventory.water).toBe(15);
  });
  it('überspringt Warnschritte ohne Grenzübertritt und vermeidet doppelte Warnungen',()=>{
    let s=finish(buy(initialState(1),{water:1}));expect(s.orders[0].steps).toHaveLength(4);
    s=finish(buy(s,{chips:1}));s=finish(buy(s,{chips:1}));expect(s.warnings).toHaveLength(1);
  });
  it('verarbeitet lange sichtbare Frames wie reguläre Zeitschritte',()=>{
    let regular=reducer(initialState(1),{type:'running',value:true});regular=reducer(regular,{type:'speed'});
    let slow=structuredClone(regular);
    for(let group=0;group<5;group++){
      for(let i=1;i<=12;i++)regular=reducer(regular,{type:'tick',dt:250,now:10000+group*3000+i*250});
      slow=reducer(slow,{type:'tick',dt:3000,now:10000+(group+1)*3000});
    }
    expect(slow).toEqual(regular);
    expect(slow.orders.some(o=>o.source==='customer'&&o.status==='completed')).toBe(true);
    expect(slow.inventory.juice).toBe(9);
  });
  it('verbindet Kundenanimationen mit echten lokalen Bestellereignissen und setzt alles zurück',()=>{
    let s=reducer(initialState(1),{type:'running',value:true});
    for(let i=0;i<220;i++){s=reducer(s,{type:'tick',dt:250,now:10000+i*250});if(s.orders.some(o=>o.source==='customer'&&o.status==='completed'))break;}
    expect(s.orders.some(o=>o.source==='customer'&&o.status==='completed')).toBe(true);
    expect(s.inventory.juice).toBe(9);
    s=reducer(s,{type:'reset',now:999});expect(s).toEqual(initialState(999));
  });
});
describe('Webhook mit lokalem Fallback',()=>{
  const order=finish(buy(initialState(1),{chips:1})).orders[0];
  it('arbeitet ohne URL vollständig lokal und sendet keine Anfrage',async()=>{
    const transport=vi.fn();expect((await deliverOrder(order,1,'',undefined,transport)).mode).toBe('local');expect(transport).not.toHaveBeenCalled();
  });
  it('behält die lokale Verarbeitung bei einem Netzwerkfehler bei',async()=>{
    const transport=vi.fn().mockRejectedValue(new Error('offline'));
    expect((await deliverOrder(order,1,'https://example.test/webhook',undefined,transport)).mode).toBe('local');
  });
  it('liefert einen demo-markierten Payload mit stabilem Idempotenzschlüssel',async()=>{
    const transport=vi.fn().mockResolvedValue({ok:true,json:async()=>({schemaVersion:1,demo:true,accepted:true,processor:'n8n',executionId:'277',idempotencyKey:'1:DEMO-001',orderId:'DEMO-001',totalCents:249,receivedAt:'2026-10-08T07:18:08.366Z'})});
    expect((await deliverOrder(order,1,'https://example.test/webhook',undefined,transport)).mode).toBe('connected');
    const payload=orderPayload(order,1);expect(payload.demo).toBe(true);expect(payload.idempotencyKey).toBe('1:DEMO-001');expect(payload.order.totalCents).toBe(249);
  });
  it('wertet eine leere oder fremde 200-Antwort nicht als bestätigten Empfang',async()=>{
    for(const receipt of [{}, {accepted:true,demo:true,idempotencyKey:'wrong'}]) {
      const transport=vi.fn().mockResolvedValue({ok:true,json:async()=>receipt});
      expect((await deliverOrder(order,1,'https://example.test/webhook',undefined,transport)).mode).toBe('local');
    }
  });
});
