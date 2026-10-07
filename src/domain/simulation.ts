import { products, productById } from './products';
import { phaseDuration } from './customerJourney';

export type EventName = 'order.created' | 'inventory.checked' | 'inventory.updated' | 'low_stock.detected' | 'notification.sent' | 'order.completed';
export type EventStatus = 'pending' | 'running' | 'success' | 'failed';
export interface Line { productId: string; quantity: number; unitPrice: number }
export interface WorkflowEvent { name: EventName; status: EventStatus; description: string; timestamp?: string }
export interface Order {
  id: string; source: 'manual' | 'customer'; lines: Line[]; total: number;
  status: 'queued' | 'processing' | 'failed' | 'completed'; steps: WorkflowEvent[];
  stepIndex: number; progress: number; inventoryApplied: boolean;
  failRequested: boolean; failedOnce: boolean; attempts: number; createdAt: string;
  warnings: string[];
}
export interface LogEntry { id: number; orderId: string; event: EventName; status: EventStatus; description: string; timestamp: string }
export interface StockWarning { orderId: string; productId: string; remaining: number; timestamp: string }
export type CustomerPhase = 'entering' | 'browsing' | 'to-checkout' | 'checkout' | 'leaving';
export interface Customer { id: number; productId: string; phase: CustomerPhase; elapsed: number; orderId?: string; color: string }
export interface SimulationState {
  cart: Record<string, number>; inventory: Record<string, number>; orders: Order[];
  warnings: StockWarning[]; logs: LogEntry[]; customers: Customer[];
  running: boolean; speed: number; elapsed: number; nextCustomerAt: number;
  customerCounter: number; orderCounter: number; logCounter: number;
  failEnabled: boolean; message: string; session: number;
}
export type Action =
  | {type:'cart.quantity'; productId:string; quantity:number}
  | {type:'cart.checkout'; now:number}
  | {type:'order.create'; quantities:Record<string,number>; source:'manual'|'customer'; now:number}
  | {type:'order.retry'; orderId:string; now:number}
  | {type:'tick'; dt:number; now:number}
  | {type:'running'; value:boolean}
  | {type:'speed'}
  | {type:'failure'; value:boolean}
  | {type:'reset'; now:number}
  | {type:'message.clear'};

export function initialState(now = Date.now()): SimulationState {
  return {cart:{}, inventory:Object.fromEntries(products.map(p => [p.id,p.initialStock])), orders:[], warnings:[], logs:[], customers:[], running:false, speed:1, elapsed:0, nextCustomerAt:6, customerCounter:0, orderCounter:0, logCounter:0, failEnabled:false, message:'', session:now};
}
export const cartTotal = (cart: Record<string,number>) => Object.entries(cart).reduce((sum,[id,q]) => sum + (productById[id]?.price ?? 0)*q,0);
const iso = (now:number) => new Date(now).toISOString();
const step = (name:EventName, description:string):WorkflowEvent => ({name,status:'pending',description});

