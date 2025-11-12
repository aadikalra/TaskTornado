'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Trash2, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const DangerZone = ({ 
  title, 
  description, 
  buttonText, 
  confirmText, 
  onConfirm, 
  isConfirming, 
  count,
  countLabel,
  icon: Icon 
}: {
  title: string;
  description: string;
  buttonText: string;
  confirmText: string;
  onConfirm: () => void;
  isConfirming: boolean;
  count: number;
  countLabel: string;
  icon: React.ElementType;
}) => (
  <Card className="border-red-200 dark:border-red-900/50">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {count} {count === 1 ? countLabel : `${countLabel}s`}
        </span>
      </div>
      <CardDescription className="text-muted-foreground">
        {description}
      </CardDescription>
    </CardHeader>
    <CardFooter>
      <Button
        variant={isConfirming ? 'destructive' : 'outline'}
        onClick={onConfirm}
        className="w-full justify-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        {isConfirming ? confirmText : buttonText}
      </Button>
    </CardFooter>
  </Card>
);


export default function SettingsPage() {
  const { classes, homeworks, clearAllClasses, clearAllHomeworks } = useClassContext();
  const { signOut } = useAuth() || {};
  const [showClassConfirm, setShowClassConfirm] = useState(false);
  const [showHomeworkConfirm, setShowHomeworkConfirm] = useState(false);
  const router = useRouter();

  const handleClearClasses = () => {
    if (showClassConfirm) {
      clearAllClasses();
      setShowClassConfirm(false);
    } else {
      setShowClassConfirm(true);
      // Reset confirmation after 5 seconds
      setTimeout(() => setShowClassConfirm(false), 5000);
    }
  };

  const handleClearHomeworks = () => {
    if (showHomeworkConfirm) {
      clearAllHomeworks();
      setShowHomeworkConfirm(false);
    } else {
      setShowHomeworkConfirm(true);
      // Reset confirmation after 5 seconds
      setTimeout(() => setShowHomeworkConfirm(false), 5000);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your data and preferences
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/')}
              className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your classes and homework data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DangerZone
                  title="Delete All Classes"
                  description="This will permanently delete all your classes and associated homework."
                  buttonText="Delete All Classes"
                  confirmText="Click to confirm"
                  onConfirm={handleClearClasses}
                  isConfirming={showClassConfirm}
                  count={classes.length}
                  countLabel="class"
                  icon={BookOpen}
                />

                <DangerZone
                  title="Delete All Homework"
                  description="This will permanently delete all your homework assignments."
                  buttonText="Delete All Homework"
                  confirmText="Click to confirm"
                  onConfirm={handleClearHomeworks}
                  isConfirming={showHomeworkConfirm}
                  count={homeworks.length}
                  countLabel="assignment"
                  icon={BookOpen}
                />

                <Card className="border-blue-200 dark:border-blue-900/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground">
                      Sign out of your account. You'll need to sign in again to access your data.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={signOut}
                      className="w-full justify-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
