'use client';

import React, { useEffect } from 'react';
import { signIn } from '../actions/auth/signInAction';
import { signUpAction } from '../actions/auth/signUpAction';
import { requestEmailCodeAction } from '@/app/actions/wallet/requestEmailCodeAction';
import { verifyEmailCodeAction } from '@/app/actions/wallet/verifyEmailCodeAction';

export default function WebGLPage() {
  useEffect(() => {
    // Expose the authentication function to window
    window.authenticateUser = async (email: string) => {
      const formData = new FormData();
      formData.append('email', email);

      try {
        const result = await signIn(null, formData);
        const unityInstance = (window as any).unityInstance;
        
        if (result.success) {
          unityInstance?.SendMessage('GameObject', 'OnAuthSuccess', 'Login successful');
        } else {
          unityInstance?.SendMessage('GameObject', 'OnAuthFailure', result.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        const unityInstance = (window as any).unityInstance;
        unityInstance?.SendMessage('GameObject', 'OnAuthFailure', 'Authentication failed');
      }
    };

    // Add sign up function
    window.signUpUser = async (email: string, doSignUp: boolean = true) => {
      const formData = new FormData();
      formData.append('email', email);

      try {
        let result;
        if (doSignUp) {
          result = await signUpAction(formData);
        } else {
          window.location.href = `https://app.handcash.io/#/authorizeApp?appId=67bd0ea60a9dccd5866e3bbf`;
          return;
        }
        
        const unityInstance = (window as any).unityInstance;
        
        if (result.success) {
          unityInstance?.SendMessage('GameObject', 'OnSignUpSuccess', 'Registration successful');
        } else {
          unityInstance?.SendMessage('GameObject', 'OnSignUpFailure', 'Registration failed');

        }
      } catch (error: any) {
        const unityInstance1 = (window as any).unityInstance;


        console.error('Sign up error:', error);

        unityInstance1?.SendMessage('GameObject', 'OnSignUpFailure', 'Registration failed');
      }
    };

    // Function to get Unity instance with retries
    const getUnityInstance = async (maxRetries = 10, retryDelay = 500): Promise<any> => {
      let retries = 0;
      
      while (retries < maxRetries) {
        const instance = (window as any).unityInstance;
        if (instance) {
          console.log('Unity instance found after', retries, 'retries');
          return instance;
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retries++;
      }
      
      throw new Error('Failed to get Unity instance after ' + maxRetries + ' retries');
    };

    // Email code request handler
    window.requestEmailCode = async (email: string) => {
      if (!email) {
        const unityInstance = await getUnityInstance().catch(err => {
          console.error('Failed to get Unity instance:', err);
          return null;
        });
        
        if (unityInstance) {
          unityInstance.SendMessage('EmailVerificationManager', 'OnEmailCodeRequestFailed', 'Email is required');
        }
        return;
      }

      try {
        const result = await requestEmailCodeAction(email);
        console.log('Server response:', result);

        const unityInstance = await getUnityInstance().catch(err => {
          console.error('Failed to get Unity instance:', err);
          return null;
        });
        
        if (result?.success && result?.requestId) {
          console.log('Sending requestId to Unity:', result.requestId);
          if (unityInstance) {
            console.log('Unity instance found, sending message...');
            try {
              // Try different approaches to find the GameObject
              console.log('Attempting to send message to Canvas/GameObject (1)/EmailVerificationManager...');
              unityInstance.SendMessage(
                'Canvas/GameObject (1)', 
                'OnEmailCodeRequestSuccess', 
                result.requestId.toString()
              );
              
              // If that fails, try without Canvas
              console.log('Attempting to send message to GameObject (1)...');
              unityInstance.SendMessage(
                'GameObject (1)', 
                'OnEmailCodeRequestSuccess', 
                result.requestId.toString()
              );
              
              // If that fails too, try just the parent GameObject
              console.log('Attempting to send message to GameObject...');
              unityInstance.SendMessage(
                'GameObject', 
                'OnEmailCodeRequestSuccess', 
                result.requestId.toString()
              );
              
              console.log('Message attempts completed');
            } catch (error) {
              console.error('Error sending message to Unity:', error);
            }
          } else {
            console.error('Unity instance not found after retries!');
          }
        } else {
          console.error('Invalid response format:', result);
          if (unityInstance) {
            unityInstance.SendMessage(
              'EmailVerificationManager', 
              'OnEmailCodeRequestFailed', 
              'Invalid response from server'
            );
          }
        }
      } catch (error: any) {
        console.error('Email code request error:', error);
        const unityInstance = await getUnityInstance().catch(err => {
          console.error('Failed to get Unity instance:', err);
          return null;
        });
        
        if (unityInstance) {
          unityInstance.SendMessage(
            'EmailVerificationManager', 
            'OnEmailCodeRequestFailed', 
            error.message || 'Failed to request code'
          );
        }
      }
    };

    window.getCookie = async () => {
      const cookie = document.cookie.replace(/(?:(?:^|.*;\s*)handle\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      console.log('Cookie:', cookie);
      if (cookie.length > 0) {
        const unityInstance = await getUnityInstance();
        if (unityInstance) {
          unityInstance.SendMessage('GameObject', 'OnGetCookieSuccess', cookie);
        }
      }else{
        const unityInstance = await getUnityInstance();
        if (unityInstance) {
          unityInstance.SendMessage('GameObject', 'OnGetCookieFailed', 'You are not logged in.');
        }
      }
    };

    // Email verification handler
    window.verifyEmailCode = async (requestId: string, verificationCode: string, email: string, handle: string) => {
      console.log('Verifying email code with params:', { requestId, verificationCode, email, handle });
      try {
        const unityInstance = await getUnityInstance();
        if (!unityInstance) {
          console.error('Unity instance not found for email verification');
          return;
        }

        // Send verification parameters
        const formData = new FormData();
        formData.append('requestId', requestId);
        formData.append('verificationCode', verificationCode);
        formData.append('email', email);
        formData.append('handle', handle);
        try {
          const result = await verifyEmailCodeAction(formData);
          console.log('Verification response:', result);

          if (result.success) {
            unityInstance.SendMessage(
              'GameObject',
              'OnVerificationSuccess',
              'Verification successful'
            );
          } else {
            unityInstance.SendMessage(
              'GameObject',
              'OnVerificationFailure',
              result.error || 'Verification failed'
            );
          }
        } catch (error: any) {
          // Check if it's a redirect error (which we want to treat as success)
          if (error.message && error.message.includes('NEXT_REDIRECT')) {
            unityInstance.SendMessage(
              'GameObject',
              'OnVerificationSuccess',
              'Verification successful'
            );
          } else {
            console.error('Error during email verification:', error);
            unityInstance.SendMessage(
              'GameObject',
              'OnVerificationFailure',
              error.message || 'Verification failed'
            );
          }
        }
      } catch (error: any) {
        console.error('Error during email verification:', error);
        const unityInstance = await getUnityInstance();
        if (unityInstance) {
          unityInstance.SendMessage(
            'GameObject',
            'OnVerificationFailure',
            error.message || 'Verification failed'
          );
        }
      }
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <iframe 
        id="unity-frame"
        src="/webgl-build/index.html"
        className="w-full h-full border-none"
        allow="autoplay; fullscreen"
      />
    </div>
  );
} 