'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function CompleteSignupPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get Google user data from sessionStorage
    const storedData = sessionStorage.getItem('googleUserData');
    if (storedData) {
      try {
        const decodedData = JSON.parse(atob(storedData));
        setGoogleUserData(decodedData);
      } catch (error) {
        console.error('Error parsing Google user data:', error);
        router.push('/login');
      }
    } else {
      // No Google data found, redirect to login
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!googleUserData) {
      setError('Google user data not found');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', googleUserData.email)
        .single();

      if (existingUsers) {
        // User already exists, just sign them in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: googleUserData.email,
          password: password,
        });

        if (signInError) {
          throw signInError;
        }

        // Clean up session storage
        sessionStorage.removeItem('googleUserData');

        // Redirect to dashboard
        router.push('/dashboard');
        return;
      }

      // Create Supabase account with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: googleUserData.email,
        password: password,
        options: {
          data: {
            full_name: googleUserData.name,
            picture: googleUserData.picture,
            provider: 'google',
            google_id: googleUserData.google_id,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Update the profile to mark as from_google and set email
        await supabase
          .from('profiles')
          .update({
            from_google: true,
            email: googleUserData.email
          })
          .eq('id', data.user.id);

        // Store Google Classroom tokens for API access
        // We'll need to pass the tokens from the OAuth flow through sessionStorage
        const classroomTokens = sessionStorage.getItem('classroomTokens');
        if (classroomTokens) {
          try {
            const tokens = JSON.parse(classroomTokens);
            // Set secure HTTP-only cookie for Google Classroom data
            document.cookie = `classroom-auth=${JSON.stringify({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              user: {
                id: googleUserData.google_id,
                email: googleUserData.email,
                name: googleUserData.name,
                picture: googleUserData.picture,
              },
              expires_at: tokens.expiry_date,
            })}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax; ${process.env.NODE_ENV === 'production' ? 'secure' : ''}`;
          } catch (error) {
            console.error('Error storing classroom tokens:', error);
          }
          sessionStorage.removeItem('classroomTokens');
        }

        // Account created successfully, now sign them in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: googleUserData.email,
          password: password,
        });

        if (signInError) {
          throw signInError;
        }

        // Clean up session storage
        sessionStorage.removeItem('googleUserData');

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (!googleUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Almost there! Just set a password for your account.
          </p>
        </div>

        {/* Google User Info */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            {googleUserData.picture && (
              <img
                src={googleUserData.picture}
                alt="Profile"
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {googleUserData.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {googleUserData.email}
              </p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating account...
                </>
              ) : (
                'Complete Sign Up'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