function log(state:SimulationState, order:Order, event:WorkflowEvent, now:number) {
  state.logs.unshift({id:++state.logCounter,orderId:order.id,event:event.name,status:event.status,description:event.description,timestamp:iso(now)});
  state.logs = state.logs.slice(0,150);
}
function createOrder(state:SimulationState, quantities:Record<string,number>, source:Order['source'], now:number):Order|undefined {
  const entries = Object.entries(quantities);
  if (!entries.length || entries.some(([id,q]) => !productById[id] || !Number.isSafeInteger(q) || q<1 || q>state.inventory[id])) {
    state.message='Bitte wähle verfügbare Produkte und gültige Mengen aus.'; return;
  }
  const lines = entries.map(([productId,quantity]) => ({productId,quantity,unitPrice:productById[productId].price}));
  const order:Order = {
    id:`DEMO-${String(++state.orderCounter).padStart(3,'0')}`, source, lines,
    total:lines.reduce((sum,l) => sum+l.quantity*l.unitPrice,0), status:'queued',
    steps:[step('order.created','Demo-Bestellung mit Artikeln und Endpreisen erzeugen.'),step('inventory.checked','Alle Mengen gegen den aktuellen Lagerbestand prüfen.'),step('inventory.updated','Bestand einmalig und gemeinsam für alle Artikel buchen.'),step('order.completed','Demo-Kauf abschließen. Keine Zahlung, keine echte Bestellung.')],
    stepIndex:0,progress:0,inventoryApplied:false,failRequested:source==='manual' && state.failEnabled,
    failedOnce:false,attempts:1,createdAt:iso(now),warnings:[]
  };
  state.orders.push(order); state.message=''; return order;
}
function available(state:SimulationState, order:Order) {
  return order.lines.every(l => state.inventory[l.productId]>=l.quantity);
}
function fail(state:SimulationState,order:Order,event:WorkflowEvent,now:number,description:string) {
  order.status='failed'; event.status='failed'; event.timestamp=iso(now); event.description=description; order.progress=0; log(state,order,event,now);
}
function advanceWorkflow(state:SimulationState,dt:number,now:number) {
  const order = state.orders.find(o=>o.status==='processing') ?? state.orders.find(o=>o.status==='queued');
  if (!order) return;
  order.status='processing'; const event=order.steps[order.stepIndex];
  if (event.status==='pending') {event.status='running';event.timestamp=iso(now);log(state,order,event,now);}
  order.progress+=dt;
  if (order.progress<900) return;
  order.progress=0;
  // Fehler absichtlich NACH der Buchung: Retry darf nichts doppelt abbuchen.
  if (event.name==='order.completed' && order.failRequested && !order.failedOnce) {
    order.failedOnce=true;
    fail(state,order,event,now,'Testfehler beim Abschluss. Der Bestand ist bereits gebucht; Retry setzt hier fort.'); return;
  }
  if ((event.name==='inventory.checked' || event.name==='inventory.updated') && !order.inventoryApplied && !available(state,order)) {
    fail(state,order,event,now,'Bestand reicht nicht mehr für alle Artikel. Keine Teilbuchung. Bestellung zurücksetzen oder nach Auffüllung erneut versuchen.'); return;
  }
  if (event.name==='inventory.updated' && !order.inventoryApplied) {
    for (const line of order.lines) {
      const p=productById[line.productId],before=state.inventory[p.id],after=before-line.quantity;
      state.inventory[p.id]=after;
      // Ein Warnereignis pro Grenzübertritt, keine Warnungsflut bei jedem Folgekauf.
      if (before>=p.minStock && after<p.minStock) {
        state.warnings.push({orderId:order.id,productId:p.id,remaining:after,timestamp:iso(now)});
        order.warnings.push(p.id);
      }
    }
    order.inventoryApplied=true;
    event.description=order.lines.map(l=>`${productById[l.productId].shortName}: −${l.quantity}, jetzt ${state.inventory[l.productId]} Stück`).join(' · ');
    if (order.warnings.length) {
      order.steps.splice(order.stepIndex+1,0,
        step('low_stock.detected',order.warnings.map(id=>`${productById[id].shortName} liegt unter dem Mindestbestand ${productById[id].minStock}.`).join(' ')),
        step('notification.sent','E-Mail-/Slack-Warnung an das Lagerteam simulieren. Es wird keine Nachricht versendet.')
      );
    }
  }
  if (event.name==='inventory.checked') event.description='Bestand für alle Artikel verfügbar. Prüfung erfolgreich.';
  if (event.name==='order.created') event.description=`${order.id} lokal erzeugt · ${order.lines.reduce((n,l)=>n+l.quantity,0)} Artikel · ${order.source==='manual'?'Manueller Demo-Kauf':'Animierte Demo-Kund:in'}.`;
  if (event.name==='notification.sent') event.description=`E-Mail-/Slack-Warnung für ${order.warnings.length} Produkt${order.warnings.length===1?'':'e'} lokal simuliert. Keine externe Nachricht.`;
  if (event.name==='order.completed') event.description=order.attempts>1?'Demo-Kauf erfolgreich abgeschlossen. Bestand genau einmal gebucht; Retry hat den Abschluss fortgesetzt.':'Demo-Kauf erfolgreich abgeschlossen. Keine Zahlung, keine echte Bestellung.';
  event.status='success';event.timestamp=iso(now); log(state,order,event,now);
  order.stepIndex++;
  if (order.stepIndex>=order.steps.length) order.status='completed';
}
function advanceCustomers(state:SimulationState,dt:number,now:number) {
  const seconds=dt/1000;
  if (state.elapsed>=state.nextCustomerAt && state.customers.length<3 && state.orders.length<60) {
    const list=products.filter(p=>state.inventory[p.id]>0);
    if (list.length) {
      const index=state.customerCounter===0?list.findIndex(p=>p.id==='juice'):state.customerCounter%list.length;
      const p=list[Math.max(0,index)]; const id=++state.customerCounter;
      state.customers.push({id,productId:p.id,phase:'entering',elapsed:0,color:['#6b8f83','#d19864','#7d82a9'][id%3]});
    }
    state.nextCustomerAt=state.elapsed+16;
  }
  for (const c of state.customers) {
    c.elapsed+=seconds;
    if (c.phase==='entering' && c.elapsed>=phaseDuration(c,'entering')) {c.phase='browsing';c.elapsed=0;}
    else if (c.phase==='browsing' && c.elapsed>=phaseDuration(c,'browsing')) {c.phase='to-checkout';c.elapsed=0;}
    else if (c.phase==='to-checkout' && c.elapsed>=phaseDuration(c,'to-checkout')) {
      c.phase='checkout';c.elapsed=0;
      const o=createOrder(state,{[c.productId]:1},'customer',now);
      if(o)c.orderId=o.id;else c.phase='leaving';
    } else if(c.phase==='checkout') {
      const o=state.orders.find(o=>o.id===c.orderId);
      if(o?.status==='completed'||o?.status==='failed') {c.phase='leaving';c.elapsed=0;}
    }
  }
  state.customers=state.customers.filter(c=>c.phase!=='leaving'||c.elapsed<phaseDuration(c,'leaving'));
}

