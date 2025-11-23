// REFACTORED AND OPTIMIZED CODE
// This file contains the corrected, optimized version with best practices

import React, { useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // FIXED: Added missing property
}

interface Props extends BoxProps {}

// OPTIMIZATION 1: Move getPriority outside component to prevent recreation on every render
// This is a pure function that doesn't depend on component state
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
      return 20;
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = (props: Props) => {
  // FIXED: Removed unused 'children' destructuring
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // OPTIMIZATION 2: Memoize filtered and sorted balances
  // FIXED: Corrected dependencies - removed 'prices' as it's not used in filtering/sorting
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // FIXED: Corrected logic - keep balances with valid priority AND positive amount
        // Original had undefined 'lhsPriority' and inverted logic
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        // FIXED: Added explicit return 0 for equal priorities
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        return 0; // Stable sort for equal priorities
      });
  }, [balances]); // FIXED: Only depends on balances, not prices

  // OPTIMIZATION 3: Memoize rows generation to prevent unnecessary re-renders
  // This ensures rows are only recreated when balances or prices actually change
  const rows = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      // FIXED: Handle undefined prices to prevent NaN
      const price = prices[balance.currency] ?? 0;
      const usdValue = balance.amount * price;
      
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency} // FIXED: Use unique key instead of index
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.amount.toFixed()} // FIXED: Calculate inline, removed redundant formattedBalances
        />
      );
    });
  }, [sortedBalances, prices]); // Correct dependencies: both sortedBalances and prices

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
