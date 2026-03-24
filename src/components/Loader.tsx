import { Ship } from "lucide-react";
import { motion } from "motion/react";

const Loader = () => {
  return (
    <div className="max-small-mobile:px-4 fixed inset-0 top-0 left-0 z-50 flex min-h-screen flex-col justify-center overflow-hidden bg-slate-900 px-8 py-12">
      {/* Animated background circles */}
      <motion.div
        className="bg-brand/20 absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="bg-brand/20 absolute bottom-0 left-0 -mt-20 -mr-20 h-96 w-96 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Centered content */}
      <div className="flex flex-col items-center">
        <motion.div
          animate={{
            y: [0, -10, 0],       // float up and down
            rotate: [0, 15, -15, 0], // slight rotation
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Ship className="text-brand h-20 w-20" />
        </motion.div>

        <motion.span
          className="text-brand text-2xl font-bold tracking-tight mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Freight Afford
        </motion.span>
      </div>
    </div>
  );
};

export default Loader;