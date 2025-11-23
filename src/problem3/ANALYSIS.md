# Problem 3: Code Analysis and Refactoring

## Overview

This document provides a comprehensive analysis of the computational inefficiencies, anti-patterns, and bugs found in the original React component code, with detailed explanations of each issue and how to fix them.

---

## Critical Issues and Fixes

### Issue 1: Missing `blockchain` Property in Interface

**Original Code:**
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
}
```

**Problem:** The code uses `balance.blockchain` (lines 37, 46, 47) but the interface doesn't declare this property, causing TypeScript errors and potential runtime issues.

**Fix:**
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}
```

---

### Issue 2: Undefined Variable and Inverted Filter Logic

**Original Code:**
```typescript
.filter((balance: WalletBalance) => {
  const balancePriority = getPriority(balance.blockchain);
  if (lhsPriority > -99) {              // ❌ Undefined variable!
    if (balance.amount <= 0) {          // ❌ Wrong logic
      return true;
    }
  }
  return false;
})
```

**Problems:**
1. `lhsPriority` is undefined - should be `balancePriority`
2. Logic is inverted: returns `true` for amounts ≤ 0, filters out positive amounts
3. Should keep balances with valid priority AND positive amounts

**Fix:**
```typescript
.filter((balance: WalletBalance) => {
  const priority = getPriority(balance.blockchain);
  return priority > -99 && balance.amount > 0;
})
```

---

### Issue 3: Incorrect useMemo Dependencies

**Original Code:**
```typescript
}, [balances, prices]);
```

**Problem:** The `prices` dependency is included but NOT used in the filtering/sorting logic. This causes unnecessary recalculations whenever prices change, even though the filtered/sorted list doesn't depend on prices.

**Why This Matters:**
- In real-time trading apps, prices update frequently (every second)
- Each price update triggers expensive filtering and sorting operations
- This is a performance bottleneck that wastes CPU cycles

**Fix:**
```typescript
}, [balances]); // Only depends on balances
```

---

## React Fundamentals: useEffect and useMemo Dependencies

### Understanding Dependency Arrays with Objects and Arrays

**IMPORTANT: This addresses a common misconception about React hooks and object/array dependencies.**

#### The Core Principle

React uses **referential equality** (===) to compare dependencies, not deep equality. This means:

```typescript
const obj1 = { name: 'John' };
const obj2 = { name: 'John' };
console.log(obj1 === obj2); // false - different references!
```

#### Common Mistake with Objects in Dependencies

**WRONG APPROACH:**
```typescript
const MyComponent = () => {
  const config = { theme: 'dark', lang: 'en' }; // ❌ New object every render!
  
  useEffect(() => {
    applyConfig(config);
  }, [config]); // ❌ Runs on EVERY render because config is a new object each time
  
  return <div>...</div>;
};
```

**Why This is Wrong:**
- `config` is created as a new object on every render
- Even though the values are the same, it's a different object reference
- React sees it as "changed" and runs the effect every time
- This defeats the purpose of dependency arrays!

**CORRECT APPROACH 1: Memoize the Object**
```typescript
const MyComponent = () => {
  const config = useMemo(() => ({ 
    theme: 'dark', 
    lang: 'en' 
  }), []); // ✅ Same object reference across renders
  
  useEffect(() => {
    applyConfig(config);
  }, [config]); // ✅ Only runs when config actually changes
  
  return <div>...</div>;
};
```

**CORRECT APPROACH 2: Use Primitive Dependencies**
```typescript
const MyComponent = () => {
  const theme = 'dark';
  const lang = 'en';
  
  useEffect(() => {
    applyConfig({ theme, lang });
  }, [theme, lang]); // ✅ Primitives are compared by value
  
  return <div>...</div>;
};
```

**CORRECT APPROACH 3: Move Object Outside Component**
```typescript
const CONFIG = { theme: 'dark', lang: 'en' }; // ✅ Stable reference

const MyComponent = () => {
  useEffect(() => {
    applyConfig(CONFIG);
  }, [CONFIG]); // ✅ Same reference every time
  
  return <div>...</div>;
};
```

#### The Same Applies to Arrays

**WRONG:**
```typescript
const MyComponent = () => {
  const items = [1, 2, 3]; // ❌ New array every render
  
  useEffect(() => {
    processItems(items);
  }, [items]); // ❌ Runs every render
};
```

**CORRECT:**
```typescript
const MyComponent = () => {
  const items = useMemo(() => [1, 2, 3], []); // ✅ Stable reference
  
  useEffect(() => {
    processItems(items);
  }, [items]); // ✅ Only runs when items actually change
};
```

#### Real-World Example from Our Code

In the original messy code, if we had used an object in dependencies incorrectly:

**WRONG:**
```typescript
const sortedBalances = useMemo(() => {
  const filterConfig = { minPriority: -99, minAmount: 0 }; // New object
  return balances.filter(b => 
    getPriority(b.blockchain) > filterConfig.minPriority && 
    b.amount > filterConfig.minAmount
  );
}, [balances, filterConfig]); // ❌ filterConfig is undefined here anyway!
```

**CORRECT:**
```typescript
const filterConfig = useMemo(() => ({ 
  minPriority: -99, 
  minAmount: 0 
}), []); // Stable reference

const sortedBalances = useMemo(() => {
  return balances.filter(b => 
    getPriority(b.blockchain) > filterConfig.minPriority && 
    b.amount > filterConfig.minAmount
  );
}, [balances, filterConfig]); // ✅ Now it works correctly
```

