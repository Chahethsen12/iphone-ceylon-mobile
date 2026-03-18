import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ThreeDPhoneScene from '../ThreeDPhoneScene';

gsap.registerPlugin(ScrollTrigger);

export default function HeroScroll() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [threeProps, setThreeProps] = useState({ rotationX: 0, rotationY: 0, scale: 0.8 });
  const [caption, setCaption] = useState("Forged in Titanium.");

  useGSAP(() => {
    // Stage 1: Intro Parallax
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%', // Triple height for 3 stages
        scrub: 1.5,
        pin: true,
      }
    });

    // Sub-timeline to update React state during GSAP scrub
    // We use a proxy object to animate values and sync to state
    const stateProxy = { 
      rotX: 0, 
      rotY: 0.5, 
      scale: 0.8,
      progress: 0 
    };

    tl.to(textRef.current, {
      y: -200,
      opacity: 0,
      scale: 0.8,
      duration: 1
    })
    // Stage 1: Phone Rises
    .to(stateProxy, {
      scale: 1,
      rotY: 0,
      duration: 1,
      onUpdate: () => {
        setThreeProps({ rotationX: stateProxy.rotX, rotationY: stateProxy.rotY, scale: stateProxy.scale });
        if (stateProxy.progress < 0.3) setCaption("Forged in Titanium.");
      }
    }, "<")
    
    // Stage 2: Profile Rotation
    .to(stateProxy, {
      rotY: Math.PI / 2, // 90 degrees
      rotX: 0.2,
      duration: 1,
      onUpdate: () => {
        setThreeProps({ rotationX: stateProxy.rotX, rotationY: stateProxy.rotY, scale: stateProxy.scale });
        setCaption("Strong. Light. Pro.");
      }
    })

    // Stage 3: Feature Highlight
    .to(stateProxy, {
      rotY: Math.PI * 2, // Spin
      scale: 1.5,
      duration: 1,
      onUpdate: () => {
        setThreeProps({ rotationX: stateProxy.rotX, rotationY: stateProxy.rotY, scale: stateProxy.scale });
        setCaption("A new era of performance.");
      }
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Text */}
      <div ref={textRef} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none pt-20">
        <h1 className="text-[12vw] font-bold text-white tracking-tighter opacity-80">
          Titanium.
        </h1>
      </div>

      {/* 3D Model */}
      <div className="w-full h-full relative z-20">
        <ThreeDPhoneScene 
          rotationX={threeProps.rotationX} 
          rotationY={threeProps.rotationY} 
          scale={threeProps.scale} 
        />
      </div>

      {/* Dynamic Caption */}
      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center z-30 pointer-events-none px-4">
        <p className="text-xl md:text-2xl font-medium text-white tracking-tight animate-pulse">
          {caption}
        </p>
        <div className="mt-4 w-px h-12 bg-gradient-to-b from-white to-transparent opacity-50"></div>
      </div>
    </div>
  );
}
