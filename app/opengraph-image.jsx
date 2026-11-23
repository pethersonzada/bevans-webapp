import {ImageResponse} from 'next/og';

// Cartão social em 1200 × 630, sem depender de fontes ou arquivos remotos.
// As imagens e os logotipos oficiais da marca permanecem inalterados.
export const alt='BeVans. Transporte do dia a dia, em um só lugar.';
export const size={width:1200,height:630};
export const contentType='image/png';

export default function OpenGraphImage(){
 return new ImageResponse(
  <div style={{display:'flex',width:'100%',height:'100%',padding:'68px 76px',background:'linear-gradient(120deg,#071b2f 0%,#102f50 63%,#155a90 100%)',color:'#fff',position:'relative',flexDirection:'column',justifyContent:'space-between'}}>
   <div style={{display:'flex',alignItems:'center',gap:15}}>
    <div style={{display:'flex',width:54,height:54,borderRadius:14,backgroundColor:'#e7f4ff',color:'#0757a6',fontSize:30,fontWeight:900,justifyContent:'center',alignItems:'center'}}>B</div>
    <div style={{display:'flex',fontSize:33,fontWeight:750,letterSpacing:-1}}>BeVans</div>
   </div>
   <div style={{display:'flex',flexDirection:'column',gap:18,maxWidth:850,zIndex:1}}>
    <div style={{display:'flex',fontSize:18,fontWeight:750,letterSpacing:2,color:'#9dd1ff'}}>ROTAS · TURMAS · EXCURSÕES</div>
    <div style={{display:'flex',fontSize:69,fontWeight:800,lineHeight:1.11,letterSpacing:-2.5}}>O transporte do dia a dia, em um só lugar.</div>
    <div style={{display:'flex',fontSize:26,lineHeight:1.4,color:'#c5dbef'}}>Mais organização para motoristas e passageiros.</div>
   </div>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:1}}>
    <div style={{display:'flex',fontSize:18,color:'#b5d7f4'}}>bevans-webapp.vercel.app</div>
    <div style={{display:'flex',alignItems:'center',gap:10,color:'#b5d7f4',fontSize:17}}>
     <div style={{display:'flex',width:11,height:11,borderRadius:'50%',backgroundColor:'#50b7ff'}}/>
     PLATAFORMA BEVANS
    </div>
   </div>
   <div style={{display:'flex',position:'absolute',right:-135,top:55,width:500,height:500,border:'65px solid #ffffff12',borderRadius:500}}/>
   <div style={{display:'flex',position:'absolute',right:-80,top:330,width:300,height:300,border:'44px solid #ffffff10',borderRadius:300}}/>
  </div>,
  {...size}
 );
}
