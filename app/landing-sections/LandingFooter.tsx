'use client';

import Link from 'next/link';
import { PLANNER_LINKS } from '@/lib/planner-links';
import { ArrowUpRight } from 'lucide-react';
import { IconBrandFacebook, IconBrandGithub, IconBrandInstagram, IconBrandX } from '@tabler/icons-react';

const footerLinks = [
    {
        title: 'Planner',
        links: Object.values(PLANNER_LINKS).map(({ href, label }) => ({ href, name: label })),
    },
    {
        title: 'Solutions',
        links: [
            { name: 'For Students', href: '/' },
            { name: 'For Teachers', href: '/teachers' },
            { name: 'For Guardians', href: '/guardians' },
            { name: 'All Features', href: '/features' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { name: 'AI Guidelines', href: '/ai-guidelines' },
            { name: 'Changelog', href: '/changelog' },
            { name: 'Tutorials', href: '/tutorials' },
            { name: 'Blog', href: '/blog' },
            { name: 'Grade Calculator', href: '/grades' },
            { name: 'Word Counter', href: '/wordcount' },
            { name: 'School Calendar', href: '/publiccalendar' },
        ],
    },
    {
        title: 'Get Started',
        links: [
            { name: 'Sign Up', href: '/signup' },
            { name: 'Log In', href: '/login' },
            { name: 'About TaskTornado', href: '/about' },
            { name: 'Privacy Policy', href: '/legal/privacy' },
            { name: 'Terms of Service', href: '/legal/terms' },
        ],
    },
];

const socialLinks = [
    { icon: IconBrandInstagram, href: 'https://www.instagram.com/tasktornado.app', label: 'Instagram' },
    { icon: IconBrandX, href: 'https://x.com/tasktornadoapp', label: 'X' },
    { icon: IconBrandFacebook, href: 'https://www.facebook.com/profile.php?id=61591924528198', label: 'Facebook' },
    { icon: IconBrandGithub, href: 'https://github.com/aadikalra/TaskTornado', label: 'GitHub' },
];

export default function LandingFooter() {
    return (
        <footer className="relative bg-[#fffaf4] dark:bg-gray-950 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#275085]/15 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

                    {/* Brand Column */}
                    <div className="lg:col-span-5 flex flex-col items-start px-0 lg:pr-12">
                        <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                            <img src="/logo-light.webp" alt="" width={40} height={40} loading="lazy" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 dark:hidden" />
                            <img src="/logo-dark.webp" alt="" width={40} height={40} loading="lazy" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 hidden dark:block" />
                            <span className="text-xl font-bold tracking-tight text-[#275085] dark:text-[#7ec0f2]">
                                Task Tornado
                            </span>
                        </Link>

                        <p className="text-[#275085]/85 dark:text-[#9bd0f7] text-base leading-relaxed max-w-sm mb-8 font-medium">
                            The intelligent school organizer that helps you stay ahead. Built for students who want to master their time and excel in their studies.
                        </p>

                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    className="p-2.5 rounded-full bg-white dark:bg-zinc-800 border border-[#275085]/12 dark:border-[#4a9cdb]/20 text-[#275085]/80 dark:text-[#8cc8f5] hover:text-[#275085] dark:hover:text-[#b5d565] hover:border-[#b5d565]/40 dark:hover:border-[#b5d565]/40 hover:shadow-md transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    <social.icon aria-hidden="true" size={18} stroke={1.8} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {footerLinks.map((column) => (
                            <div key={column.title}>
                                <h2 className="text-[10px] font-bold text-[#275085] dark:text-[#7ec0f2] uppercase tracking-[0.15em] mb-6">
                                    {column.title}
                                </h2>
                                <ul className="space-y-4">
                                    {column.links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="group text-[15px] text-[#275085]/85 dark:text-[#9bd0f7] hover:text-[#275085] dark:hover:text-white transition-colors font-medium flex items-center gap-1"
                                            >
                                                {link.name}
                                                {link.href.startsWith('http') || link.href.startsWith('mailto') ? (
                                                    <ArrowUpRight aria-hidden="true" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                ) : null}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-8 border-t border-[#275085]/8 dark:border-[#4a9cdb]/8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-[#275085]/80 dark:text-[#8cc8f5] font-medium">
                        © {new Date().getFullYear()} TaskTornado. All rights reserved.
                    </p>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#8bc34a]/10 border border-[#8bc34a]/25">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#4d7c0f] dark:bg-[#a6d96a] animate-pulse" />
                            <span className="text-[12px] font-bold text-[#3f6b11] dark:text-[#a6d96a]">All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#8bc34a]/[0.04] dark:bg-[#8bc34a]/[0.02] rounded-full blur-3xl pointer-events-none" />
        </footer>
    );
}
