'use client';

import * as React from 'react';
import Image from 'next/image';
import { useClassContext } from '@/context/ClassContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';

// Hook to detect dark mode
const useDarkMode = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkDarkMode();

    // Listen for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowLetter?: () => void;
}

type OnboardingStep = 'welcome' | 'grade' | 'math-acceleration' | 'language' | 'electives' | 'summary';

interface ClassSuggestion {
  name: string;
  icon: string;
  colorIndex: number;
}

const gradeClassMappings: Record<string, ClassSuggestion[]> = {
  '7': [
    { name: 'Math 7', icon: 'Triangle', colorIndex: 0 },
    { name: 'English 7', icon: 'Book03', colorIndex: 1 },
    { name: 'History 7', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 7', icon: 'Atom01', colorIndex: 3 },
  ],
  '8': [
    { name: 'Math 8', icon: 'Cylinder01', colorIndex: 0 },
    { name: 'English 8', icon: 'Book03', colorIndex: 1 },
    { name: 'History 8', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 8', icon: 'Cells', colorIndex: 3 },
  ],
  '9': [
    { name: 'IM1', icon: 'Cos', colorIndex: 0 },
    { name: 'English 9', icon: 'Book03', colorIndex: 1 },
    { name: 'Geography', icon: 'Globe', colorIndex: 2 },
    { name: 'Biology', icon: 'Microscope', colorIndex: 3 },
  ],
  '10': [
    { name: 'IM2', icon: 'Parabola03', colorIndex: 0 },
    { name: 'English 10', icon: 'Book03', colorIndex: 1 },
    { name: 'AP World History', icon: 'Globe', colorIndex: 2 },
    { name: 'Chemistry', icon: 'Molecules', colorIndex: 3 },
  ],
  '11': [
    { name: 'IM3', icon: 'FunctionOfX', colorIndex: 0 },
    { name: 'AP Lit', icon: 'Book03', colorIndex: 1 },
    { name: 'APUSH', icon: 'Globe', colorIndex: 2 },
    { name: 'Physics', icon: 'Gravity', colorIndex: 3 },
  ],
  '12': [
    { name: 'Math 12', icon: 'Calculator', colorIndex: 0 },
    { name: 'AP English Lang', icon: 'Book03', colorIndex: 1 },
    { name: 'AP Gov', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 12', icon: 'SolarSystem', colorIndex: 3 },
  ],
};

interface ElectiveOption {
  name: string;
  icon: string;
  colorIndex: number;
}

const electiveOptions: ElectiveOption[] = [
  // Physical Education (PE is elective choice, not automatic)
  { name: 'MS Aerobic Walking', icon: 'Walking', colorIndex: 0 },
  { name: 'MS Team Sports', icon: 'BasketballHoop', colorIndex: 1 },

  // Sciences
  { name: 'MS Marine Science', icon: 'Boat', colorIndex: 2 },

  // Music Options
  { name: 'MS Music Appreciation', icon: 'MusicThree', colorIndex: 3 },
  { name: 'MS Beginning Band', icon: 'MusicNote03', colorIndex: 4 },
  { name: 'MS Concert Band', icon: 'MusicNote01', colorIndex: 5 },
  { name: 'MS Guitar', icon: 'Playlist03', colorIndex: 6 },
  { name: 'MS Choir', icon: 'MusicNote04', colorIndex: 7 },

  // Leadership/Service
  { name: 'MS Service Leadership', icon: 'UserGroup03', colorIndex: 8 },

  // Arts/Performance
  { name: 'MS Theater Arts', icon: 'Theater', colorIndex: 9 },
  { name: 'MS Yearbook', icon: 'Canvas', colorIndex: 10 },
  { name: 'MS Creative Writing', icon: 'Pencil', colorIndex: 11 },
  { name: 'MS Digital Media Arts', icon: 'WebDesign01', colorIndex: 12 },

  // Academic Support
  { name: 'Academic Seminar', icon: 'GraduationCap', colorIndex: 13 },
  { name: 'Academic Seminar WITH Math Support', icon: 'Calculator', colorIndex: 14 },

  // Technology
  { name: 'MS Computer Science', icon: 'Code', colorIndex: 15 }

  // Note: Spanish and Mandarin are handled as required languages for 8th graders, not electives
];

const languageOptions = ['Spanish', 'Mandarin'];
const languageLevelLabels = ['1', '2', '3', 'AP'];

const classColors = ['#E53E3E', '#3182CE', '#D69E2E', '#38A169', '#805AD5', '#D53F8C', '#2E7774', '#4A5568'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onShowLetter }) => {
  const { classes, addClass } = useClassContext();
  const { user, full_name } = useAuth();
  const isDarkMode = useDarkMode();
  const firstName = full_name?.split(' ')[0] || 'Student';
  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>('welcome');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('');
  const [mathAccelerationLevel, setMathAccelerationLevel] = React.useState<number>(0); // 0=standard, 1-4=grades ahead
  const [mathTrack, setMathTrack] = React.useState<'im3' | 'precalc' | null>(null); // for 11th grade choice
  const [selectedElectives, setSelectedElectives] = React.useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('');
  const [languageLevel, setLanguageLevel] = React.useState<number>(1); // 1=Level 1, 2=Level 2, 3=Level 3, 4=AP
  const [wantsLanguage, setWantsLanguage] = React.useState<boolean | null>(null); // for 10-12 optional
  const [electiveSearch, setElectiveSearch] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Compute the full language class name
  const fullLanguageName = selectedLanguage
    ? (languageLevel === 4 ? `AP ${selectedLanguage}` : `${selectedLanguage} ${languageLevel}`)
    : '';

  // Whether language is required for this grade
  const isLanguageRequired = ['8', '9'].includes(selectedGrade);
  const isLanguageAvailable = ['8', '9', '10', '11', '12'].includes(selectedGrade);

  // Whether the student is actually taking a language (affects elective count)
  const isTakingLanguage = isLanguageRequired || (isLanguageAvailable && wantsLanguage === true && selectedLanguage !== '');

  // Elective slots: base 2, minus 1 if taking a language
  const maxElectives = isTakingLanguage ? 1 : 2;

  const suggestedClasses = selectedGrade ? gradeClassMappings[selectedGrade] || [] : [];

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('welcome');
      setSelectedGrade('');
      setMathAccelerationLevel(0);
      setMathTrack(null);
      setSelectedElectives([]);
      setSelectedLanguage('');
      setLanguageLevel(1);
      setWantsLanguage(null);
      setElectiveSearch('');
    }
  }, [isOpen]);

  // Full math progression sequence
  const mathProgression = ['Math 7', 'Math 8', 'IM1', 'IM2', 'IM3', 'AP Calc AB', 'AP Calc BC', 'AP Stats'];

  // Base index in progression for each grade
  const getMathBaseIndex = () => {
    if (!selectedGrade) return 0;
    return parseInt(selectedGrade) - 7;
  };

  // Max slider value for current grade
  const mathMaxAcceleration = Math.min(4, mathProgression.length - 1 - getMathBaseIndex());

  // Get the math course name at a given acceleration level
  const getMathCourseAtLevel = (acceleration: number) => {
    const idx = getMathBaseIndex() + acceleration;
    if (idx >= mathProgression.length) return mathProgression[mathProgression.length - 1];
    let name = mathProgression[idx];
    // For the IM3 slot: if user chose Precalc, override
    if (name === 'IM3' && mathTrack === 'precalc') {
      return 'Precalc';
    }
    return name;
  };

  // Whether the current slider position lands on the IM3 slot
  const isAtIM3Slot = (getMathBaseIndex() + mathAccelerationLevel) === 4;

  // Calculate the correct math class based on grade and acceleration
  const getAdjustedMathClass = () => {
    if (!selectedGrade || suggestedClasses.length === 0) return suggestedClasses[0];

    if (mathAccelerationLevel === 0) {
      // If at IM3 slot and chose Precalc, override default
      if (isAtIM3Slot && mathTrack === 'precalc') {
        return { name: 'Precalc', icon: 'Calculator', colorIndex: 0 };
      }
      return suggestedClasses[0];
    }

    return {
      name: getMathCourseAtLevel(mathAccelerationLevel),
      icon: 'Calculator',
      colorIndex: 0
    };
  };

  // Helper function to get icon name for electives
  const getElectiveIcon = (iconName: string) => {
    return iconName;
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    // Set default language level based on grade progression
    const defaultLevels: Record<string, number> = { '8': 1, '9': 2, '10': 3, '11': 4, '12': 4 };
    setLanguageLevel(defaultLevels[grade] || 1);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleElectiveToggle = (electiveName: string) => {
    setSelectedElectives(prev => {
      if (prev.includes(electiveName)) {
        return prev.filter(e => e !== electiveName);
      } else {
        // 8th graders only get 1 elective, others get 2
        const max = maxElectives;
        if (prev.length < max) {
          return [...prev, electiveName];
        }
        return prev;
      }
    });
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('grade');
        break;
      case 'grade':
        if (selectedGrade) {
          if (isLanguageAvailable) {
            setCurrentStep('language');
          } else {
            setCurrentStep('math-acceleration');
          }
        }
        break;
      case 'language':
        // For required: must have language selected. For optional: must have made a choice.
        if (isLanguageRequired && selectedLanguage) {
          setCurrentStep('math-acceleration');
        } else if (!isLanguageRequired && wantsLanguage !== null) {
          if (wantsLanguage && selectedLanguage) {
            setCurrentStep('math-acceleration');
          } else if (!wantsLanguage) {
            setCurrentStep('math-acceleration');
          }
        }
        break;
      case 'math-acceleration':
        setCurrentStep('electives');
        break;
      case 'electives':
        if (selectedElectives.length === maxElectives) setCurrentStep('summary');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'grade':
        setCurrentStep('welcome');
        break;
      case 'language':
        setCurrentStep('grade');
        break;
      case 'math-acceleration':
        if (isLanguageAvailable) {
          setCurrentStep('language');
        } else {
          setCurrentStep('grade');
        }
        break;
      case 'electives':
        setCurrentStep('math-acceleration');
        break;
      case 'summary':
        setCurrentStep('electives');
        break;
    }
  };

  const handleCreateClasses = async () => {
    setIsLoading(true);
    try {
      // Create suggested classes with adjusted math class if needed
      const adjustedMathClass = getAdjustedMathClass();
      const classesToCreate = suggestedClasses.map((cls, idx) =>
        idx === 0 ? adjustedMathClass || cls : cls
      );

      for (const classInfo of classesToCreate) {
        if (classInfo) {
          await addClass(classInfo.name, classInfo.icon as any);
        }
      }

      // Create elective classes
      for (const electiveName of selectedElectives) {
        const elective = electiveOptions.find(e => e.name === electiveName);
        const iconName = elective ? elective.icon : 'BookOpen';
        await addClass(electiveName, iconName as any);
      }

      // Create language class
      if (fullLanguageName) {
        await addClass(fullLanguageName, 'LanguageCircle' as any);
      }

      // Show welcome letter after successful class creation
      if (onShowLetter) {
        onShowLetter();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'grade':
        return selectedGrade !== '';
      case 'language':
        if (isLanguageRequired) {
          return selectedLanguage !== '';
        } else {
          // Optional: either chose "no" or chose "yes" + picked a language
          if (wantsLanguage === false) return true;
          if (wantsLanguage === true) return selectedLanguage !== '';
          return false;
        }
      case 'math-acceleration':
        return true;
      case 'electives':
        return selectedElectives.length === maxElectives;
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  const contentVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  // Step labels for progress pills
  const allSteps = isLanguageAvailable
    ? ['grade', 'language', 'math-acceleration', 'electives', 'summary']
    : ['grade', 'math-acceleration', 'electives', 'summary'];
  const currentStepIndex = allSteps.indexOf(currentStep);
  // For acceleration-level, treat it as part of math-acceleration
  const displayStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={contentVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {(() => {
            switch (currentStep) {
              case 'welcome':
                return (
                  <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12">
                    {/* Logo */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-20 h-20 bg-[#ebf6b5]/60 dark:bg-sky-500/15 rounded-3xl flex items-center justify-center mb-6 border border-[#d4e88e]/40 dark:border-sky-500/20"
                    >
                      <Image
                        src={isDarkMode ? "/3.svg" : "/2.svg"}
                        alt="TaskTornado"
                        width={40}
                        height={40}
                        className="w-10 h-10"
                      />
                    </motion.div>

                    {/* Greeting */}
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-3xl sm:text-4xl font-bold text-sky-500 dark:text-sky-400 leading-tight tracking-tight mb-2"
                    >
                      Hey, {firstName}!
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm sm:text-base text-sky-700/50 dark:text-sky-300/50 max-w-sm mb-8 leading-relaxed"
                    >
                      Let&apos;s get your workspace set up — it only takes a minute.
                    </motion.p>

                    {/* CTA */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 text-[13px] font-bold text-white bg-[#275085] dark:bg-[#4a9cdb] rounded-full hover:bg-[#1f3f6b] dark:hover:bg-[#3d8bc4] shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 transition-all active:scale-95"
                    >
                      Let&apos;s Go
                      <HugeIcon name="ArrowRight01" size={16} className="w-4 h-4" />
                    </motion.button>

                    {/* Skip option */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={onClose}
                      className="mt-4 text-[11px] text-sky-500/40 dark:text-sky-400/30 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                    >
                      Skip for now
                    </motion.button>
                  </div>
                );

              case 'grade':
                return (
                  <div className="space-y-5">
                    {/* Panel header */}
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden">
                      <div className="px-5 pt-4 pb-2">
                        <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                          Grade Level
                        </span>
                      </div>
                      <div className="px-5 pb-5">
                        <p className="text-sm text-sky-700/50 dark:text-sky-300/50 mb-5">
                          Select your current grade level to see suggested course maps.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {['7', '8', '9', '10', '11', '12'].map((grade) => (
                            <button
                              key={grade}
                              onClick={() => handleGradeSelect(grade)}
                              className={`group relative flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200 ${selectedGrade === grade
                                ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 border-[#d4e88e]/50 dark:border-sky-500/30 shadow-sm'
                                : 'border-sky-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-gray-600 bg-white/60 dark:bg-gray-900/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                }`}
                            >
                              <span className={`text-base font-semibold ${selectedGrade === grade
                                ? 'text-sky-700 dark:text-sky-300'
                                : 'text-sky-900 dark:text-white'
                                }`}>Grade {grade}</span>
                              <HugeIcon name="ArrowRight01" size={16} className={`w-4 h-4 transition-all duration-200 ${selectedGrade === grade
                                ? 'text-sky-600 dark:text-sky-400 translate-x-0 opacity-100'
                                : 'text-sky-400/40 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                                }`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedGrade && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden"
                      >
                        <div className="px-5 pt-4 pb-2">
                          <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                            Suggested Path
                          </span>
                        </div>
                        <div className="px-5 pb-4">
                          <div className="grid grid-cols-2 gap-3">
                            {(() => {
                              const adjustedMathClass = getAdjustedMathClass();
                              return suggestedClasses.map((classInfo, idx) => {
                                const displayClass = idx === 0 ? adjustedMathClass || classInfo : classInfo;
                                return (
                                  <div key={displayClass.name} className="flex items-center gap-3 py-1">
                                    <div
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: classColors[displayClass.colorIndex] }}
                                    />
                                    <span className="text-sm font-medium text-sky-800 dark:text-sky-200">
                                      {displayClass.name}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );

              case 'language':
                return (
                  <div className="space-y-5">
                    {/* Optional language choice for 10-12 */}
                    {!isLanguageRequired && (
                      <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden">
                        <div className="px-5 pt-4 pb-2">
                          <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                            World Language
                          </span>
                        </div>
                        <div className="px-5 pb-5">
                          <p className="text-sm text-sky-700/50 dark:text-sky-300/50 mb-5">
                            Are you taking a world language this year?
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => { setWantsLanguage(true); }}
                              className={`group relative flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 ${wantsLanguage === true
                                ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 border-[#d4e88e]/50 dark:border-sky-500/30 shadow-sm'
                                : 'border-sky-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-gray-600 bg-white/60 dark:bg-gray-900/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                }`}
                            >
                              <span className={`text-base font-semibold ${wantsLanguage === true ? 'text-sky-700 dark:text-sky-300' : 'text-sky-900 dark:text-white'}`}>Yes</span>
                            </button>
                            <button
                              onClick={() => { setWantsLanguage(false); setSelectedLanguage(''); setLanguageLevel(1); }}
                              className={`group relative flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 ${wantsLanguage === false
                                ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 border-[#d4e88e]/50 dark:border-sky-500/30 shadow-sm'
                                : 'border-sky-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-gray-600 bg-white/60 dark:bg-gray-900/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                }`}
                            >
                              <span className={`text-base font-semibold ${wantsLanguage === false ? 'text-sky-700 dark:text-sky-300' : 'text-sky-900 dark:text-white'}`}>No</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Language picker — shown for required (8/9) or if optional user said yes */}
                    {(isLanguageRequired || wantsLanguage === true) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden"
                      >
                        <div className="px-5 pt-4 pb-2">
                          <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                            Language Selection
                          </span>
                        </div>
                        <div className="px-5 pb-5">
                          <p className="text-sm text-sky-700/50 dark:text-sky-300/50 mb-5">
                            Choose your language and level.
                          </p>

                          {/* Language Choice */}
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            {languageOptions.map((language) => (
                              <button
                                key={language}
                                onClick={() => handleLanguageSelect(language)}
                                className={`group relative flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 ${selectedLanguage === language
                                  ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 border-[#d4e88e]/50 dark:border-sky-500/30 shadow-sm'
                                  : 'border-sky-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-gray-600 bg-white/60 dark:bg-gray-900/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                  }`}
                              >
                                <span className={`text-base font-semibold ${selectedLanguage === language
                                  ? 'text-sky-700 dark:text-sky-300'
                                  : 'text-sky-900 dark:text-white'
                                  }`}>{language}</span>
                                <HugeIcon name="Message" size={20} className={`w-5 h-5 ${selectedLanguage === language
                                  ? 'text-sky-600 dark:text-sky-400'
                                  : 'text-sky-400/40'
                                  }`} />
                              </button>
                            ))}
                          </div>

                          {/* Level Slider */}
                          {selectedLanguage && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <span className="text-[11px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em] mb-3 block">
                                Level
                              </span>

                              {/* Level labels */}
                              <div className="flex justify-between mb-2 px-[10px]">
                                {languageLevelLabels.map((label, idx) => (
                                  <span
                                    key={label}
                                    className={`text-xs font-bold transition-colors cursor-pointer ${languageLevel === idx + 1
                                      ? 'text-sky-600 dark:text-sky-400'
                                      : 'text-sky-600/30 dark:text-sky-400/30'
                                      }`}
                                    onClick={() => setLanguageLevel(idx + 1)}
                                  >
                                    {label === 'AP' ? 'AP' : `${selectedLanguage} ${label}`}
                                  </span>
                                ))}
                              </div>

                              {/* Range slider */}
                              <div className="relative px-0">
                                <input
                                  type="range"
                                  min={1}
                                  max={4}
                                  step={1}
                                  value={languageLevel}
                                  onChange={(e) => setLanguageLevel(parseInt(e.target.value))}
                                  className="w-full h-2 appearance-none cursor-pointer rounded-full bg-sky-100 dark:bg-sky-900/30 accent-sky-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#275085] dark:[&::-webkit-slider-thumb]:bg-sky-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-sky-500/20 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110"
                                />
                              </div>

                              {/* Current selection display */}
                              <div className="mt-3 flex items-center justify-center">
                                <span className="text-sm font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/40 dark:bg-sky-500/10 px-3 py-1 rounded-full border border-[#d4e88e]/30 dark:border-sky-500/20">
                                  {fullLanguageName}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );

              case 'math-acceleration':
                return (
                  <div className="space-y-5">
                    {/* Slider — always shown */}
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden">
                      <div className="px-5 pt-4 pb-2">
                        <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                          Math Placement
                        </span>
                      </div>
                      <div className="px-5 pb-5">
                        <p className="text-sm text-sky-700/50 dark:text-sky-300/50 mb-5">
                          Drag the slider to set your math level.
                        </p>

                        {/* Level labels — show actual course names */}
                        <div className="flex justify-between mb-2 px-[10px]">
                          {Array.from({ length: mathMaxAcceleration + 1 }, (_, level) => {
                            const courseName = getMathCourseAtLevel(level);
                            return (
                              <span
                                key={level}
                                className={`text-[10px] font-bold transition-colors cursor-pointer text-center ${mathAccelerationLevel === level
                                  ? 'text-sky-600 dark:text-sky-400'
                                  : 'text-sky-600/30 dark:text-sky-400/30'
                                  }`}
                                onClick={() => { setMathAccelerationLevel(level); setMathTrack(null); }}
                              >
                                {courseName}
                              </span>
                            );
                          })}
                        </div>

                        {/* Range slider */}
                        <div className="relative px-0">
                          <input
                            type="range"
                            min={0}
                            max={mathMaxAcceleration}
                            step={1}
                            value={mathAccelerationLevel}
                            onChange={(e) => { setMathAccelerationLevel(parseInt(e.target.value)); setMathTrack(null); }}
                            className="w-full h-2 appearance-none cursor-pointer rounded-full bg-sky-100 dark:bg-sky-900/30 accent-sky-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#275085] dark:[&::-webkit-slider-thumb]:bg-sky-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-sky-500/20 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110"
                          />
                        </div>

                        {/* Current selection display */}
                        <div className="mt-3 flex items-center justify-center">
                          <span className="text-sm font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/40 dark:bg-sky-500/10 px-3 py-1 rounded-full border border-[#d4e88e]/30 dark:border-sky-500/20">
                            {getMathCourseAtLevel(mathAccelerationLevel)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* IM3 / Precalc choice — appears when slider lands on IM3 slot */}
                    {isAtIM3Slot && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden"
                      >
                        <div className="px-5 pt-4 pb-2">
                          <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                            Math Track
                          </span>
                        </div>
                        <div className="px-5 pb-5">
                          <p className="text-sm text-sky-700/50 dark:text-sky-300/50 mb-5">
                            Which course are you taking?
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setMathTrack('im3')}
                              className={`group relative flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 ${mathTrack === 'im3'
                                ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 border-[#d4e88e]/50 dark:border-sky-500/30 shadow-sm'
                                : 'border-sky-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-gray-600 bg-white/60 dark:bg-gray-900/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                }`}
                            >
                              <span className={`text-base font-semibold ${mathTrack === 'im3' ? 'text-sky-700 dark:text-sky-300' : 'text-sky-900 dark:text-white'}`}>IM3</span>
                            </button>
                            <button
                              onClick={() => setMathTrack('precalc')}
                              className={`group relative flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 ${mathTrack === 'precalc'
                                ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 border-[#d4e88e]/50 dark:border-sky-500/30 shadow-sm'
                                : 'border-sky-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-gray-600 bg-white/60 dark:bg-gray-900/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                }`}
                            >
                              <span className={`text-base font-semibold ${mathTrack === 'precalc' ? 'text-sky-700 dark:text-sky-300' : 'text-sky-900 dark:text-white'}`}>Precalc</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );

              case 'electives':
                return (
                  <div className="space-y-5">
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden">
                      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                        <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                          Your Electives
                        </span>
                        <span className="text-[11px] font-bold text-sky-600/50 dark:text-sky-400/50">
                          {selectedElectives.length} of {maxElectives}
                        </span>
                      </div>
                      <div className="px-5 pb-5">
                        <p className="text-sm text-sky-700/50 dark:text-sky-300/50 mb-4">
                          {maxElectives === 1
                            ? 'Select 1 elective you\'re taking this year.'
                            : `Select ${maxElectives} electives you\'re taking this year.`
                          }
                        </p>

                        {/* Search */}
                        <div className="relative mb-4">
                          <Input
                            type="text"
                            placeholder="Search electives..."
                            value={electiveSearch}
                            onChange={(e) => setElectiveSearch(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/60 dark:bg-zinc-700/50 border border-sky-100 dark:border-sky-900/30 rounded-xl text-sky-900 dark:text-sky-100 placeholder:text-sky-700/40 dark:placeholder:text-sky-400/40 text-sm outline-none focus:ring-1 focus:ring-sky-500/20"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                          {electiveOptions.filter((elective) =>
                            elective.name.toLowerCase().includes(electiveSearch.toLowerCase())
                          ).map((elective) => {
                            const iconName = getElectiveIcon(elective.icon);
                            const isSelected = selectedElectives.includes(elective.name);
                            return (
                              <button
                                key={elective.name}
                                onClick={() => handleElectiveToggle(elective.name)}
                                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-left ${isSelected
                                  ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 border-[#d4e88e]/50 dark:border-sky-500/30'
                                  : 'border-transparent hover:border-sky-100 dark:hover:border-gray-700 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                  }`}
                              >
                                <div className={`p-2 rounded-xl shrink-0 ${isSelected
                                  ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/15'
                                  : 'bg-sky-100 dark:bg-sky-500/15'
                                  }`}>
                                  <HugeIcon name={iconName} size={16} className={`w-4 h-4 ${isSelected
                                    ? 'text-sky-600 dark:text-sky-400'
                                    : 'text-sky-500 dark:text-sky-400'
                                    }`} />
                                </div>
                                <span className={`font-medium text-sm flex-1 ${isSelected
                                  ? 'text-sky-700 dark:text-sky-300'
                                  : 'text-sky-800 dark:text-sky-200'
                                  }`}>{elective.name}</span>
                                {isSelected && <HugeIcon name="CheckmarkCircle02" size={16} className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );

              case 'summary':
                return (
                  <div className="space-y-5">
                    {/* Summary Header */}
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden">
                      <div className="px-5 pt-4 pb-2">
                        <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                          Your Workspace
                        </span>
                      </div>
                      <div className="px-5 pb-5">
                        <p className="text-sm text-sky-700/50 dark:text-sky-300/50 mb-5">
                          Review your course load before we finalize your workspace.
                        </p>

                        <div className="space-y-5">
                          {/* Core */}
                          <div>
                            <span className="text-[11px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em] mb-2 block">
                              Core Curriculum
                            </span>
                            <div className="space-y-1">
                              {(() => {
                                const adjustedMathClass = getAdjustedMathClass();
                                const coreClasses = suggestedClasses.map((cls, idx) =>
                                  idx === 0 ? adjustedMathClass || cls : cls
                                );
                                if (fullLanguageName) {
                                  coreClasses.push({ name: fullLanguageName, icon: 'LanguageCircle', colorIndex: suggestedClasses.length });
                                }
                                return coreClasses.map((classInfo, idx) => (
                                  <div key={idx} className="flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/5 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-sky-500 shrink-0" />
                                    <span className="text-sm text-sky-800 dark:text-sky-200">
                                      {classInfo.name}
                                    </span>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>

                          {/* Electives */}
                          <div>
                            <span className="text-[11px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em] mb-2 block">
                              Elective Selection
                            </span>
                            <div className="space-y-1">
                              {selectedElectives.map((electiveName, idx) => (
                                <div key={idx} className="flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/5 transition-colors">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4e88e] dark:bg-emerald-400 shrink-0" />
                                  <span className="text-sm text-sky-800 dark:text-sky-200">
                                    {electiveName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-[100] sm:p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full sm:h-auto sm:max-w-2xl bg-white dark:bg-gray-900 sm:rounded-[28px] sm:border sm:border-sky-100 dark:sm:border-gray-800 sm:shadow-2xl sm:shadow-sky-500/5 overflow-hidden flex flex-col relative"
      >
        {/* Header — hidden on welcome step */}
        {currentStep !== 'welcome' && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-sky-100/60 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <Image
                src={isDarkMode ? "/3.svg" : "/2.svg"}
                alt="TaskTornado"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <h1 className="text-lg font-bold text-sky-900 dark:text-white">
                Set up your workspace
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <HugeIcon name="Cancel01" size={20} className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Progress & Step Pills — hidden on welcome */}
        {currentStep !== 'welcome' && (
          <>
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              {/* Step pills — matching grade calculator style */}
              <div className="flex items-center gap-1.5">
                {allSteps.map((s, i) => {
                  const stepLabels: Record<string, string> = {
                    'grade': 'Grade',
                    'language': 'Language',
                    'math-acceleration': 'Math',
                    'electives': 'Electives',
                    'summary': 'Review'
                  };
                  return (
                    <React.Fragment key={s}>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${displayStepIndex === i
                        ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                        : i < displayStepIndex
                          ? 'text-sky-600/60 dark:text-sky-400/60'
                          : 'text-sky-600/30 dark:text-sky-400/30'
                        }`}>
                        <span>{i + 1}.</span>
                        <span>{stepLabels[s]}</span>
                      </div>
                      {i < allSteps.length - 1 && <span className="text-sky-600/30 dark:text-sky-400/30 text-[10px]">→</span>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-5 pb-3">
              <div className="h-1 w-full bg-sky-100 dark:bg-sky-900/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((displayStepIndex + 1) / allSteps.length) * 100}%`
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          </>
        )}

        {/* Content Area */}
        <div className="flex-1 px-5 pb-4 overflow-y-auto custom-scrollbar min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Footer Navigation — hidden on welcome step */}
        {currentStep !== 'welcome' && (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-sky-100/60 dark:border-gray-800">
            <button
              onClick={handleBack}
              disabled={currentStep === 'grade'}
              className="h-10 px-4 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-0 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <HugeIcon name="ArrowLeft01" size={14} className="w-3.5 h-3.5" />
              Back
            </button>

            {currentStep === 'summary' ? (
              <button
                onClick={handleCreateClasses}
                disabled={isLoading}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <HugeIcon name="LoaderPinwheel" size={16} className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <HugeIcon name="CheckmarkCircle02" size={16} className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`h-10 px-5 text-[13px] font-semibold rounded-full transition-all flex items-center gap-1.5 ${canProceed()
                  ? 'text-white bg-[#275085] dark:bg-[#4a9cdb] hover:bg-[#1f3f6b] dark:hover:bg-[#3d8bc4] shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 active:scale-95'
                  : 'bg-sky-100 dark:bg-gray-800 text-sky-400/50 dark:text-sky-500/30 cursor-not-allowed'
                  }`}
              >
                Next Step
                <HugeIcon name="ArrowRight01" size={14} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
