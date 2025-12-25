'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Brain, BookOpen, BarChart3, Clock } from 'lucide-react';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';
import { FolderContent } from './(landing)/folderContent';
import { Button } from '@/components/animate-ui/components/buttons/button';
import DotGrid from './DotGrid';
import {
  RotatingText,
  RotatingTextContainer,
} from '@/components/animate-ui/primitives/texts/rotating';
const colors = {
  background: '#F7F7F9',
  primaryBlue: '#0052FF',
  darkText: '#1D1D1F',
  grayText: '#86868B',
  stickyNoteYellow: '#fff088',
  white: '#ffffff',
  borderGray: '#E0E0E0',
};

// --- SVG Icon Components ---

const TaskTornadoIcon = ({ size = 24, isDarkMode = false }: { size?: number; isDarkMode?: boolean }) => (
  <img
    width={size}
    height={size}
    src={isDarkMode ? "/TaskTornadoDark.svg" : "/TaskTornado.svg"}
    alt="TaskTornado Logo"
    style={{ display: 'block' }}
  />
);

const CheckmarkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke={colors.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke={colors.grayText} strokeWidth="2" />
    <path d="M12 7V12L15 14" stroke={colors.grayText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Playful Todo List Component
const PlayfulTodolist = () => {
  const [checkedItems, setCheckedItems] = React.useState([false, false, false]);

  const toggleItem = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const todoItems = [
    { id: 1, label: 'Math Homework - Chapter 8', defaultChecked: false },
    { id: 2, label: 'History Essay - World War II', defaultChecked: false },
    { id: 3, label: 'Science Lab Report', defaultChecked: false },
  ];

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {todoItems.map((item, idx) => (
        <div key={item.id} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 0'
          }}>
            {/* Custom Checkbox */}
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: `2px solid ${checkedItems[idx] ? '#0052FF' : '#ddd'}`,
                backgroundColor: checkedItems[idx] ? '#0052FF' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => toggleItem(idx)}
            >
              {checkedItems[idx] && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Task Label */}
            <span style={{
              fontSize: '14px',
              color: checkedItems[idx] ? '#86868B' : '#1D1D1F',
              textDecoration: checkedItems[idx] ? 'line-through' : 'none',
              flex: 1
            }}>
              {item.label}
            </span>
          </div>

          {/* Decorative underline for checked items */}
          {checkedItems[idx] && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '32px',
              right: '0',
              height: '2px',
              backgroundColor: '#0052FF',
              transform: 'translateY(-50%)',
              borderRadius: '1px'
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

const AIFeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: colors.white,
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${colors.borderGray}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    }}
  >
    <div style={{
      fontSize: '24px',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      color: colors.primaryBlue,
    }}>
      {icon}
    </div>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 2px 0', color: colors.darkText }}>
        {title}
      </p>
      <p style={{ fontSize: '10px', color: colors.grayText, margin: 0, lineHeight: 1.3 }}>
        {description}
      </p>
    </div>
  </div>
);

const Hero: React.FC = () => {
  const router = useRouter();
  const [isFloatingChecked, setIsFloatingChecked] = React.useState(true);
  const [isDesktop, setIsDesktop] = React.useState(true);
  const [isMedium, setIsMedium] = React.useState(true);
  const [isLarge, setIsLarge] = React.useState(true);
  const [isSmall, setIsSmall] = React.useState(true);
  const [isTiny, setIsTiny] = React.useState(true);
  const [isMicro, setIsMicro] = React.useState(true);
  const [isMinimal, setIsMinimal] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = React.useState(0);

  const headlines = [
    {
      large: ["Deadlines handled.", "Stress canceled."],
      small: ["Deadlines handled.", "Stress canceled."]
    },
    {
      large: ["Your assignments,", "always under control"],
      small: ["Assignments,", "under control"]
    },
    {
      large: ["Work less.", "Achieve more."],
      small: ["Work less.", "Achieve more."]
    },
    {
      large: ["AI that keeps you", "ahead of your class"],
      small: ["AI that keeps you", "ahead"]
    },
    {
      large: ["Forget late work.", "Forever."],
      small: ["Forget late work.", "Forever."]
    },
    {
      large: ["Your schedule, but", "supercharged"],
      small: ["Your schedule,", "supercharged"]
    },
    {
      large: ["Turn chaos into", "checkmarks"],
      small: ["Chaos →", "checkmarks"]
    },
    {
      large: ["School organization", "done right"],
      small: ["School organization", "done right"]
    }
  ];

  // Extract rotating text for both parts
  const rotatingTextsFirst = headlines.map(h => h.large[0]);
  const rotatingTextsSecond = headlines.map(h => isLarge ? h.large[1] : h.small[1]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 10000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const checkDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsDesktop(width >= 1558);
      setIsMedium(width >= 1311);
      setIsLarge(width >= 1110);
      setIsSmall(width >= 516);
      setIsTiny(width >= 509);
      setIsMicro(width >= 410);
      setIsMinimal(width >= 405 && height >= 894);
    };

    checkDimensions();
    window.addEventListener('resize', checkDimensions);

    // Check for dark mode (system preference)
    const checkDarkMode = () => {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    };

    checkDarkMode();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('resize', checkDimensions);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handleFloatingCheckboxChange = (checked: boolean | "indeterminate") => {
    setIsFloatingChecked(checked === true);
  };

  return (
    <div style={{ backgroundColor: isDarkMode ? '#111828' : '#ffffff', minHeight: '100vh' }}>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />

      <div className="dark:bg-neutral-900" style={styles.page}>
        <DotGrid
          dotSize={4}
          gap={15}
          baseColor="#0000001A"
          activeColor={isDarkMode ? "#87ceeb" : "#3166aa"}
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          darkMode={isDarkMode}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        />
        {/* Main Content Area */}
        <main style={styles.mainContent}>

          {/* --- Floating Decorative Cards --- */}
          {isMinimal && (
            <div style={{
              ...styles.floatingCard,
              ...styles.stickyNote,
              top: isTiny ? '8%' : '1%',
              left: '10%'
            }}>
              <div style={styles.pushpin}></div>
              <p style={styles.stickyNoteText}>Take notes to keep track of crucial details, and accomplish more tasks with ease.</p>
            </div>
          )}
          {isMedium && (
            <div style={{ ...styles.floatingCard, ...styles.checkCard, top: '35%', left: '8%' }}>
              <div style={{ transform: 'scale(2)', transformOrigin: 'center' }}>
                <Checkbox
                  checked={isFloatingChecked}
                  onCheckedChange={handleFloatingCheckboxChange}
                  id="floating-checkmark"
                  className={`border-2 data-[state=checked]:bg-blue-500 border-blue-500 ${isFloatingChecked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-transparent hover:bg-blue-50'}`}
                />
              </div>
            </div>
          )}

          {isDesktop && (
            <div style={{ ...styles.floatingCard, ...styles.remindersCard, top: '15%', right: '8%' }}>
              <p style={styles.cardTitle}>Reminders</p>
              <div style={styles.meetingCard}>
                <ClockIcon />
                <div>
                  <p style={{ fontWeight: 500, color: colors.darkText }}>Today's Meeting</p>
                  <p style={{ margin: 0, fontSize: 12, color: colors.grayText }}>Call with the marketing team</p>
                </div>
              </div>
              <div style={{ ...styles.meetingCard, borderTop: `1px solid ${colors.borderGray}`, paddingTop: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: colors.grayText }}>Time</p>
                <p style={{ margin: 0, fontWeight: 500, color: colors.darkText }}>13:00 - 13:45</p>
              </div>
            </div>
          )}

          {isMicro && (
            <div style={{
              ...styles.floatingCard,
              ...styles.tasksCard,
              bottom: isLarge ? '8%' : '5%',
              left: isLarge ? '12%' : undefined,
              right: isLarge ? undefined : '8%'
            }}>
              <p style={{ ...styles.cardTitle, position: 'relative', bottom: '-12px' }}>Today's Homework</p>
              <FolderContent />

              {/* Folder Icon Background */}
              <div style={styles.folderBackground}>
                <img src="/folder.svg" alt="Folder" style={styles.folderIcon} />
              </div>
            </div>
          )}

          {isDesktop && (
            <div style={{ ...styles.floatingCard, ...styles.aiFeaturesCard, bottom: '15%', right: '10%' }}>
              <p style={styles.cardTitle}>AI-Powered Features</p>
              <div style={styles.aiFeaturesGrid}>
                <AIFeatureCard icon={<Brain size={24} />} title="Smart Study Plans" description="AI-generated study schedules" />
                <AIFeatureCard icon={<BookOpen size={24} />} title="Homework Helper" description="Instant homework assistance" />
                <AIFeatureCard icon={<BarChart3 size={24} />} title="Progress Insights" description="AI-powered progress tracking" />
                <AIFeatureCard icon={<Clock size={24} />} title="Smart Reminders" description="Intelligent deadline alerts" />
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div style={styles.heroSection}>
            <div style={{
              ...styles.heroIconWrapper,
              backgroundColor: isDarkMode ? '#275085' : colors.white,
              boxShadow: isDarkMode ? '0 8px 24px rgba(39, 80, 133, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.1)'
            }}>
              <TaskTornadoIcon size={48} isDarkMode={isDarkMode} />
            </div>
            <h1 style={{
              ...styles.headline,
              fontSize: isMicro ? '50px' : (isTiny ? '32px' : (isSmall ? '38px' : (isMedium ? '45px' : '55px'))),
              lineHeight: isLarge ? 1.0 : 1.1
            }}>
              {isLarge ? (
                <>
                  <RotatingTextContainer
                    text={rotatingTextsFirst}
                    duration={10000}
                    y={-50}
                    className="inline-block"
                    style={{ ...styles.headline, display: 'inline-block' }}
                  >
                    <RotatingText />
                  </RotatingTextContainer>
                  <br />
                  <RotatingTextContainer
                    text={rotatingTextsSecond}
                    duration={10000}
                    y={-50}
                    className="inline-block"
                    style={{ ...styles.headline, ...styles.headlineGray, display: 'inline-block' }}
                  >
                    <RotatingText />
                  </RotatingTextContainer>
                </>
              ) : (
                <>
                  <RotatingTextContainer
                    text={rotatingTextsFirst}
                    duration={10000}
                    y={-50}
                    className="inline-block"
                    style={{ ...styles.headline, display: 'inline-block' }}
                  >
                    <RotatingText />
                  </RotatingTextContainer>
                  <br />
                  <RotatingTextContainer
                    text={rotatingTextsSecond}
                    duration={10000}
                    y={-50}
                    className="inline-block"
                    style={{ ...styles.headline, ...styles.headlineGray, display: 'inline-block' }}
                  >
                    <RotatingText />
                  </RotatingTextContainer>
                </>
              )}
            </h1>
            {isLarge && (
              <p style={styles.subline}>
                AI-powered school organizer for homework, deadlines, and study planning.
              </p>
            )}
            {isLarge && (
              <div style={styles.heroButtons}>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-base mr-4"
                  onClick={() => router.push('/dashboard')}
                >
                  Start Organizing
                </Button>
              </div>
            )}
            {isLarge && (
              <div style={styles.heroStats}>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>50+</span>
                  <span style={styles.statLabel}>Active Students</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>95%</span>
                  <span style={styles.statLabel}>Better Grades</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>AI-Powered</span>
                  <span style={styles.statLabel}>Study Planning</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Styles Object ---
// Using an object for inline styles to keep the JSX clean.

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: colors.background,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: colors.darkText,
    position: 'relative',
    padding: '40px',
    borderRadius: '32px 32px 24px 24px',
    border: `2px solid ${colors.borderGray}`,
    margin: '8px',
    maxWidth: 'calc(100vw - 16px)',
    boxSizing: 'border-box',
  },
  header: {
    width: '100%',
    maxWidth: '1200px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '600',
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    textDecoration: 'none',
    color: colors.darkText,
    fontSize: '16px',
    fontWeight: 500,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  headerButton: {
    backgroundColor: colors.white,
    color: colors.darkText,
    border: `1px solid ${colors.borderGray}`,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    position: 'relative',
  },
  heroSection: {
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  heroIconWrapper: {
    padding: '8px',
    backgroundColor: colors.white,
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
  headline: {
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.2,
    fontFamily: '"Schibsted Grotesk", sans-serif',
  },
  headlineGray: {
    color: colors.grayText,
  },
  subheadline: {
    fontSize: '18px',
    color: colors.grayText,
    maxWidth: '500px',
    margin: '-8px 0 8px 0',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    marginTop: '32px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  statLabel: {
    fontSize: '12px',
    color: colors.grayText,
    fontWeight: '500',
  },
  statDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: colors.borderGray,
  },
  floatingCard: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    padding: '16px',
    zIndex: 1,
  },
  stickyNote: {
    width: '220px',
    height: '220px',
    backgroundColor: colors.stickyNoteYellow,
    transform: 'rotate(-5deg)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '0px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
  },
  pushpin: {
    width: 12,
    height: 12,
    backgroundColor: '#FF5A5F',
    borderRadius: '50%',
    position: 'absolute',
    top: 15,
    left: 15,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  stickyNoteText: {
    fontFamily: 'Sacramento, cursive',
    fontSize: '25px',
    lineHeight: 1.5,
    textAlign: 'left',
    padding: '20px',
  },
  checkCard: {
    width: '80px',
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: '12px',
    backgroundColor: colors.primaryBlue,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remindersCard: {
    width: '280px',
    transform: 'rotate(4deg)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 8px 0',
  },
  meetingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tasksCard: {
    width: '300px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'transparent',
    transform: 'rotate(-6deg)',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  progressBarContainer: {
    height: '6px',
    width: '80px',
    backgroundColor: '#EAEAEA',
    borderRadius: '3px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: '3px',
  },
  taskPercent: {
    fontWeight: 500,
    fontSize: '12px',
    color: colors.grayText
  },
  aiFeaturesCard: {
    width: '320px',
    transform: 'rotate(3deg)',
    textAlign: 'left',
  },
  aiFeaturesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    justifyItems: 'center',
    marginTop: '8px',
  },
  folderBackground: {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
    opacity: 1,
    pointerEvents: 'none',
  },
  folderIcon: {
    width: '200%',
    height: '200%',
    objectFit: 'contain',
    filter: 'brightness(0.95) contrast(1.05)',
  },
};

export default Hero;