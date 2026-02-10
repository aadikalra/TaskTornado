'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingFooter() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8 px-6 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#275085] dark:bg-[#1f3f6b] mb-4"
                    >
                        <img src="/TaskTornadoDark.svg" alt="Task Tornado Logo" className="w-8 h-8" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Task Tornado</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                        Empowering students to achieve their full potential through intelligent organization and AI-powered assistance.
                    </p>

                    <div className="flex justify-center gap-6 mb-8">
                        <Link href="/ai-guidelines" className="text-gray-600 dark:text-gray-400 hover:text-[#275085] dark:hover:text-[#4a7ba7] transition-colors">
                            AI Guidelines
                        </Link>
                        <Link href="/changelog" className="text-gray-600 dark:text-gray-400 hover:text-[#275085] dark:hover:text-[#4a7ba7] transition-colors">
                            Changelog
                        </Link>
                        <Link href="/signin" className="text-gray-600 dark:text-gray-400 hover:text-[#275085] dark:hover:text-[#4a7ba7] transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-center">
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                        © {new Date().getFullYear()} Task Tornado. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
