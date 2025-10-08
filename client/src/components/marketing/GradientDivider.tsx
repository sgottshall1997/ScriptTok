import { motion } from 'framer-motion';

export default function GradientDivider() {
  return (
    <div className="relative w-full h-8 flex items-center justify-center overflow-hidden">
      <motion.div
        className="w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent relative"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            filter: 'blur(2px)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
          }}
        />
      </motion.div>
      
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
    </div>
  );
}