Or even better, use primitives:

```typescript
const MIN_PRIORITY = -99;
const MIN_AMOUNT = 0;

const sortedBalances = useMemo(() => {
  return balances.filter(b => 
    getPriority(b.blockchain) > MIN_PRIORITY && 
    b.amount > MIN_AMOUNT
  );
}, [balances]); // ✅ No object dependencies needed
```

---

### Issue 4: Using Index as React Key

**Original Code:**
```typescript
key={index}
```

**Problem:** Using array index as key is an anti-pattern when:
- The list can be reordered (our list is sorted!)
- Items can be added/removed
- The order is dynamic

**Why This is Bad:**
- React can't track which items actually changed
- Causes unnecessary re-renders and re-mounts
- Can cause bugs with component state, focus, and animations
- Performance degradation

**Fix:**
```typescript
key={balance.currency} // Use unique identifier
```

---

### Issue 5: Missing Return Statement in Sort Comparator

**Original Code:**
```typescript
.sort((lhs, rhs) => {
  if (leftPriority > rightPriority) {
    return -1;
  } else if (rightPriority > leftPriority) {
    return 1;
  }
  // ❌ Missing return 0
})
```

**Problem:** When priorities are equal, the function returns `undefined`, leading to unstable sorting.

**Fix:**
```typescript
.sort((lhs, rhs) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  
  if (leftPriority > rightPriority) return -1;
  if (rightPriority > leftPriority) return 1;
  return 0; // ✅ Explicit return for equal case
})
```

---

### Issue 6: Function Recreated on Every Render

**Original Code:**
```typescript
const WalletPage = () => {
  const getPriority = (blockchain: any) => { ... }; // ❌ Inside component
}
```

**Problem:** 
- New function created on every render
- Wastes memory
- Makes optimization harder
- Uses `any` type (no type safety)

**Fix:**
```typescript
// ✅ Outside component - stable reference
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis': return 100;
    case 'Ethereum': return 50;
    // ...
  }
};

const WalletPage = () => {
  // Component body
};
```

---

### Issue 7: Redundant formattedBalances Variable

**Original Code:**
```typescript
const formattedBalances = sortedBalances.map((balance) => ({
  ...balance,
  formatted: balance.amount.toFixed(),
}));

// But then it's never used! The code maps over sortedBalances instead
```

**Problem:**
- Created but never used
- Wastes memory with duplicate array
- Unnecessary O(n) operation

**Fix:** Remove it entirely and calculate inline:
```typescript
const rows = useMemo(() => {
  return sortedBalances.map((balance) => (
    <WalletRow
      formattedAmount={balance.amount.toFixed()} // ✅ Calculate inline
      ...
    />
  ));
}, [sortedBalances, prices]);
```

---

### Issue 8: Missing Memoization for Rows

**Original Code:**
```typescript
const rows = sortedBalances.map(...); // ❌ Recreated every render
```

**Problem:** JSX elements are recreated on every render, even when data hasn't changed.

**Fix:**
```typescript
const rows = useMemo(() => {
  return sortedBalances.map(...);
}, [sortedBalances, prices]); // ✅ Only recreate when dependencies change
```

---

### Issue 9: Potential NaN in USD Value

**Original Code:**
```typescript
const usdValue = prices[balance.currency] * balance.amount;
```

**Problem:** If `prices[balance.currency]` is undefined, result is NaN.

**Fix:**
```typescript
const price = prices[balance.currency] ?? 0; // ✅ Default to 0
const usdValue = balance.amount * price;
```

---

### Issue 10: Unused Children Destructuring

**Original Code:**
```typescript
const { children, ...rest } = props;
```

**Problem:** `children` is destructured but never used.

**Fix:**
```typescript
const { ...rest } = props; // ✅ Remove unused variable
```

---

## Performance Impact Summary

### Before Optimization:
- Filter and sort: O(n log n) on **EVERY render**
- getPriority called: ~2n times per render
- Rows recreated on every parent re-render
- Unnecessary recalculation when prices change

### After Optimization:
- Filter and sort: O(n log n) **only when balances change**
- getPriority: Stable function reference
- Rows memoized - only recreate when data changes
- Price changes don't trigger filtering/sorting

**Result:** Significantly improved performance, especially in real-time trading scenarios where prices update frequently.

---

## Key Takeaways

1. **Always include all used dependencies** in useMemo/useEffect
2. **Don't include unused dependencies** - causes unnecessary recalculations
3. **Objects and arrays in dependencies need special handling** - use useMemo or move outside component
4. **Use unique keys** for list items, never use index for dynamic lists
5. **Move pure functions outside components** for stable references
6. **Memoize expensive computations** with useMemo
7. **Handle undefined/null values** to prevent NaN and runtime errors
8. **Type safety matters** - avoid `any`, use proper TypeScript types

---

## Conclusion

The refactored code demonstrates strong React fundamentals by:
- Correctly managing dependencies in hooks
- Understanding referential equality vs. deep equality
- Applying proper memoization strategies
- Following React best practices for performance
- Maintaining type safety throughout

These improvements result in a more performant, maintainable, and bug-free component.
