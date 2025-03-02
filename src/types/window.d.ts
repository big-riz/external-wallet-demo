declare global {
  interface Window {
    authenticateUser: (email: string) => Promise<void>;
    signUpUser: (email: string) => Promise<void>;
    requestEmailCode: (email: string) => Promise<void>;
    verifyEmailCode: (requestId: string, verificationCode: string, email: string, handle: string) => Promise<void>;
    getCookie: () => Promise<void>;
    unityInstance: any;
  }
}

export {}; 