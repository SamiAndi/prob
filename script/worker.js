// Core functions
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSelect(arr, k) {
    const shuffledArray = shuffleArray([...arr]);
    return shuffledArray.slice(0, k);
}

function factorial(num) {
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    return result;
}

function combinations(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function permutations(n, k) {
    return factorial(n) / factorial(n - k);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function randomBoolean() {
    return Math.random() < 0.5;
}

function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    let i = 5;
    while (i * i <= num) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
        i += 6;
    }
    return true;
}

function mean(arr) {
    return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}

function median(arr) {
    const sortedArr = sorted(arr);
    const mid = Math.floor(sortedArr.length / 2);
    return sortedArr.length % 2 !== 0 ? sortedArr[mid] : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

function sorted(arr) {
    return arr.slice().sort((a, b) => a - b);
}


// Worker config
self.addEventListener('message', function(event) {
    const { loop, problem } = event.data;
    let wrappedProblem;
    try {
        wrappedProblem = new Function(problem);
        !!wrappedProblem();
    } catch (err) {
        self.postMessage(['error', 'Error: ' + err.message]);
        wrappedProblem = undefined;
    }
    if (wrappedProblem) {
        const sTime = Date.now();
        let trues = 0;
        for (let i = 1; i <= 100; i++) {
            for (let j = 1; j <= loop; j++) trues += !!wrappedProblem();
            self.postMessage(['result', {
                result: (trues / loop / i * 100).toFixed(5) + '%',
                attempt: i
            }]);
        }
        self.postMessage(['finish', {
            result: `~ ${(trues / loop).toFixed(2)}%`,
            time: (Date.now() - sTime) / 1e3 + 's'
        }]);
    }
});