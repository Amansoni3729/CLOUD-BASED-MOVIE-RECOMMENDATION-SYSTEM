import React from 'react';
import { motion } from 'motion/react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full"
      />
    </div>
  );
};

export default Loader;
