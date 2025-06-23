'use client';

import { useState, useEffect } from 'react';
import { Eye, Check, AlertTriangle, Loader2, X } from 'lucide-react';

interface TransactionStep {
  id: string;
  text: string;
  status: 'pending' | 'loading' | 'completed';
}

interface TransactionCardProps {
  title: string;
  amount: string;
  description?: string;
  steps: TransactionStep[];
  state: 'confirmation' | 'scanning' | 'transferring' | 'completed' | 'error';
  onConfirm?: () => void;
  onCancel?: () => void;
  logo?: React.ReactNode;
  scanResult?: 'safe' | 'fraud' | null;
  showOTP?: boolean;
  onOTPComplete?: (otp: string) => void;
}

export function TransactionCard({
  title,
  amount,
  description,
  steps,
  state,
  onConfirm,
  onCancel,
  logo,
  scanResult = null,
  showOTP = false,
  onOTPComplete
}: TransactionCardProps) {
  const [showScanning, setShowScanning] = useState(false);
  const [eyeVisible, setEyeVisible] = useState(true);
  const [scanComplete, setScanComplete] = useState(false);

  // OTP State
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  // Scanning animation effect
  useEffect(() => {
    if (state === 'scanning') {
      setShowScanning(true);
      
      // Eye fade animation
      const eyeInterval = setInterval(() => {
        setEyeVisible(prev => !prev);
      }, 800);

      // Complete scanning after 3 seconds
      const scanTimeout = setTimeout(() => {
        setScanComplete(true);
        clearInterval(eyeInterval);
        
        // Hide scanning panel after result is shown
        setTimeout(() => {
          setShowScanning(false);
        }, 2000);
      }, 3000);

      return () => {
        clearInterval(eyeInterval);
        clearTimeout(scanTimeout);
      };
    }
  }, [state]);

  // Auto-progress steps in transferring state
  useEffect(() => {
    if (state === 'transferring') {
      steps.forEach((step, index) => {
        setTimeout(() => {
          step.status = 'loading';
          setTimeout(() => {
            step.status = 'completed';
          }, 2000 + index * 1000);
        }, index * 1500);
      });
    }
  }, [state, steps]);

  // OTP handling
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Check if OTP is complete
    if (newOtpValues.every(val => val !== '')) {
      onOTPComplete?.(newOtpValues.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      setActiveOtpIndex(index - 1);
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const getScanResultColor = () => {
    if (!scanComplete) return 'bg-blue-500';
    return scanResult === 'fraud' ? 'bg-red-500' : 'bg-green-500';
  };

  const getScanResultIcon = () => {
    if (!scanComplete) {
      return (
        <Eye 
          className={`w-4 h-4 text-white transition-opacity duration-300 ${
            eyeVisible ? 'opacity-100' : 'opacity-30'
          }`} 
        />
      );
    }
    return scanResult === 'fraud' ? (
      <AlertTriangle className="w-4 h-4 text-white" />
    ) : (
      <Check className="w-4 h-4 text-white" />
    );
  };

  const getScanResultText = () => {
    if (!scanComplete) return 'Scanning address';
    return scanResult === 'fraud' ? 'Fraud detected' : 'Address verified';
  };

  if (showOTP) {
    return (
      <div className="bg-gray-900 text-white rounded-2xl p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-300 mb-1">{title}</h2>
          <div className="text-2xl font-bold text-green-400">{amount}</div>
        </div>

        {/* OTP Section */}
        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-4">
            Complete your payment by entering the OTP sent to your phone
          </p>
          <p className="text-gray-400 text-xs mb-6">
            An OTP has been sent to your phone number ending in **** 1234
          </p>

          {/* OTP Input Fields */}
          <div className="flex space-x-3 mb-6">
            {otpValues.map((value, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onFocus={() => setActiveOtpIndex(index)}
                className={`w-12 h-12 bg-gray-800 border-2 rounded-lg text-center text-white text-lg font-medium focus:outline-none transition-colors ${
                  activeOtpIndex === index 
                    ? 'border-white' 
                    : value 
                      ? 'border-gray-600' 
                      : 'border-gray-700'
                }`}
                maxLength={1}
              />
            ))}
          </div>

          {/* Complete Payment Button */}
          <button
            disabled={!otpValues.every(val => val !== '')}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              otpValues.every(val => val !== '')
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Complete payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded-2xl overflow-hidden max-w-md mx-auto relative">
      {/* Main Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-300 mb-1">{title}</h2>
            <div className="text-2xl font-bold text-green-400">{amount}</div>
          </div>
          {logo && (
            <div className="ml-4 flex-shrink-0">
              {logo}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-300 text-sm mb-4">{description}</p>
        )}

        {/* Steps */}
        {state === 'transferring' && (
          <div className="mb-6 space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {step.status === 'completed' ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : step.status === 'loading' ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-600 rounded-full" />
                  )}
                </div>
                <span className={`text-sm ${
                  step.status === 'completed' 
                    ? 'text-green-400' 
                    : step.status === 'loading'
                      ? 'text-blue-400'
                      : 'text-gray-400'
                }`}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {(state === 'confirmation' || state === 'scanning') && (
          <div className="flex space-x-3">
            <button
              onClick={onConfirm}
              disabled={state === 'scanning'}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                state === 'scanning'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              Confirm
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Scanning Panel */}
      <div className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out ${
        showScanning 
          ? 'transform translate-y-0 opacity-100' 
          : 'transform translate-y-full opacity-0'
      }`}>
        <div className={`${getScanResultColor()} px-6 py-4 flex items-center justify-between`}>
          <span className="text-white text-sm font-medium">
            {getScanResultText()}
          </span>
          <div className="flex-shrink-0">
            {getScanResultIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}