import { useState, useEffect } from "react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  theme?: "dark" | "light";
}

/**
 * TransferModal component - Modal to enter OTP before transfer
 */
export const TransferModal = ({
  isOpen,
  onClose,
  onConfirm,
  theme = "dark",
}: TransferModalProps) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      const firstInput = document.getElementById("otp-0");
      setTimeout(() => firstInput?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    const newValue = value.slice(-1);
    newOtp[index] = newValue;

    setOtp(newOtp);

    if (newValue && index < 6) {
      setActiveIndex(index + 1);
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = ["", "", "", "", "", "", ""];

    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }

    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 6);
    setActiveIndex(focusIndex);

    const targetInput = document.getElementById(`otp-${focusIndex}`);
    targetInput?.focus();
  };

  const handleSubmit = async () => {
    const otpString = otp.slice(0, 6).join("");

    if (otpString.length !== 6 || !/^\d+$/.test(otpString)) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (otpString === "123456") {
      setSuccess(true);
      setIsSubmitting(false);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      onConfirm();
      onClose();

      setOtp(["", "", "", "", "", "", ""]);
      setActiveIndex(0);
      setSuccess(false);
    } else {
      setIsSubmitting(false);
      setShowError(true);

      setTimeout(() => {
        setOtp(["", "", "", "", "", "", ""]);
        setActiveIndex(0);
        setShowError(false);

        setTimeout(() => {
          const firstInput = document.getElementById("otp-0");
          firstInput?.focus();
        }, 100);
      }, 2000);
    }
  };

  const handleClose = () => {
    setOtp(["", "", "", "", "", "", ""]);
    setActiveIndex(0);
    setSuccess(false);
    setShowError(false);
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
        <div
          className={`border rounded-xl p-4 sm:p-6 shadow-2xl w-full max-w-[420px] transition-all ${
            showError ? "shake" : ""
          } ${
            isDark ? "bg-[#1C1E2B] border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#50DA63] rounded-full flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2
                className={`font-bold text-lg sm:text-xl ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Confirm Transfer
              </h2>
            </div>
            <button
              onClick={handleClose}
              className={`text-2xl hover:scale-110 transition-all cursor-pointer ${
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className={`block font-medium text-sm mb-3 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Enter OTP (6 digits)
              </label>
              <div
                className="flex gap-1.5 sm:gap-2 justify-center relative"
                onPaste={handlePaste}
              >
                {otp.slice(0, 6).map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={() => setActiveIndex(index)}
                    disabled={isSubmitting}
                    autoFocus={index === 0}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border-2 transition-all ${
                      showError
                        ? isDark
                          ? "border-red-500 bg-red-500/10 text-white"
                          : "border-red-500 bg-red-500/10 text-gray-900"
                        : success
                        ? isDark
                          ? "border-[#50DA63] bg-[#50DA63]/10 text-white"
                          : "border-[#50DA63] bg-[#50DA63]/10 text-gray-900"
                        : index === activeIndex
                        ? "border-[#50DA63]"
                        : isDark
                        ? "bg-[#252a42] border-gray-600 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-900"
                    } focus:outline-none cursor-text`}
                  />
                ))}

                <input
                  id="otp-6"
                  type="text"
                  inputMode="numeric"
                  pattern="\d"
                  maxLength={1}
                  value={otp[6]}
                  onChange={(e) => handleOtpChange(6, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 6)}
                  onFocus={() => setActiveIndex(6)}
                  disabled={isSubmitting}
                  className="absolute opacity-0 w-0 h-0 -z-10"
                  tabIndex={-1}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting || success || otp.slice(0, 6).join("").length !== 6
              }
              className={`w-full py-3 rounded-lg font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-2 ${
                success
                  ? "bg-[#50DA63] text-white"
                  : isSubmitting || otp.slice(0, 6).join("").length !== 6
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                  : "bg-[#50DA63] text-gray-900 hover:bg-[#5eec72] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(80,218,99,0.5)] cursor-pointer"
              }`}
            >
              {success ? (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Transfer Successful!
                </>
              ) : isSubmitting ? (
                "Processing..."
              ) : (
                "Confirm Transfer"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
