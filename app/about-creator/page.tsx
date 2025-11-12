"use client";

import React from 'react';
import { Github, Twitter, Linkedin, Mail, MapPin, Briefcase, Calendar, Star, Code, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tilt, TiltContent } from '@/components/animate-ui/primitives/effects/tilt';

export default function AboutCreator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-full mb-4">
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Meet the Creator
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Aadi Kalra
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Student Developer & Creator of TaskTornado
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Profile Card */}
          <div className="w-full max-w-md">
            <Tilt className="w-full" maxTilt={8} perspective={1000}>
              <TiltContent asChild>
                <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl">                  
                  <CardHeader className="relative pb-0 pt-8">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-6">
                        <div className="w-40 h-60">
                          <img 
                            src="/aadi-avatar.png" 
                            alt="Aadi Kalra" 
                            className="w-full h-full rounded-2xl object-cover shadow-lg"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23ffffff"><rect width="100%" height="100%" fill="%23646cff"/><text x="50%" y="50%" font-size="40" text-anchor="middle" dy=".3em" fill="white" font-family="sans-serif">AK</text></svg>';
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-3 border-white dark:border-slate-900 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          Aadi Kalra
                        </h2>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Student Developer • Competitive Programmer
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-500 pt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Rocklin, CA
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Exploring Opportunities
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-8 py-6 space-y-6">
                    {/* Stats Section */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">10+</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Projects</div>
                      </div>
                      <div className="text-center border-x border-slate-200 dark:border-slate-700">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">2K+</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">2+</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Years Coding</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['C++', 'React', 'Node.js', 'JavaScript', 'UI/UX'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-3">
                      <a
                        href="https://github.com/aadikalra"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
                      >
                        <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      </a>
                      <a
                        href="mailto:contact@aadikalra.com"
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
                      >
                        <Mail className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TiltContent>
            </Tilt>
          </div>

          {/* Info Section */}
          <div className="flex-1 max-w-2xl space-y-6">
            {/* Bio */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                    <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      About Me
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      I’m Aadi — a middle school student and self-taught programmer passionate about
                      creating tools that make life simpler and more organized. I love building web
                      apps, learning algorithms, and competing in programming contests like USACO.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TaskTornado */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-800/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      About TaskTornado
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      TaskTornado is a student productivity web app built to simplify how you manage
                      classes, assignments, and goals. Designed with a clean UI and fast workflow,
                      it helps students stay focused and productive every day.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">Loved by early users</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Started 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} TaskTornado. Built by Aadi in Rocklin, CA.
          </p>
        </div>
      </div>
    </div>
  );
}
