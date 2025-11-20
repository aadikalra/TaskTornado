'use client';

import * as React from 'react';
import { useClassContext } from '@/context/ClassContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, BookOpen, Calculator, Globe, FlaskConical, Footprints, Users, Waves, Music, Guitar, Mic2, Crown, PenTool, Camera, GraduationCap, Code, MessageCircle } from 'lucide-react';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { X } from '@/components/animate-ui/icons/x';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { AnimateIcon } from './animate-ui/animate-icon';

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
  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>('grade');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('');
  const [isMathAccelerated, setIsMathAccelerated] = React.useState<boolean>(false);
  const [mathAccelerationLevel, setMathAccelerationLevel] = React.useState<number>(0);
  const [selectedElectives, setSelectedElectives] = React.useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('');
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 'grade':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                What grade are you in?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We'll suggest some classes based on your grade level.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['7', '8', '9', '10', '11', '12'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedGrade === grade
                    ? 'border-[#264f84] bg-[#264f84]/10 text-[#264f84]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="text-lg font-semibold">Grade {grade}</div>
                </button>
              ))}
            </div>

            {selectedGrade && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Suggested Classes:
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const adjustedMathClass = getAdjustedMathClass();
                    return suggestedClasses.map((classInfo) => {
                      const displayClass = classInfo.name.startsWith('Math') ? adjustedMathClass! : classInfo;
                      return (
                        <div key={displayClass.name} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: classColors[displayClass.colorIndex] }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {displayClass.name}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Language Requirement
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                8th graders must take a language. Choose Spanish or Mandarin.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageSelect(language)}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedLanguage === language
                    ? 'border-[#264f84] bg-[#264f84]/10 text-[#264f84]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="text-lg font-semibold">{language}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'math-acceleration':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Math Acceleration
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Are you taking math at an accelerated level?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsMathAccelerated(true)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${isMathAccelerated
                  ? 'border-[#264f84] bg-[#264f84]/10 text-[#264f84]'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <div className="text-lg font-semibold">Yes, I'm math accelerated</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  (Taking Math {parseInt(selectedGrade) + 1} or higher)
                </div>
              </button>

              <button
                onClick={() => setIsMathAccelerated(false)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${!isMathAccelerated
                  ? 'border-[#264f84] bg-[#264f84]/10 text-[#264f84]'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <div className="text-lg font-semibold">No, regular math level</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  (Taking Math {selectedGrade} as expected)
                </div>
              </button>
            </div>
          </div>
        );

      case 'math-acceleration-level':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Math Acceleration Level
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                How many grades are you advanced in math?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => setMathAccelerationLevel(level)}
                  className={`p-4 rounded-lg border-2 transition-all ${mathAccelerationLevel === level
                    ? 'border-[#264f84] bg-[#264f84]/10 text-[#264f84]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="text-lg font-semibold">{level} grade{level > 1 ? 's' : ''}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {parseInt(selectedGrade) + level}th grade math
                  </div>
                </button>
              ))}
            </div>

            {mathAccelerationLevel > 0 && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Math Class Assignment:
                </h3>
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-200">
                    Math {parseInt(selectedGrade) + mathAccelerationLevel}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'electives':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your Electives
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedGrade === '8'
                  ? 'Select 1 elective you\'re taking this year.'
                  : 'Select 2 electives you\'re taking this year.'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {electiveOptions.map((elective) => {
                const IconComponent = getElectiveIcon(elective.icon);
                return (
                  <button
                    key={elective.name}
                    onClick={() => handleElectiveToggle(elective.name)}
                    className={`p-3 rounded-lg border transition-all text-left ${selectedElectives.includes(elective.name)
                      ? 'border-[#264f84] bg-[#264f84]/10 text-[#264f84]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <div className="text-sm font-medium">{elective.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedElectives.length}/{selectedGrade === '8' ? '1' : '2'} electives selected
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ready to Set Up!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We'll create these classes for you to get started.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Core Classes:
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const adjustedMathClass = getAdjustedMathClass();
                    return suggestedClasses.map((classInfo) => {
                      const displayClass = classInfo.name.startsWith('Math') ? adjustedMathClass! : classInfo;
                      return (
                        <div key={displayClass.name} className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: classColors[displayClass.colorIndex] }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {displayClass.name}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {selectedGrade === '8' && selectedLanguage && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Language:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: classColors[suggestedClasses.length] }}
                      />
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedLanguage}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Electives:
                </h3>
                <div className="space-y-2">
                  {selectedElectives.map((electiveName, index) => {
                    const elective = electiveOptions.find(e => e.name === electiveName);
                    const IconComponent = elective ? getElectiveIcon(elective.icon) : BookOpen;
                    const colorIndex = selectedGrade === '8' ? suggestedClasses.length + 1 + index : suggestedClasses.length + index;
                    return (
                      <div key={electiveName} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: classColors[colorIndex] }}
                        />
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {electiveName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#264f84] rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Welcome to TaskTornado!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Let's set up your classes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X animateOnHover />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleBack}
            disabled={currentStep === 'grade'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep === 'grade'
              ? ''
              : 'bg-[#264f84] hover:bg-[#1f3f6b] text-white'
              }`}
            variant={currentStep === 'grade' ? 'ghost' : 'default'}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {(() => {
              const steps = selectedGrade === '8'
                ? ['grade', 'language', 'math-acceleration', 'electives', 'summary']
                : ['grade', 'math-acceleration', 'electives', 'summary'];

              return steps.map((step, index) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${step === currentStep
                    ? 'bg-[#264f84]'
                    : steps.indexOf(currentStep) > index
                      ? 'bg-[#264f84]/60'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                />
              ));
            })()}
          </div>

          {currentStep === 'summary' ? (
            <Button
              onClick={handleCreateClasses}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-[#264f84] hover:bg-[#1f3f6b] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Classes
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${canProceed()
                ? 'bg-[#264f84] hover:bg-[#1f3f6b] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                }`}
            >
              Next
              <ArrowRight className="w-4 h-4" animateOnHover />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
