import { useState } from 'react';
export function WebhookSettings({url,onConfigure}:{url:string;onConfigure:(url:string)=>void}) {
  const [draft,setDraft]=useState(url),[error,setError]=useState('');
  return <details className="webhook-settings"><summary>n8n-Testverbindung konfigurieren</summary>
    <p>Optional: Nur synthetische Demo-Artikel werden übertragen. Ohne URL arbeitet alles lokal. Bereits abgeschlossene Bestellungen werden nicht nachgesendet.</p>
    <form onSubmit={e=>{e.preventDefault();try{const parsed=new URL(draft);if(parsed.protocol!=='https:'&&!(parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname)))throw new Error();setError('');onConfigure(parsed.toString());}catch{setError('Bitte eine HTTPS-URL oder eine lokale HTTP-URL eingeben.');}}}>
      <label htmlFor="webhook-url">Webhook-URL (ohne Zugangsdaten)</label>
      <input id="webhook-url" type="url" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="https://dein-n8n.example/webhook/demo" autoComplete="off" required/>
      {error&&<p role="alert">{error}</p>}
      <button className="button secondary full" type="submit">Für nächsten Demo-Kauf aktivieren</button>
    </form>
    <button className="text-button" onClick={()=>{setDraft('http://localhost:5678/webhook/ai-grocery-portfolio-demo');setError('');}}>Lokale n8n-Test-URL einsetzen</button>
    <button className="text-button" onClick={()=>{setDraft('');setError('');onConfigure('');}}>Nur lokale Demo-Verarbeitung</button>
    <p className="fine">n8n muss auf deinem Gerät laufen oder per HTTPS erreichbar sein. Ein bestätigter Empfang zeigt eine echte n8n-Ausführungs-ID. Die Lagerbuchung bleibt lokal.</p>
  </details>;
}
