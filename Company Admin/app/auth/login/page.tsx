"use client";

import LoginForm from "@/components/auth/login-form";
import { Car, MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

const ParkingSpot = ({ delay, isTop }: { delay: number; isTop: boolean }) => {
  const [occupied, setOccupied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) setOccupied(prev => !prev);
    }, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "relative w-[60px] h-[100px] border-x-[1.5px] border-blue-100 flex items-center justify-center",
      isTop ? "border-t-[1.5px] rounded-t-lg" : "border-b-[1.5px] rounded-b-lg"
    )}>
      <div className={cn(
        "absolute w-1.5 h-1.5 rounded-full top-2 transition-colors duration-1000",
        occupied ? "bg-red-400" : "bg-emerald-400"
      )} />

      <AnimatePresence>
        {occupied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: isTop ? 180 : 0 }}
            animate={{ opacity: 1, scale: 1, rotate: isTop ? 180 : 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-blue-200/60"
          >
            <Car size={32} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ParkingRoad = ({ y }: { y: number }) => {
  return (
    <div className="absolute w-[200%] -left-[50%] flex flex-col items-center" style={{ top: `${y}%` }}>
      {/* Top Bays */}
      <div className="flex gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <ParkingSpot key={`top-${i}`} delay={i * 0.1} isTop={true} />
        ))}
      </div>

      {/* The Road */}
      <div className="w-full h-[80px] border-y-[2px] border-blue-50 bg-slate-50/30 flex items-center relative">
        <div className="w-full border-t-[2px] border-dashed border-blue-100/50" />

        {/* Moving Cars on Road */}
        <motion.div
          animate={{ x: ["-10vw", "110vw"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute text-blue-300/40"
        >
          <Car size={24} className="rotate-90" />
        </motion.div>
      </div>

      {/* Bottom Bays */}
      <div className="flex gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <ParkingSpot key={`bot-${i}`} delay={i * 0.1} isTop={false} />
        ))}
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <section className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* --- BLUE LINE PARKING FACILITY BG --- */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <ParkingRoad y={5} />
        <ParkingRoad y={35} />
        <ParkingRoad y={65} />
        <ParkingRoad y={95} />
      </div>

      {/* Subtle Blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-transparent to-white z-10 opacity-80" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white via-transparent to-white z-10 opacity-80" />
      </div>

      <div className="relative z-20 w-full max-w-[440px]">
        {/* Animated Car orbiting the header */}
        <div className="flex justify-center mb-10 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ width: '180px', height: '180px', left: '50%', top: '50%', x: '-50%', y: '-50%' }}
          >
            <motion.div style={{ position: 'absolute', top: 0, left: '50%', x: '-50%' }}>
              <Car className="text-[#1443a6]" size={28} />
            </motion.div>
          </motion.div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-blue-50 relative z-30">
            <MapPin className="text-[#1443a6]" size={44} />
          </div>
        </div>

        <div className="text-center mb-10">
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 border border-blue-100 rounded-full mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-black text-blue-600/70 uppercase tracking-[0.3em]">Facility Node 01</span>
          </motion.div> */}
          <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">
            Company Admin
          </h1>
          <p className="text-slate-500 font-semibold text-xl opacity-80">
            Powering Modern Parking Business
          </p>
          <p className="text-slate-500 font-semibold text-xl opacity-80">
            Built for Airport Parking Operators
          </p>
        </div>

        {/* Login Form Container */}
        <div className="relative group">
          {/* Decorative Corner Accents */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-blue-200 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-blue-200 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 30 }}
            className="relative z-10 bg-white p-3 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(20,67,166,0.12)] border border-blue-50/50"
          >
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12">
              <LoginForm />
            </div>
          </motion.div>

          {/* Bottom Branding */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 whitespace-nowrap">
            <div className="h-[1px] w-12 bg-blue-100" />
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.4em]">Authorized Personnel Only</span>
            <div className="h-[1px] w-12 bg-blue-100" />
          </div>
        </div>

       <div className="mt-24 text-center">
  <p className="text-black text-[10px] font-bold uppercase tracking-[0.5em] opacity-50">
    &copy; {new Date().getFullYear()}{" "}
    <a
      href="https://techbaba.co.uk"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      TECHBABA LTD.
    </a>
  </p>
</div>
      </div>
    </section>
  );
};

export default Login;
