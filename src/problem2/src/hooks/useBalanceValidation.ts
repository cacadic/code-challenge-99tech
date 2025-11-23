import type { Coin } from "../api/coinService";

interface UseBalanceValidationProps {
  payCoin: Coin | null;
  amount: string;
}

/**
 * Custom hook to validate balance
 * - Check whether the amount exceeds the balance
 * - Return validation state
 */
export const useBalanceValidation = ({
  payCoin,
  amount,
}: UseBalanceValidationProps) => {
  const numAmount = parseFloat(amount) || 0;
  const balance = payCoin?.balance || 0;
  
  const exceedsBalance = numAmount > balance;
  const isZeroOrNegative = numAmount <= 0;
  
  return {
    isZeroOrNegative,
    isTransferDisabled: isZeroOrNegative || exceedsBalance,
  };
};
