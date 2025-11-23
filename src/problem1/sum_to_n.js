/**
 * Problem 1: Three Ways to Sum to N
 * 
 * Task: Provide 3 unique implementations to calculate the sum from 1 to n
 * Input: n - any integer
 * Output: summation to n (e.g., sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15)
 */

/**
 * Method A: Iterative Approach using a while loop
 * 
 * TIME COMPLEXITY: O(n)
 * - We iterate through n numbers exactly once
 * - Each iteration performs constant time operations (addition, increment)
 * - Total operations: n iterations × O(1) = O(n)
 * 
 * SPACE COMPLEXITY: O(1)
 * - Only uses a fixed amount of extra space (variables: sum, counter)
 * - Space usage doesn't grow with input size
 * - No recursive calls or data structures that scale with n
 * 
 * This approach is straightforward and memory-efficient, but slower than the formula approach.
 */
var sum_to_n_a = function(n) {
    let sum = 0;
    let counter = 1;
    
    while (counter <= n) {
        sum += counter;
        counter++;
    }
    
    return sum;
};

/**
 * Method B: Mathematical Formula (Gauss's Formula)
 * 
 * TIME COMPLEXITY: O(1)
 * - Uses the arithmetic series formula: sum = n × (n + 1) / 2
 * - Performs only 3 arithmetic operations regardless of n
 * - No loops or recursion needed
 * - This is the MOST EFFICIENT approach
 * 
 * SPACE COMPLEXITY: O(1)
 * - Uses no extra space beyond the input
 * - Only performs direct calculation
 * 
 * Mathematical proof:
 * Sum = 1 + 2 + 3 + ... + n
 * If we write it forward and backward:
 *   S = 1 + 2 + 3 + ... + n
 *   S = n + (n-1) + (n-2) + ... + 1
 * Adding both: 2S = (n+1) + (n+1) + ... + (n+1) [n times]
 * Therefore: 2S = n(n+1), so S = n(n+1)/2
 * 
 * This is the optimal solution for this problem.
 */
var sum_to_n_b = function(n) {
    return (n * (n + 1)) / 2;
};

/**
 * Method C: Recursive Approach
 * 
 * TIME COMPLEXITY: O(n)
 * - Makes n recursive calls (one for each number from n down to 0)
 * - Each call performs constant time work (addition, comparison)
 * - Total: n calls × O(1) = O(n)
 * 
 * SPACE COMPLEXITY: O(n)
 * - Each recursive call adds a frame to the call stack
 * - Maximum call stack depth is n (when we reach the base case at 0)
 * - This is WORSE than the iterative approach due to stack overhead
 * - Risk of stack overflow for very large n values
 * 
 * Note: This approach is elegant but less efficient than both iterative
 * and formula approaches due to:
 * 1. Function call overhead
 * 2. Stack space usage
 * 3. Potential stack overflow for large inputs
 * 
 * In production, prefer Method B (formula) for best performance.
 */
var sum_to_n_c = function(n) {
    // Base case: sum of 0 is 0
    if (n <= 0) {
        return 0;
    }
    
    // Recursive case: n + sum of all numbers before n
    return n + sum_to_n_c(n - 1);
};

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
}

// Test cases to verify correctness
console.log("Testing sum_to_n implementations:");
console.log("sum_to_n_a(5) =", sum_to_n_a(5), "// Expected: 15");
console.log("sum_to_n_b(5) =", sum_to_n_b(5), "// Expected: 15");
console.log("sum_to_n_c(5) =", sum_to_n_c(5), "// Expected: 15");
console.log("\nsum_to_n_a(100) =", sum_to_n_a(100), "// Expected: 5050");
console.log("sum_to_n_b(100) =", sum_to_n_b(100), "// Expected: 5050");
console.log("sum_to_n_c(100) =", sum_to_n_c(100), "// Expected: 5050");
