'use client';

import * as React from 'react';
import { useClassContext } from '@/context/ClassContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, CheckCircle2, BookOpen, Calculator, Globe, FlaskConical } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OnboardingStep = 'grade' | 'math-acceleration' | 'math-acceleration-level' | 'electives' | 'summary';

interface ClassSuggestion {
  name: string;
  icon: string;
  colorIndex: number;
}

const gradeClassMappings: Record<string, ClassSuggestion[]> = {
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

const electiveOptions = [
  'Art', 'Music', 'Drama', 'Band', 'Choir', 'Orchestra',
  'Physical Education', 'Health', 'Computer Science', 'Technology',
  'Business', 'Economics', 'Psychology', 'Sociology',
  'Spanish', 'French', 'German', 'Latin', 'Chinese', 'Japanese',
  'Photography', 'Journalism', 'Creative Writing', 'Debate',
  'Robotics', 'Engineering', 'Architecture', 'Design'
];

const classColors = ['#E53E3E', '#3182CE', '#D69E2E', '#38A169', '#805AD5', '#D53F8C', '#2E7774', '#4A5568'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { classes, addClass } = useClassContext();
  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>('grade');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('');
  const [isMathAccelerated, setIsMathAccelerated] = React.useState<boolean>(false);
  const [mathAccelerationLevel, setMathAccelerationLevel] = React.useState<number>(0);
  const [selectedElectives, setSelectedElectives] = React.useState<string[]>([]);
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

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
  };

  const handleElectiveToggle = (elective: string) => {
    setSelectedElectives(prev => {
      if (prev.includes(elective)) {
        return prev.filter(e => e !== elective);
      } else if (prev.length < 2) {
        return [...prev, elective];
      }
      return prev;
    });
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'grade':
        if (selectedGrade) setCurrentStep('math-acceleration');
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
        if (selectedElectives.length === 2) setCurrentStep('summary');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'math-acceleration':
        setCurrentStep('grade');
        break;
      case 'math-acceleration-level':
        setCurrentStep('math-acceleration');
        break;
      case 'electives':
        if (isMathAccelerated) {
          setCurrentStep('math-acceleration-level');
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
      for (const elective of selectedElectives) {
        await addClass(elective, 'BookOpen' as any);
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
      case 'math-acceleration':
        return true;
      case 'math-acceleration-level':
        return mathAccelerationLevel > 0;
      case 'electives':
        return selectedElectives.length === 2;
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
              {['8', '9', '10', '11', '12'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedGrade === grade
                      ? 'border-[#2E7774] bg-[#2E7774]/10 text-[#2E7774]'
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
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  isMathAccelerated
                    ? 'border-[#2E7774] bg-[#2E7774]/10 text-[#2E7774]'
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
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  !isMathAccelerated
                    ? 'border-[#2E7774] bg-[#2E7774]/10 text-[#2E7774]'
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
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mathAccelerationLevel === level
                      ? 'border-[#2E7774] bg-[#2E7774]/10 text-[#2E7774]'
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
                Select 2 electives you're taking this year.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {electiveOptions.map((elective) => (
                <button
                  key={elective}
                  onClick={() => handleElectiveToggle(elective)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedElectives.includes(elective)
                      ? 'border-[#2E7774] bg-[#2E7774]/10 text-[#2E7774]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">{elective}</div>
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedElectives.length}/2 electives selected
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

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Electives:
                </h3>
                <div className="space-y-2">
                  {selectedElectives.map((elective, index) => (
                    <div key={elective} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: classColors[suggestedClasses.length + index] }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {elective}
                      </span>
                    </div>
                  ))}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2E7774] rounded-lg flex items-center justify-center">
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
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            disabled={currentStep === 'grade'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 'grade'
                ? 'opacity-50 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {['grade', 'math-acceleration', 'math-acceleration-level', 'electives', 'summary'].map((step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === currentStep
                    ? 'bg-[#2E7774]'
                    : ['grade', 'math-acceleration', 'math-acceleration-level', 'electives', 'summary'].indexOf(currentStep) > index
                    ? 'bg-[#2E7774]/60'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep === 'summary' ? (
            <button
              onClick={handleCreateClasses}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-[#2E7774] hover:bg-[#3a8b88] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Classes
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                canProceed()
                  ? 'bg-[#2E7774] hover:bg-[#3a8b88] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              }`}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
