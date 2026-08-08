import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Calendar, Hash, Shield, Settings, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/api';
import { User } from '../types';
import Loader from '../components/Loader';

const Profile: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await movieService.getProfile();
        setProfile(res.data);
      } catch (error) {
        console.error(error);
        setProfile(authUser); // Fallback to auth user if endpoint fails
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [authUser]);

  if (isLoading) return <Loader />;

  const stats = [
    { label: 'Total Searches', value: profile?.totalSearches || 0, icon: Search },
    { label: 'Movies Liked', value: 12, icon: Shield }, // Dummy values for UI completeness as per requirement for "premium" look
    { label: 'Days Active', value: 45, icon: Calendar },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      {/* Profile Header */}
      <section className="relative glass-card p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 bg-brand rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/40">
             <UserIcon className="w-16 h-16 text-white" />
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-display font-black tracking-tight">{profile?.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile?.email}</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {profile?.joinedDate || 'recently'}</span>
              </div>
            </div>
          </div>
          
          <div className="md:ml-auto">
             <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-brand hover:text-white transition-all">
                <Settings className="w-4 h-4" />
                Edit Profile
             </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 text-center space-y-3"
          >
            <div className="w-12 h-12 bg-white/5 mx-auto rounded-xl flex items-center justify-center text-brand">
               <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-4xl font-display font-black tracking-tight">{stat.value}</h4>
          </motion.div>
        ))}
      </section>

      {/* Account Settings Section */}
      <section className="glass-card divide-y divide-white/10">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Account Security</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
               <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-brand" />
                  <div>
                    <p className="font-bold text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-white/40">Secure your account with 2FA</p>
                  </div>
               </div>
               <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
               </div>
             </div>
          </div>
        </div>

        <div className="p-6">
           <button 
             onClick={logout}
             className="w-full flex items-center justify-center gap-2 p-4 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-2xl font-bold transition-all border border-brand/20"
           >
              <LogOut className="w-5 h-5" />
              Sign Out from Device
           </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;
