const TransactionCard = ({
  title = "TRANSFER TO MIKE",
  amount = "$100",
  amountColor = "text-green-400",
  steps = [
    "Convert 20 $DOGE to ~60 $USDC",
    "Convert 40 $SHIBA to ~40 $USDC",
    "Bridge 100 $USDC to Algorand",
    "Transfer 100 $USDC to Mike"
  ],
  logo = null,
  onConfirm = () => { },
  onCancel = () => { },
  simulateScanning = true,
  simulateFraud = false,
  simulateProcessing = true
}) => {
  const [state, setState] = useState('initial'); // initial, scanning, fraud, processing, success, otp
  const [scannerVisible, setScannerVisible] = useState(false);
  const [eyeVisible, setEyeVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const otpRefs = useRef([]);

  // Scanner animation effect
  useEffect(() => {
    if (state === 'initial' && simulateScanning) {
      const timer = setTimeout(() => {
        setScannerVisible(true);
        setState('scanning');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state, simulateScanning]);

  // Eye fade animation during scanning
  useEffect(() => {
    let interval;
    if (state === 'scanning') {
      interval = setInterval(() => {
        setEyeVisible(prev => !prev);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Scanning completion
  useEffect(() => {
    if (state === 'scanning') {
      const timer = setTimeout(() => {
        if (simulateFraud) {
          setState('fraud');
          // For fraud cases, slide back up after showing the warning
          setTimeout(() => {
            setScannerVisible(false);
          }, 4000);
        } else {
          setState('scanned');
          // Hide scanner after showing success briefly for verified cases
          setTimeout(() => {
            setScannerVisible(false);
          }, 2000);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, simulateFraud]);

  // Processing simulation
  const startProcessing = () => {
    if (!simulateProcessing) return;
    setState('processing');
    setCurrentStep(0);

    steps.forEach((_, index) => {
      setTimeout(() => {
        setCurrentStep(index);
      }, index * 2000);

      setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
        if (index < steps.length - 1) {
          setCurrentStep(index + 1);
        } else {
          setTimeout(() => setState('success'), 1000);
        }
      }, (index + 1) * 2000);
    });
  };

  // Auto-focus first OTP input when OTP state is reached
  useEffect(() => {
    if (state === 'otp' && otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0].focus();
      }, 100);
    }
  }, [state]);

  // OTP handling
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        setActiveOtpIndex(index + 1);
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveOtpIndex(index - 1);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    if (state === 'processing') return;
    setState('otp');
  };

  const handleOtpSubmit = () => {
    if (otp.every(digit => digit !== '')) {
      setState('processing');
      startProcessing();
      onConfirm();
    }
  };

  const isConfirmDisabled = state === 'scanning' || state === 'processing';
  const isOtpComplete = otp.every(digit => digit !== '');

  if (state === 'otp') {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md mx-auto text-white">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-300 mb-1">{title}</h2>
          <p className={`text-3xl font-bold ${amountColor}`}>{amount}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">
            Complete your payment by entering the OTP sent to your phone
          </p>
          <p className="text-gray-500 text-xs mb-6">
            An OTP has been sent to your phone number ending in •••• 1234
          </p>

          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onFocus={() => setActiveOtpIndex(index)}
                className={`w-12 h-12 bg-gray-800 border rounded-lg text-center text-white text-xl font-medium focus:outline-none transition-colors ${activeOtpIndex === index
                  ? 'border-white'
                  : digit
                    ? 'border-gray-600'
                    : 'border-gray-700'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={handleOtpSubmit}
            disabled={!isOtpComplete}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${isOtpComplete
              ? 'bg-green-600 hover:bg-green-700 text-white'
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
    <div className="relative max-w-md mx-auto">
      {/* Main transaction card */}
      <div className={`bg-gray-900  p-6 text-white relative z-10 ${scannerVisible ? 'rounded-2xl' : 'rounded-t-2xl'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-300 mb-1">{title}</h2>
            <p className={`text-3xl font-bold ${amountColor}`}>{amount}</p>
          </div>
          {logo && (
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              {logo}
            </div>
          )}
        </div>

        {state === 'success' && (
          <div className="mb-6 p-4 bg-green-600 rounded-lg">
            <p className="text-white text-sm font-medium">
              You have successfully transferred {amount} in USDC to Mike. Total cost: 102 USDC
            </p>
          </div>
        )}

        {(state === 'processing' || state === 'success') && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-4">Transferring {amount} to MIKE...</p>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {completedSteps.includes(index) ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : currentStep === index ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border border-gray-600 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm ${completedSteps.includes(index)
                    ? 'text-green-400'
                    : currentStep === index
                      ? 'text-blue-400'
                      : 'text-gray-400'
                    }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(state === 'initial' || state === 'scanned') && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-4">This is how we will send {amount} to MIKE</p>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="mb-6 p-4 bg-red-600 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white" />
              <p className="text-white text-sm font-medium">
                Something went wrong while sending {amount} to MIKE
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        {state !== 'processing' && state !== 'success' && (
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${state === 'fraud'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : isConfirmDisabled
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              {state === 'fraud' ? 'Confirm (Unsafe)' : 'Confirm'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {state === 'processing' && (
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Scanner overlay - slides up from bottom */}
      <div className={`absolute bottom-0 left-0 right-0 transform transition-all duration-500 ease-out overflow-hidden ${scannerVisible ? 'translate-y-0' : 'translate-y-full'
        } z-0`}>
        <div className={`${state === 'fraud'
          ? 'bg-red-600'
          : state === 'scanned'
            ? 'bg-green-600'
            : 'bg-yellow-600'
          } rounded-b-2xl px-6 py-4`}>
          <div className="flex items-center gap-3">
            <Eye className={`w-5 h-5 text-white transition-opacity duration-300 ${eyeVisible ? 'opacity-100' : 'opacity-30'
              }`} />
            <span className="text-white text-sm font-medium">
              {state === 'fraud'
                ? 'Very likely to be fraud - 2 REPORTS'
                : state === 'scanned'
                  ? 'Address verified'
                  : 'Scanning address'
              }
            </span>
          </div>

          {state === 'fraud' && (
            <div className="mt-2">
              <p className="text-white text-xs">
                This text block contains some text about the kind of fraud this account was involved in
              </p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

