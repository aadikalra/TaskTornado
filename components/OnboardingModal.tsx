'use client';

import * as React from 'react';
import { useClassContext } from '@/context/ClassContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, BookOpen, Calculator, Globe, FlaskConical, Footprints, Users, Waves, Music, Guitar, Mic2, Crown, PenTool, Camera, GraduationCap, Code, MessageCircle, ChevronRight, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { X } from '@/components/animate-ui/icons/x';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { AnimateIcon } from './animate-ui/animate-icon';
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
}

type OnboardingStep = 'grade' | 'math-acceleration' | 'math-acceleration-level' | 'language' | 'electives' | 'summary';

interface ClassSuggestion {
  name: string;
  icon: string;
  colorIndex: number;
}

const gradeClassMappings: Record<string, ClassSuggestion[]> = {
  '7': [
    { name: 'Math 7', icon: 'Calculator', colorIndex: 0 },
    { name: 'English 7', icon: 'BookOpen', colorIndex: 1 },
    { name: 'History 7', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 7', icon: 'Flask', colorIndex: 3 },
  ],
  '8': [
    { name: 'Math 8', icon: 'Calculator', colorIndex: 0 },
    { name: 'English 8', icon: 'BookOpen', colorIndex: 1 },
    { name: 'History 8', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 8', icon: 'Flask', colorIndex: 3 },
  ],
  '9': [
    { name: 'Math 9', icon: 'Calculator', colorIndex: 0 },
    { name: 'English 9', icon: 'BookOpen', colorIndex: 1 },
    { name: 'History 9', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 9', icon: 'Flask', colorIndex: 3 },
  ],
  '10': [
    { name: 'Math 10', icon: 'Calculator', colorIndex: 0 },
    { name: 'English 10', icon: 'BookOpen', colorIndex: 1 },
    { name: 'History 10', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 10', icon: 'Flask', colorIndex: 3 },
  ],
  '11': [
    { name: 'Math 11', icon: 'Calculator', colorIndex: 0 },
    { name: 'English 11', icon: 'BookOpen', colorIndex: 1 },
    { name: 'History 11', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 11', icon: 'Flask', colorIndex: 3 },
  ],
  '12': [
    { name: 'Math 12', icon: 'Calculator', colorIndex: 0 },
    { name: 'English 12', icon: 'BookOpen', colorIndex: 1 },
    { name: 'History 12', icon: 'Globe', colorIndex: 2 },
    { name: 'Science 12', icon: 'Flask', colorIndex: 3 },
  ],
};

interface ElectiveOption {
  name: string;
  icon: string;
  colorIndex: number;
}

const electiveOptions: ElectiveOption[] = [
  // Physical Education (PE is elective choice, not automatic)
  { name: 'MS Aerobic Walking', icon: 'Footprints', colorIndex: 0 },
  { name: 'MS Team Sports', icon: 'Users', colorIndex: 1 },

  // Sciences
  { name: 'MS Marine Science', icon: 'Waves', colorIndex: 2 },

  // Music Options
  { name: 'MS Music Appreciation', icon: 'Music', colorIndex: 3 },
  { name: 'MS Beginning Band', icon: 'Music', colorIndex: 4 },
  { name: 'MS Concert Band', icon: 'Music', colorIndex: 5 },
  { name: 'MS Guitar', icon: 'Guitar', colorIndex: 6 },
  { name: 'MS Choir', icon: 'Mic2', colorIndex: 7 },

  // Leadership/Service
  { name: 'MS Service Leadership', icon: 'Crown', colorIndex: 8 },

  // Arts/Performance
  { name: 'MS Theater Arts', icon: 'Drama', colorIndex: 9 },
  { name: 'MS Yearbook', icon: 'BookOpen', colorIndex: 10 },
  { name: 'MS Creative Writing', icon: 'PenTool', colorIndex: 11 },
  { name: 'MS Digital Media Arts', icon: 'Camera', colorIndex: 12 },

  // Academic Support
  { name: 'Academic Seminar', icon: 'GraduationCap', colorIndex: 13 },
  { name: 'Academic Seminar WITH Math Support', icon: 'Calculator', colorIndex: 14 },

  // Technology
  { name: 'MS Computer Science', icon: 'Code', colorIndex: 15 }

  // Note: Spanish and Mandarin are handled as required languages for 8th graders, not electives
];

const languageOptions = [
  'Spanish',
  'Mandarin'
];

const classColors = ['#E53E3E', '#3182CE', '#D69E2E', '#38A169', '#805AD5', '#D53F8C', '#2E7774', '#4A5568'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { classes, addClass } = useClassContext();
  const isDarkMode = useDarkMode();
  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>('grade');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('');
  const [isMathAccelerated, setIsMathAccelerated] = React.useState<boolean>(false);
  const [mathAccelerationLevel, setMathAccelerationLevel] = React.useState<number>(0);
  const [selectedElectives, setSelectedElectives] = React.useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('');
  const [electiveSearch, setElectiveSearch] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const suggestedClasses = selectedGrade ? gradeClassMappings[selectedGrade] || [] : [];

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('grade');
      setSelectedGrade('');
      setIsMathAccelerated(false);
      setMathAccelerationLevel(0);
      setSelectedElectives([]);
      setSelectedLanguage('');
      setElectiveSearch('');
    }
  }, [isOpen]);

  // Calculate the correct math class based on grade and acceleration
  const getAdjustedMathClass = () => {
    if (!selectedGrade || !isMathAccelerated) {
      return suggestedClasses.find(cls => cls.name.startsWith('Math'));
    }

    const baseGrade = parseInt(selectedGrade);
    const mathGrade = Math.min(baseGrade + mathAccelerationLevel, 12); // Cap at 12th grade
    return {
      name: `Math ${mathGrade}`,
      icon: 'Calculator',
      colorIndex: 0
    };
  };

  // Helper function to get icon component for electives
  const getElectiveIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Footprints': Footprints,
      'Users': Users,
      'Waves': Waves,
      'Music': Music,
      'Guitar': Guitar,
      'Mic2': Mic2,
      'Crown': Crown,
      'Drama': BookOpen, // Using BookOpen as fallback for Drama
      'BookOpen': BookOpen,
      'PenTool': PenTool,
      'Camera': Camera,
      'GraduationCap': GraduationCap,
      'Calculator': Calculator,
      'Code': Code,
      'Globe': Globe,
      'MessageCircle': MessageCircle,
    };

    return iconMap[iconName] || BookOpen;
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
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
        const maxElectives = selectedGrade === '8' ? 1 : 2;
        if (prev.length < maxElectives) {
          return [...prev, electiveName];
        }
        return prev;
      }
    });
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'grade':
        if (selectedGrade) {
          if (selectedGrade === '8') {
            setCurrentStep('language');
          } else {
            setCurrentStep('math-acceleration');
          }
        }
        break;
      case 'language':
        if (selectedLanguage) setCurrentStep('math-acceleration');
        break;
      case 'math-acceleration':
        if (isMathAccelerated) {
          setCurrentStep('math-acceleration-level');
        } else {
          setCurrentStep('electives');
        }
        break;
      case 'math-acceleration-level':
        setCurrentStep('electives');
        break;
      case 'electives':
        const maxElectives = selectedGrade === '8' ? 1 : 2;
        if (selectedElectives.length === maxElectives) setCurrentStep('summary');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'language':
        setCurrentStep('grade');
        break;
      case 'math-acceleration':
        if (selectedGrade === '8') {
          setCurrentStep('language');
        } else {
          setCurrentStep('grade');
        }
        break;
      case 'math-acceleration-level':
        setCurrentStep('math-acceleration');
        break;
      case 'electives':
        if (isMathAccelerated) {
          setCurrentStep('math-acceleration-level');
        } else if (selectedGrade === '8') {
          setCurrentStep('language');
        } else {
          setCurrentStep('math-acceleration');
        }
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
      const classesToCreate = suggestedClasses.map(cls =>
        cls.name.startsWith('Math') ? adjustedMathClass! : cls
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

      // Create language class for 8th graders
      if (selectedGrade === '8' && selectedLanguage) {
        await addClass(selectedLanguage, 'MessageCircle' as any);
      }

      onClose();
    } catch (error) {
      console.error('Failed to create classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'grade':
        return selectedGrade !== '';
      case 'language':
        return selectedLanguage !== '';
      case 'math-acceleration':
        return true;
      case 'math-acceleration-level':
        return mathAccelerationLevel > 0;
      case 'electives':
        const maxElectives = selectedGrade === '8' ? 1 : 2;
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
          className="space-y-4"
        >
          {(() => {
            switch (currentStep) {
              case 'grade':
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                        What grade are you in?
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Select your current grade level to see suggested course maps.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['7', '8', '9', '10', '11', '12'].map((grade) => (
                        <button
                          key={grade}
                          onClick={() => handleGradeSelect(grade)}
                          className={`group relative p-4 rounded-xl border duration-200 text-left overflow-hidden ${selectedGrade === grade
                            ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-medium">Grade {grade}</span>
                            <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${selectedGrade === grade ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                          </div>
                          {selectedGrade === grade && (
                            <motion.div
                              layoutId="selection-glow"
                              className="absolute inset-0 bg-white/10 dark:bg-black/10"
                              initial={false}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {selectedGrade && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-900/30"
                      >
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                          Suggested Path
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {(() => {
                            const adjustedMathClass = getAdjustedMathClass();
                            return suggestedClasses.map((classInfo) => {
                              const displayClass = classInfo.name.startsWith('Math') ? adjustedMathClass! : classInfo;
                              return (
                                <div key={displayClass.name} className="flex items-center gap-3">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: classColors[displayClass.colorIndex] }}
                                  />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {displayClass.name}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );

              case 'language':
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                        Choose your language
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        8th graders at our school select one language to study.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {languageOptions.map((language) => (
                        <button
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className={`group relative p-4 rounded-xl border duration-200 text-left overflow-hidden ${selectedLanguage === language
                            ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-medium">{language}</span>
                            <MessageCircle className={`w-5 h-5 ${selectedLanguage === language ? 'text-white/60 dark:text-black/60' : 'text-gray-400'}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );

              case 'math-acceleration':
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                        Math Placement
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Are you taking math at an advanced or accelerated level?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => setIsMathAccelerated(true)}
                        className={`group relative w-full p-4 rounded-xl border duration-200 text-left overflow-hidden ${isMathAccelerated
                          ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl font-medium">Accelerated</span>
                          <Rocket className={`w-5 h-5 ${isMathAccelerated ? 'text-white/60 dark:text-black/60' : 'text-gray-400'}`} />
                        </div>
                        <p className={`text-sm ${isMathAccelerated ? 'text-white/60 dark:text-black/60' : 'text-gray-500'}`}>
                          Taking Math {parseInt(selectedGrade) + 1} or higher
                        </p>
                      </button>

                      <button
                        onClick={() => setIsMathAccelerated(false)}
                        className={`group relative w-full p-4 rounded-xl border duration-200 text-left overflow-hidden ${!isMathAccelerated
                          ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl font-medium">Standard</span>
                          <Calculator className={`w-5 h-5 ${!isMathAccelerated ? 'text-white/60 dark:text-black/60' : 'text-gray-400'}`} />
                        </div>
                        <p className={`text-sm ${!isMathAccelerated ? 'text-white/60 dark:text-black/60' : 'text-gray-500'}`}>
                          Taking Math {selectedGrade}
                        </p>
                      </button>
                    </div>
                  </div>
                );

              case 'math-acceleration-level':
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                        Advancement Level
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        How many grades ahead is your math course?
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((level) => (
                        <button
                          key={level}
                          onClick={() => setMathAccelerationLevel(level)}
                          className={`group relative p-4 rounded-xl border duration-200 text-left overflow-hidden ${mathAccelerationLevel === level
                            ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'
                            }`}
                        >
                          <div className="mb-1">
                            <span className="text-2xl font-semibold">+{level}</span>
                          </div>
                          <p className={`text-xs ${mathAccelerationLevel === level ? 'text-white/60 dark:text-black/60' : 'text-gray-500'}`}>
                            Math {parseInt(selectedGrade) + level}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                );

              case 'electives':
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                        Your Electives
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {selectedGrade === '8'
                          ? 'Select 1 elective you\'re taking this year.'
                          : 'Select 2 electives you\'re taking this year.'
                        }
                      </p>
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search electives..."
                        value={electiveSearch}
                        onChange={(e) => setElectiveSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {electiveOptions.filter((elective) =>
                        elective.name.toLowerCase().includes(electiveSearch.toLowerCase())
                      ).map((elective) => {
                        const IconComponent = getElectiveIcon(elective.icon);
                        const isSelected = selectedElectives.includes(elective.name);
                        return (
                          <button
                            key={elective.name}
                            onClick={() => handleElectiveToggle(elective.name)}
                            className={`group flex items-center gap-4 p-3 rounded-lg border duration-200 text-left ${isSelected
                              ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'
                              }`}
                          >
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/10 dark:bg-black/10' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{elective.name}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Selection
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedElectives.length} of {selectedGrade === '8' ? '1' : '2'}
                      </span>
                    </div>
                  </div>
                );

              case 'summary':
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                        Almost there
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Review your course load before we finalize your workspace.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-900/30 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Core Curriculum
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {(() => {
                              const adjustedMathClass = getAdjustedMathClass();
                              const coreClasses = suggestedClasses.map(cls =>
                                cls.name.startsWith('Math') ? adjustedMathClass! : cls
                              );
                              if (selectedGrade === '8' && selectedLanguage) {
                                coreClasses.push({ name: selectedLanguage, icon: 'MessageCircle', colorIndex: suggestedClasses.length });
                              }
                              return coreClasses.map((classInfo, idx) => (
                                <div key={idx} className="flex items-center gap-3 py-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {classInfo.name}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Elective Selection
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedElectives.map((electiveName, idx) => (
                              <div key={idx} className="flex items-center gap-3 py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {electiveName}
                                </span>
                              </div>
                            ))}
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
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl flex items-center justify-center z-[100] sm:p-4 overflow-hidden">
      <div className="w-full h-full sm:h-auto sm:max-w-2xl bg-white dark:bg-gray-950 sm:rounded-[32px] sm:border sm:border-gray-200 dark:sm:border-gray-800 sm:shadow-2xl overflow-hidden flex flex-col">
        {/* Header - Compact */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <img 
              src={isDarkMode ? "/TaskTornadoDark.svg" : "/TaskTornado.svg"} 
              alt="TaskTornado" 
              className="w-5 h-5"
            />
            <h1 className="text-lg font-medium" style={{ color: isDarkMode ? '#ffffff' : '#264f84' }}>
              TaskTornado
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar - Minimalist */}
        <div className="px-4 pb-4">
          <div className="h-[2px] w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-900 dark:bg-white"
              initial={{ width: 0 }}
              animate={{
                width: (() => {
                  const steps = selectedGrade === '8'
                    ? ['grade', 'language', 'math-acceleration', 'electives', 'summary']
                    : ['grade', 'math-acceleration', 'electives', 'summary'];
                  return `${((steps.indexOf(currentStep) + 1) / steps.length) * 100}%`;
                })()
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 pt-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handleBack}
              disabled={currentStep === 'grade'}
              variant="ghost"
              className="px-4 py-3 h-auto rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === 'summary' ? (
              <Button
                onClick={handleCreateClasses}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-6 py-3 h-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] shadow-xl hover:shadow-gray-200 dark:hover:shadow-none rounded-lg rounded-br-[32px] font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex-1 sm:flex-none px-6 py-3 h-auto rounded-lg rounded-br-[32px] font-medium ${canProceed()
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] shadow-xl hover:shadow-gray-200 dark:hover:shadow-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
