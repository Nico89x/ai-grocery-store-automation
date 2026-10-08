import { useEffect,useReducer,useRef,useState } from 'react';
import { initialState,reducer } from '../domain/simulation';
import { deliverOrder,type WebhookResult } from '../services/webhook';

export function useSimulation() {
  const [state,dispatch]=useReducer(reducer,undefined,()=>initialState());
  const [webhook,setWebhook]=useState<WebhookResult>({mode:'local',description:'Lokale Demo-Verarbeitung · kein externer Dienst konfiguriert.'});
  const deliveries=useRef(new Set<string>()),controllers=useRef(new Set<AbortController>()),session=useRef(state.session);
  useEffect(()=>{
    let last=performance.now();
    const timer=window.setInterval(()=>{const now=performance.now();dispatch({type:'tick',dt:now-last,now:Date.now()});last=now;},250);
    return()=>window.clearInterval(timer);
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
      void deliverOrder(order,state.session,import.meta.env.VITE_AUTOMATION_WEBHOOK_URL??'',controller.signal)
        .then(result=>{if(session.current===currentSession&&!controller.signal.aborted)setWebhook(result);})
        .catch(()=>{/* Abbruch bei Reset oder Verlassen ist kein Workflow-Fehler. */})
        .finally(()=>controllers.current.delete(controller));
    }
  },[state.orders,state.session]);
  useEffect(()=>()=>controllers.current.forEach(c=>c.abort()),[]);
  return {state,dispatch,webhook};
}