export function reducer(previous:SimulationState,action:Action):SimulationState {
  if(action.type==='reset')return initialState(action.now);
  if(action.type==='tick' && !previous.running && !previous.orders.some(o=>o.status==='processing'||o.status==='queued'))return previous;
  const state=structuredClone(previous);
  switch(action.type) {
    case 'cart.quantity': {
      if(!productById[action.productId]||!Number.isSafeInteger(action.quantity))return previous;
      const quantity=Math.max(0,Math.min(action.quantity,state.inventory[action.productId]));
      if(quantity)state.cart[action.productId]=quantity;else delete state.cart[action.productId];
      break;
    }
    case 'cart.checkout': {
      const o=createOrder(state,state.cart,'manual',action.now);
      if(o)state.cart={};break;
    }
    case 'order.create': createOrder(state,action.quantities,action.source,action.now);break;
    case 'order.retry': {
      const o=state.orders.find(o=>o.id===action.orderId);
      if(o?.status==='failed') {
        o.status='queued';o.attempts++;o.progress=0;
        const e=o.steps[o.stepIndex];e.status='pending';e.timestamp=undefined;
        e.description=o.inventoryApplied?'Abschluss erneut versuchen. Vorherige Bestandsbuchung bleibt erhalten.':'Bestandsprüfung erneut versuchen.';
        state.message='';
      }break;
    }
    case 'tick': {
      const dt=Math.min(1000,Math.max(0,action.dt))*state.speed;
      if(state.running) {state.elapsed+=dt/1000;advanceCustomers(state,dt,action.now);}
      // Besucher-Pause unterbricht keinen bereits ausgelösten Kauf.
      advanceWorkflow(state,dt,action.now);break;
    }
    case 'running':state.running=action.value;break;
    case 'speed':state.speed=state.speed===1?4:1;break;
    case 'failure':state.failEnabled=action.value;break;
    case 'message.clear':state.message='';break;
  }
  return state;
}
