'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function CreateWalletForm({ appName, imageUrl }) {
  const [email, setEmail] = useState("");
  const [requestId, setRequestId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [profile, setProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [walletType, setWalletType] = useState("appCreated");
  const [alias, setAlias] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const createAccountPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/createWallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (response.ok) {
          const result = await response.json();
          setEmail(result.email);
          setRequestId(result.requestId);
          setCurrentStep(2);
          resolve(true);
        } else {
          reject('Failed to create app wallet');
        }
      } catch (error) {
        reject('Failed to create app wallet');
      }
    });

    toast.promise(createAccountPromise, {
      pending: 'Creating app wallet...',
      success: 'App wallet created successfully!',
      error: 'Error creating app wallet',
    });
  };

  const handleVerify = async () => {
    const verifyPromise = new Promise(async (resolve, reject) => {
      try {
        const verifyData = {
          email,
          verificationCode,
          requestId,
          walletType,
          ...(walletType === "external" && { alias }),
        };

        const response = await fetch('/api/verifyWallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyData),
        });

        if (response.ok) {
          const result = await response.json();
          setAuthToken(result.authToken);
          setProfile(result.publicProfile);
          setCurrentStep(3);
          resolve('Wallet verified successfully!');
        } else {
          reject('Failed to verify wallet');
        }
      } catch (error) {
        reject('Failed to verify wallet');
      }
    });

    toast.promise(verifyPromise, {
      pending: 'Verifying wallet...',
      success: 'Wallet verified successfully!',
      error: 'Error verifying wallet',
    });
  };

  const resetToStep1 = () => {
    setEmail("");
    setRequestId("");
    setVerificationCode("");
    setAuthToken("");
    setProfile(null);
    setCurrentStep(1);
    setWalletType("appCreated");
    setAlias("");
  };

  const StepIndicator = ({ step, description }) => (
    <div className="flex items-center mb-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
        {step}
      </div>
      <span className={currentStep >= step ? 'text-blue-500' : 'text-gray-600'}>{description}</span>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <div className="w-full max-w-md">
        <div className="mb-6">
          <StepIndicator step={1} description="Create Account" />
          <StepIndicator step={2} description="Verify Code" />
          <StepIndicator step={3} description="Account Created" />
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Create New App Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-center">
                <Label htmlFor="name">Application</Label>
                <div>{appName}</div>
              </div>
              <div className="space-y-2 flex justify-center">
                <img src={imageUrl} alt="Application" className="w-24 h-24 rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} className="w-full">Create</Button>
            </CardFooter>
          </Card>
        )}

{currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={walletType} onValueChange={setWalletType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="appCreated" id="appCreated" />
                  <Label htmlFor="appCreated">App Created Wallet</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="external" />
                  <Label htmlFor="external">External Wallet</Label>
                </div>
              </RadioGroup>

              {walletType === "external" && (
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias</Label>
                  <Input
                    id="alias"
                    type="text"
                    placeholder="Enter alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleVerify} className="w-full">Verify</Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && profile && (
          <Card>
            <CardHeader>
              <CardTitle>Wallet Created Successfully</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Access Token</Label>
                <div className="bg-gray-100 p-2 rounded break-all">{authToken}</div>
              </div>
              <div className="space-y-2">
                <Label>Profile</Label>
                <div className="bg-gray-100 p-2 rounded">
                  <p><strong>User Id:</strong> {profile.id}</p>
                  <p><strong>User Handle:</strong> {profile.handle}</p>
                  <p><strong>User Paymail:</strong> {profile.paymail}</p>
                  <p><strong>User Creation Date:</strong> {moment(profile.createdAt).format('LLLL')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep > 1 && (
          <div className="mt-4">
            <Button onClick={resetToStep1} className="w-full">Back to Step 1</Button>
          </div>
        )}
      </div>
    </>
  );
}