import { useEffect,useRef,type ReactNode } from 'react';
import { Icon } from './Icon';
export function Modal({title,onClose,children,className=''}:{title:string;onClose:()=>void;children:ReactNode;className?:string}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current!;dialog.showModal();return()=>dialog.close();},[]);
  return <dialog ref={ref} className={`modal ${className}`} aria-label={title} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <button className="icon-button modal-close" aria-label={`${title} schließen`} onClick={onClose}><Icon name="close"/></button>{children}
  </dialog>;
}
