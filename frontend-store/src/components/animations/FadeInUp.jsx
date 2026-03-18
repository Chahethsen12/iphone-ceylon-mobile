import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function FadeInUp({ children, delay = 0, duration = 0.8, yOffset = 50 }) {
  const compRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      compRef.current,
      { opacity: 0, y: yOffset },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        delay: delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: compRef.current,
          start: "top 85%", // Triggers when the top of the element hits 85% of viewport height
          toggleActions: "play none none reverse", // Plays on scroll down, reverses on scroll up
        }
      }
    );
  }, { scope: compRef });

  return <div ref={compRef}>{children}</div>;
}
