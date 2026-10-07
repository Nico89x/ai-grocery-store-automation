import type { CSSProperties } from 'react';
export type IconName='store'|'cart'|'arrow'|'play'|'pause'|'reset'|'fast'|'close'|'check'|'robot'|'layers'|'activity'|'box'|'warning'|'minus'|'plus'|'trash'|'expand'|'home';
const paths:Record<IconName,string>={
  store:'M3 10h18l-2-6H5l-2 6Zm1 0v10h16V10M9 20v-6h6v6M3 10c0 4 5 4 5 0 0 4 8 4 8 0 0 4 5 4 5 0',
  cart:'M3 3h2l3 12h10l3-8H6m3 13h.01M18 20h.01',arrow:'M4 12h16m-6-6 6 6-6 6',
  play:'m8 4 12 8-12 8V4Z',pause:'M8 5v14M16 5v14',reset:'M3 10a9 9 0 1 1 2 9M3 4v6h6',fast:'m3 5 9 7-9 7V5Zm9 0 9 7-9 7V5Z',
  close:'m6 6 12 12M6 18 18 6',check:'m5 12 4 4L19 6',robot:'M6 8h12a3 3 0 0 1 3 3v7H3v-7a3 3 0 0 1 3-3Zm6 0V4M9 13h.01M15 13h.01M8 21h8M8 17h8',
  layers:'m12 3 10 6-10 6L2 9l10-6Zm-10 11 10 6 10-6M2 18l10 6 10-6',activity:'M2 12h5l3-8 4 16 3-8h5',box:'m12 3 9 5v9l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v9M7 5l10 6',
  warning:'m12 3 10 18H2L12 3Zm0 6v5m0 3h.01',minus:'M5 12h14',plus:'M5 12h14M12 5v14',trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5',home:'m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7'
};
export function Icon({name,size=20,style}:{name:IconName;size?:number;style?:CSSProperties}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={style}><path d={paths[name]}/></svg>;
}
