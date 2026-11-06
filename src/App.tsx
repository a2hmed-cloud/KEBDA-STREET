import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import './style.css';

type Controls={gas:boolean;brake:boolean;left:boolean;right:boolean};
type HUD={speed:number;distance:number;money:number};
const initial:Controls={gas:false,brake:false,left:false,right:false};

function Truck({controls,onHUD}:{controls:Controls;onHUD:(v:HUD)=>void}){
 const root=useRef<THREE.Group>(null);const speed=useRef(0);const dist=useRef(0);const money=useRef(2500);const elapsed=useRef(0);const posX=useRef(0);
 useFrame((state,dt)=>{
  const d=Math.min(dt,.04);speed.current=THREE.MathUtils.clamp(speed.current+(controls.gas?15:-3)*d-(controls.brake?28*d:0),0,110);
  const steer=(controls.left?1:0)-(controls.right?1:0);posX.current=THREE.MathUtils.clamp(posX.current+steer*speed.current*.006*d*12,-5.3,5.3);
  if(root.current){root.current.position.x=THREE.MathUtils.damp(root.current.position.x,posX.current,5,d);root.current.rotation.y=THREE.MathUtils.damp(root.current.rotation.y,-steer*.22,4,d)}
  const travel=speed.current/3.6*d;dist.current+=travel/1000;
  elapsed.current+=d;if(elapsed.current>.15){elapsed.current=0;onHUD({speed:Math.round(speed.current),distance:dist.current,money:money.current})}
  state.camera.position.lerp(new THREE.Vector3(posX.current*.45,5.3,11),1-Math.exp(-3*d));state.camera.lookAt(posX.current*.35,1,-5);
  if(dist.current>1.5&&money.current===2500)money.current+=1200;
 });
 const tire=useRef<THREE.Group>(null);
 return <group ref={root} position={[0,0,5]}>
  <mesh position={[0,1.05,.35]} castShadow><boxGeometry args={[2.25,.95,4.2]}/><meshStandardMaterial color="#26343a"/></mesh>
  <mesh position={[0,1.65,-1.05]} castShadow><boxGeometry args={[2.18,1.15,2.1]}/><meshStandardMaterial color="#b73b2e" metalness={.22} roughness={.4}/></mesh>
  <mesh position={[0,1.83,-2.12]}><boxGeometry args={[1.98,.67,.06]}/><meshStandardMaterial color="#8cbac8" metalness={.2} roughness={.18}/></mesh>
  <mesh position={[0,1.08,-2.18]}><boxGeometry args={[2.1,.16,.12]}/><meshStandardMaterial color="#d9d6ca"/></mesh>
  <mesh position={[-.88,1.2,-2.22}><boxGeometry args={[.16,.32,.08]}/><meshStandardMaterial color="#fff0bd" emissive="#a87930"/></mesh>
  <mesh position={[.88,1.2,-2.22}><boxGeometry args={[.16,.32,.08]}/><meshStandardMaterial color="#fff0bd" emissive="#a87930"/></mesh>
  <mesh position={[0,2.28,-.95]}><boxGeometry args={[2.12,.08,1.5]}/><meshStandardMaterial color="#24292c"/></mesh>
  <group ref={tire}>{[-1.12,1.12].flatMap(x=>[-.8,1.65].map(z=><group key={x+':'+z} position={[x,.5,z]}><mesh rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.47,.47,.28,18]}/><meshStandardMaterial color="#151819"/></mesh><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.2,.2,.3,16]}/><meshStandardMaterial color="#aeb5b5" metalness={.7}/></mesh></group>))}</group>
  <mesh position={[0,.17,2.35]}><boxGeometry args={[2.3,.25,.2]}/><meshStandardMaterial color="#d0c6ae"/></mesh>
 </group>
}
function World(){
 const buildings=Array.from({length:18},(_,i)=>({x:(i%2?1:-1)*(13+(i%3)*5),z:70-Math.floor(i/2)*38,h:5+(i%4)*2,c:['#cbb99b','#b99d7b','#d5c7ad'][i%3]}));
 return <>
  <color attach="background" args={['#9bbfd0']}/><fog attach="fog" args={['#9bbfd0',90,310]}/>
  <hemisphereLight args={['#e8f6ff','#9b7954',2]}/><directionalLight position={[-30,60,25]} intensity={2.2} castShadow shadow-mapSize={[1024,1024]}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.12,-100]} receiveShadow><planeGeometry args={[700,700]}/><meshStandardMaterial color="#c5a171"/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,-180]} receiveShadow><planeGeometry args={[15,600]}/><meshStandardMaterial color="#343a3d"/></mesh>
  {[-7.1,7.1].map(x=><mesh key={x} position={[x,.06,-180]}><boxGeometry args={[.16,.12,600]}/><meshStandardMaterial color="#e2d8c4"/></mesh>)}
  {Array.from({length:50},(_,i)=><mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0,.025,105-i*12]}><planeGeometry args={[.16,5]}/><meshStandardMaterial color="#e8e1cd"/></mesh>)}
  {buildings.map((b,i)=><group key={i} position={[b.x,0,b.z]}><mesh position={[0,b.h/2,0]} castShadow><boxGeometry args={[5,b.h,5]}/><meshStandardMaterial color={b.c}/></mesh>{[-1,0,1].map(j=><mesh key={j} position={[j*1.25,1.5,2.53]}><boxGeometry args={[.48,.55,.05]}/><meshStandardMaterial color="#557985"/></mesh>)}</group>)}
  {Array.from({length:24},(_,i)=>{const x=(i%2?1:-1)*(10+(i%4)*3);return <group key={i} position={[x,.0,80-i*24]}><mesh position={[0,1.5,0]}><cylinderGeometry args={[.08,.12,3,7]}/><meshStandardMaterial color="#70502d"/></mesh><mesh position={[0,3.1,0]}><coneGeometry args={[1.2,2.2,7]}/><meshStandardMaterial color="#6d7542"/></mesh></group>})}
 </>
}
function Traffic(){const cars=useRef<THREE.Group>(null);useFrame((_,dt)=>{if(cars.current)cars.current.children.forEach((c,i)=>{c.position.z+=dt*5;if(c.position.z>16)c.position.z=-300-i*35})});return <group ref={cars}>{Array.from({length:6},(_,i)=><group key={i} position={[i%2?3.6:-3.6,.05,-25-i*48]}><mesh position={[0,.65,0]} castShadow><boxGeometry args={[1.65,.65,3]}/><meshStandardMaterial color={['#e1e0d8','#315e83','#9b3b30'][i%3]}/></mesh><mesh position={[0,1.08,-.2]}><boxGeometry args={[1.3,.48,1.35]}/><meshStandardMaterial color="#85aebd"/></mesh></group>)}</group>}
function CameraRig(){const{camera}=useThree();useEffect(()=>{camera.position.set(0,5,12)},[camera]);return null}
export default function App(){
 const [controls,setControls]=useState<Controls>(initial);const [hud,setHud]=useState<HUD>({speed:0,distance:0,money:2500});const [started,setStarted]=useState(false);const [cameraMode,setCameraMode]=useState(false);const [message,setMessage]=useState('مهمتك الأولى: انقل الشحنة على طريق الواحات');const [delivered,setDelivered]=useState(false);
 const change=(key:keyof Controls,value:boolean)=>setControls(p=>({...p,[key]:value}));
 useEffect(()=>{const map:Record<string,keyof Controls>={ArrowUp:'gas',w:'gas',ArrowDown:'brake',s:'brake',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};const down=(e:KeyboardEvent)=>{const k=map[e.key];if(k){e.preventDefault();change(k,true)}};const up=(e:KeyboardEvent)=>{const k=map[e.key];if(k)change(k,false)};window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[]);
 useEffect(()=>{if(hud.distance>=1.5&&!delivered){setDelivered(true);setMessage('تم تسليم الشحنة بنجاح! حصلت على مكافأة ١٢٠٠ جنيه.')}},[hud.distance,delivered]);
 const reset=()=>{setHud({speed:0,distance:0,money:2500});setDelivered(false);setMessage('تمت إعادة الشاحنة. انطلق بحذر!');window.location.reload()};
 const hold=(key:keyof Controls)=>(<button className="btn" onPointerDown={e=>{e.preventDefault();(e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);change(key,true)}} onPointerUp={()=>change(key,false)} onPointerCancel={()=>change(key,false)} onLostPointerCapture={()=>change(key,false)}>{key==='gas'?'▲':key==='brake'?'■':key==='left'?'◀':'▶'}<span>{key==='gas'?'بنزين':key==='brake'?'فرامل':key==='left'?'يسار':'يمين'}</span></button>);
 return <main>
  <div id="game"><Canvas shadows dpr={[1,1.5]} camera={{position:[0,5,12],fov:62}}><CameraRig/><World/><Traffic/><Truck controls={controls} onHUD={setHud}/></Canvas></div>
  <div className="hud">
   <header className="top"><div className="panel brand"><b>🇪🇬 EGYPT TRUCK</b><small>محاكي الشاحنات المصري</small></div><div className="panel stats"><div className="stat"><small>السرعة</small><b>{hud.speed} كم/س</b></div><div className="stat"><small>المسافة</small><b>{hud.distance.toFixed(1)} كم</b></div><div className="stat"><small>الرصيد</small><b>{hud.money.toLocaleString('en-US')} ج.م</b></div></div></header>
   <div className="panel mission"><b>{delivered?'تم تسليم الشحنة بنجاح':'القاهرة · طريق الواحات'}</b><small>{delivered?'مكافأة التوصيل أضيفت لرصيدك':'انطلق لمسافة ١٫٥ كم لإتمام أول مهمة'}</small></div>
   <footer className="bottom"><div className="controls"><div className="pad">{hold('left')}{hold('gas')}{hold('right')}{hold('brake')}</div></div><div className="tools"><button className="btn" onClick={()=>{setCameraMode(!cameraMode);setMessage(cameraMode?'كاميرا خارجية':'كاميرا الكابينة (قريباً)')}}>◉<span>الكاميرا</span></button><button className="btn" onClick={reset}>↻<span>إعادة</span></button></div></footer>
  </div>
  {!started&&<div className="start"><div className="card"><h1>Egypt Truck Simulator</h1><p>استلم شحنتك وانطلق على طريق مصري سريع. قد الشاحنة، راقب سرعتك، وتجنب الخروج عن الطريق. تحكم بالأسهم أو أزرار اللمس.</p><button className="startbtn" onClick={()=>setStarted(true)}>ابدأ القيادة</button></div></div>}
  {started&&<div className="toast" style={{opacity:delivered?1:0}}>{message}</div>}
 </main>
}
