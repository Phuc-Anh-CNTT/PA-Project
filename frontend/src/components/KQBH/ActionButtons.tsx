import {ExternalLink, Phone, ArrowUpRight, Zap} from 'lucide-react';
import {motion} from 'motion/react';

// @ts-ignore
import Zalo from '../../assets/images/zalo.webp';

const ActionButtons = () => {
    const defaultLink = "https://oa.zalo.me/390943228900406806";
    const defaultPhone = "1900 2173";

    const containerVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: {opacity: 0, x: -20},
        visible: {opacity: 1, x: 0}
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row items-center gap-6 p-10 bg-transparent"
        >
            {/* Object 1: Link Button */}
            <motion.a
                href={defaultLink}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={{scale: 1.05, y: -5}}
                whileTap={{scale: 0.98}}
                className="group relative flex items-center gap-5 p-5 pr-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border hover:border-indigo-500/50 transition-all duration-500 min-w-[280px]"
            >
                {/* Animated Background Glow */}
                <div
                    className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-indigo-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>

                {/* Logo Container (Left) */}
                <div
                    className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-900/40 group-hover:shadow-indigo-500/50 transition-all duration-500">
                    <img
                        src={Zalo}
                        alt="abc"
                        className="overflow-hidden rounded-xl"
                    />
                    <div className="absolute -top-1 -right-1">
                        <div className="flex h-3 w-3">
                            <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                        </div>
                    </div>
                </div>

                {/* Content (Right) */}
                <div className="flex flex-col items-start z-10">
                    <span
                        className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mb-1 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        Chat ZALO
                    </span>
                    <h3 className="text-3xl font-extrabold text-indigo-500 tracking-tight group-hover:text-indigo-200 transition-colors">
                        Trung tâm bảo hành
                    </h3>
                </div>

                {/* Decorative corner icon */}
                <ArrowUpRight
                    className="absolute top-4 right-4 w-4 h-4 text-blue-600 group-hover:text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"/>
            </motion.a>

            {/* Object 2: Phone Button */}
            <motion.a
                href={`tel:${defaultPhone}`}
                variants={itemVariants}
                whileHover={{scale: 1.05, y: -5}}
                whileTap={{scale: 0.98}}
                className="group relative flex items-center gap-5 p-5 pr-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-white/10  hover:border-emerald-500/50 transition-all duration-500 min-w-[280px]"
            >
                {/* Animated Background Glow */}
                <div
                    className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-emerald-500/0 via-teal-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>

                {/* Logo Container (Left) */}
                <div
                    className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/40 group-hover:shadow-emerald-500/50 transition-all duration-500">
                    <Phone className="w-8 h-8 text-white fill-white/10 group-hover:fill-white/30 transition-all"/>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{duration: 2, repeat: Infinity}}
                        className="absolute inset-0 rounded-full border-2 border-white/20"
                    />
                </div>

                {/* Content (Right) */}
                <div className="flex flex-col items-start z-10">
                  <span
                      className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-1 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    Hotline
                  </span>
                    <h3 className="text-3xl font-extrabold text-emerald-500 tracking-tight group-hover:text-emerald-200 transition-colors">
                        1900 2173
                    </h3>
                </div>

                {/* Decorative corner icon */}
                <Zap
                    className="absolute top-4 right-4 w-4 h-4 text-white/20 group-hover:text-emerald-400 group-hover:animate-pulse transition-all"/>
            </motion.a>
        </motion.div>
    );
};

export default ActionButtons;
