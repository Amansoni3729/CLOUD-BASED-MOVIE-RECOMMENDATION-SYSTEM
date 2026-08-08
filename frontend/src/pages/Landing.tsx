import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero Background Collage (Simulated with gradients and subtle images if available) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000" 
          alt="Cinematic background"
          className="w-full h-full object-cover opacity-40 grayscale"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 h-screen flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-brand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">New Generation</span>
            <span className="text-white/40 text-xs font-semibold tracking-widest uppercase">Cloud Powered AI</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-6 leading-tight italic">
            CLOUD MOVIE <br />
            <span className="text-brand not-italic">RECOMMENDATION</span> <br />
            SYSTEM
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed font-medium">
            Experience the future of movie discovery. Personalized recommendations, 
            smart search, and history tracking—all in one beautiful cinematic interface.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link 
              to="/register" 
              className="group bg-brand hover:bg-brand-hover px-10 py-5 rounded-2xl text-lg font-black transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 shadow-2xl shadow-brand/20"
            >
              Get Started Free
              <Play className="w-6 h-6 fill-current group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-10 py-5 rounded-2xl text-lg font-black transition-all backdrop-blur-md"
            >
              Member Login
            </Link>
          </div>
        </motion.div>

        {/* Floating Features */}
        <div className="absolute bottom-10 left-4 right-4 md:left-auto md:right-10 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
           {[
             { icon: TrendingUp, label: "Smart Suggestions" },
             { icon: Zap, label: "Instant Results" },
             { icon: ShieldCheck, label: "Personalized Profile" },
             { icon: Play, label: "OTT Availability" }
           ].map((item, i) => (
             <motion.div
               key={item.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 + i * 0.1 }}
               className="glass-card p-4 flex items-center gap-3"
             >
               <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center text-brand">
                 <item.icon className="w-6 h-6" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-white/80">{item.label}</span>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
