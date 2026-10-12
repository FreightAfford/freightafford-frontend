import { motion } from "motion/react";
import Logo from "./Logo";

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.6 },
            y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Logo className="max-small-mobile:h-14 h-20" />
        </motion.div>
      </div>
    </div>
  );
};

export default Loader;
