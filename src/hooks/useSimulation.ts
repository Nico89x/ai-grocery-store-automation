import { useEffect,useReducer,useRef,useState } from 'react';
import { initialState,reducer } from '../domain/simulation';
import { deliverOrder,type WebhookResult } from '../services/webhook';

export function useSimulation() {
  const [state,dispatch]=useReducer(reducer,undefined,()=>initialState());
  const [webhookUrl,setWebhookUrl]=useState(import.meta.env.VITE_AUTOMATION_WEBHOOK_URL??'');
  const [webhook,setWebhook]=useState<WebhookResult>({mode:'local',description:'Lokale Demo-Verarbeitung · kein externer Dienst konfiguriert.'});
  const deliveries=useRef(new Set<string>()),controllers=useRef(new Set<AbortController>()),session=useRef(state.session);
  useEffect(()=>{
    let last=performance.now();
    const timer=window.setInterval(()=>{const now=performance.now();if(!document.hidden)dispatch({type:'tick',dt:now-last,now:Date.now()});last=now;},250);
    const resetClock=()=>{last=performance.now();};
    document.addEventListener('visibilitychange',resetClock);
    return()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',resetClock);};
  },[]);
  useEffect(()=>{
    if(session.current!==state.session) {
      controllers.current.forEach(c=>c.abort());controllers.current.clear();deliveries.current.clear();session.current=state.session;
      setWebhook({mode:'local',description:'Lokale Demo-Verarbeitung · bereit für einen neuen Ablauf.'});
    }
    for(const order of state.orders.filter(o=>o.status==='completed')) {
      if(deliveries.current.has(order.id))continue;
      deliveries.current.add(order.id);
      const controller=new AbortController();controllers.current.add(controller);
      const currentSession=state.session;
      void deliverOrder(order,state.session,webhookUrl,controller.signal)
        .then(result=>{if(session.current===currentSession&&!controller.signal.aborted)setWebhook(result);})
        .catch(()=>{/* Abbruch bei Reset oder Verlassen ist kein Workflow-Fehler. */})
        .finally(()=>controllers.current.delete(controller));
    }
  },[state.orders,state.session,webhookUrl]);
  useEffect(()=>()=>controllers.current.forEach(c=>c.abort()),[]);
  function configureWebhook(url:string) {
    controllers.current.forEach(c=>c.abort());
    setWebhookUrl(url.trim());
    setWebhook({mode:'local',description:url.trim()?'Webhook konfiguriert · Empfang wird beim nächsten abgeschlossenen Demo-Kauf geprüft.':'Lokale Demo-Verarbeitung · kein externer Dienst konfiguriert.'});
  }
  return {state,dispatch,webhook,webhookUrl,configureWebhook};
}
