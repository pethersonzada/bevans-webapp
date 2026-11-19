'use client';
import {useEffect,useState} from 'react';

export default function ThemeToggle(){
 const [theme,setTheme]=useState(null);
 useEffect(()=>{
  const current=document.documentElement.dataset.theme==='dark'?'dark':'light';
  setTheme(current);
  const sync=e=>{if(e.key!=='bevans-theme')return;const next=e.newValue==='dark'?'dark':'light';document.documentElement.dataset.theme=next;document.documentElement.style.colorScheme=next;setTheme(next);};
  window.addEventListener('storage',sync);
  return()=>window.removeEventListener('storage',sync);
 },[]);
 const change=()=>{
  const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=next;
  document.documentElement.style.colorScheme=next;
  try{localStorage.setItem('bevans-theme',next);}catch{}
  setTheme(next);
 };
 const dark=theme==='dark';
 return <button type="button" className="bev-theme-toggle" onClick={change}
   aria-label={dark?'Ativar modo claro':'Ativar modo escuro'} title={dark?'Modo claro':'Modo escuro'}
   aria-pressed={dark}>
   {dark?<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z"/></svg>}
   <span>{dark?'Claro':'Escuro'}</span>
 </button>;
}
