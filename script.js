const algorithmSelect = document.getElementById('algorithm');
const sortButton = document.getElementById('sortButton');
const arraySizeInput = document.getElementById('arraySize');
const sortSpeedInput = document.getElementById('sortSpeed');
let isSorting = false;
let array = [];
let originalArray = [];

let performanceMetrics = {
    comparisons: 0,
    swaps: 0,
    startTime: 0
};

// Color Constants
const colors = {
    DEFAULT: '#48cae4',
    COMPARING: '#ff6b6b',
    SWAPPING: '#ffe66d',
    PIVOT: '#9b59b6',
    SORTED: '#4ecdc4'
};

// Event Listeners
arraySizeInput.addEventListener('input', generateArray);
algorithmSelect.addEventListener('change', updateComplexity);
generateArray();

// Array Generation
function generateArray() {
    if(isSorting) return;
    const size = parseInt(arraySizeInput.value) || 10;
    array = Array.from({length: size}, () => Math.floor(Math.random() * 95) + 5);
    originalArray = [...array]; // Store copy

    performanceMetrics = {
        comparisons: 0,
        swaps: 0,
        startTime: 0
    };
    document.getElementById('comparisonMetric').textContent = performanceMetrics.comparisons;
    document.getElementById('swapMetric').textContent = performanceMetrics.swaps;
    document.getElementById('timeMetric').textContent = '0ms';
    document.getElementById('speedMetric').textContent = '0 ops/ms';

    renderBars();
    document.getElementById('resetButton').disabled = false;
}

// Reset to Original
function resetToOriginal() {
    if(isSorting || !originalArray.length) return;
    array = [...originalArray];

    performanceMetrics = {
        comparisons: 0,
        swaps: 0,
        startTime: 0
    };
    document.getElementById('comparisonMetric').textContent = performanceMetrics.comparisons;
    document.getElementById('swapMetric').textContent = performanceMetrics.swaps;
    document.getElementById('timeMetric').textContent = '0ms';
    document.getElementById('speedMetric').textContent = '0 ops/ms';

    renderBars();
}

// Render Bars
function renderBars() {
    const container = document.getElementById('barContainer');
    container.innerHTML = '';
    
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value}%`;
        bar.style.backgroundColor = colors.DEFAULT;
        
        const number = document.createElement('div');
        number.className = 'bar-number';
        number.textContent = value;
        
        bar.appendChild(number);
        container.appendChild(bar);
    });
}

// Helper Functions
async function swap(elements, i, j) {
    elements[i].style.backgroundColor = colors.SWAPPING;
    elements[j].style.backgroundColor = colors.SWAPPING;
    await delay();
    playSwapSound();
    
    [array[i], array[j]] = [array[j], array[i]];
    
    const tempHeight = elements[i].style.height;
    elements[i].style.height = elements[j].style.height;
    elements[j].style.height = tempHeight;
    
    const tempNumber = elements[i].querySelector('.bar-number').textContent;
    elements[i].querySelector('.bar-number').textContent = elements[j].querySelector('.bar-number').textContent;
    elements[j].querySelector('.bar-number').textContent = tempNumber;
    
    await delay();
    elements[i].style.backgroundColor = colors.DEFAULT;
    elements[j].style.backgroundColor = colors.DEFAULT;

    performanceMetrics.swaps++;
    document.getElementById('swapMetric').textContent = performanceMetrics.swaps;
    updateRealTimeMetrics();
}

async function compareElements(...elements) {
    elements.forEach(e => e.style.backgroundColor = colors.COMPARING);
    await delay();
    playCompareSound();

    performanceMetrics.comparisons++;
    document.getElementById('comparisonMetric').textContent = performanceMetrics.comparisons;
    updateRealTimeMetrics();
}

function resetColors(...elements) {
    elements.forEach(e => e.style.backgroundColor = colors.DEFAULT);
}

function markSorted(...elements) {
    elements.forEach(e => e.style.backgroundColor = colors.SORTED);
}

function markPivot(element) {
    element.style.backgroundColor = colors.PIVOT;
}

function delay() {
    return new Promise(resolve => setTimeout(resolve, 200 - sortSpeedInput.value * 1.8));
}

function updateRealTimeMetrics() {
    if (isSorting && performanceMetrics.startTime > 0) {
        const currentTime = performance.now();
        const elapsed = currentTime - performanceMetrics.startTime;
        document.getElementById('timeMetric').textContent = `${Math.round(elapsed)}ms`;
    }
}

// Sorting Algorithms
async function bubbleSort() {
    const elements = document.querySelectorAll('.bar');
    for(let i = 0; i < array.length; i++) {
        for(let j = 0; j < array.length - i - 1; j++) {
            if(!isSorting) return;
            
            await compareElements(elements[j], elements[j+1]);
            if(array[j] > array[j+1]) {
                await swap(elements, j, j+1);
            }
            resetColors(elements[j], elements[j+1]);
        }
        markSorted(elements[array.length - 1 - i]);
    }
}

async function selectionSort() {
    const elements = document.querySelectorAll('.bar');
    for(let i = 0; i < array.length; i++) {
        let minIdx = i;
        markPivot(elements[minIdx]);
        
        for(let j = i + 1; j < array.length; j++) {
            if(!isSorting) return;
            
            await compareElements(elements[j], elements[minIdx]);
            if(array[j] < array[minIdx]) {
                resetColors(elements[minIdx]);
                minIdx = j;
                markPivot(elements[minIdx]);
            }
            resetColors(elements[j]);
        }
        
        if(minIdx !== i) await swap(elements, i, minIdx);
        markSorted(elements[i]);
    }
}

// async function insertionSort() {
//     const elements = document.querySelectorAll('.bar');
//     elements[0].style.backgroundColor = colors.SORTED;
    
//     for(let i = 1; i < array.length; i++) {
//         if(!isSorting) return;
        
//         const current = array[i];
//         let j = i - 1;
        
//         elements[i].style.backgroundColor = colors.COMPARING;
//         await delay();

//         while(j >= 0 && array[j] > current) {
//             if(!isSorting) return;

//             await compareElements(elements[j], elements[j+1]);
            
//             array[j + 1] = array[j];
//             elements[j + 1].style.height = `${array[j]}%`;
//             elements[j + 1].querySelector('.bar-number').textContent = array[j];
            
//             elements[j].style.backgroundColor = colors.SWAPPING;
//             elements[j + 1].style.backgroundColor = colors.SORTED;
//             await delay();
            
//             resetColors(elements[j]);
//             performanceMetrics.swaps++;
//             document.getElementById('swapMetric').textContent = performanceMetrics.swaps;
//             j--;
//         }
        
//         array[j + 1] = current;
//         elements[j + 1].style.height = `${current}%`;
//         elements[j + 1].querySelector('.bar-number').textContent = current;
//         markSorted(elements[j + 1]);
//         updateRealTimeMetrics();
//     }
// }

// async function insertionSort() {
//     const elements = document.querySelectorAll('.bar');
//     elements[0].style.backgroundColor = colors.SORTED;
    
//     for(let i = 1; i < array.length; i++) {
//         if(!isSorting) return;
        
//         const current = array[i];
//         let j = i - 1;
        
//         elements[i].style.backgroundColor = colors.COMPARING;
//         await delay();

//         while(j >= 0) {
//             if(!isSorting) return;

//             // Count every comparison, even if no swap occurs
//             await compareElements(elements[j], elements[j+1]);
            
//             if(array[j] > current) {
//                 array[j + 1] = array[j];
//                 elements[j + 1].style.height = `${array[j]}%`;
//                 elements[j + 1].querySelector('.bar-number').textContent = array[j];
                
//                 elements[j].style.backgroundColor = colors.SWAPPING;
//                 elements[j + 1].style.backgroundColor = colors.SORTED;
//                 await delay();
                
//                 resetColors(elements[j]);
//                 performanceMetrics.swaps++; // Increment swaps only for shifts
//                 document.getElementById('swapMetric').textContent = performanceMetrics.swaps;
//                 j--;
//             } else {
//                 break; // Exit loop if no swap needed
//             }
//         }
        
//         array[j + 1] = current;
//         elements[j + 1].style.height = `${current}%`;
//         elements[j + 1].querySelector('.bar-number').textContent = current;
//         markSorted(elements[j + 1]);
//         updateRealTimeMetrics();
//     }
// }

async function insertionSort() {
    const elements = document.querySelectorAll('.bar');
    elements[0].style.backgroundColor = colors.SORTED; // First element is sorted
    
    for(let i = 1; i < array.length; i++) {
        if(!isSorting) return;
        
        const current = array[i];
        let j = i - 1;
        
        elements[i].style.backgroundColor = colors.COMPARING; // Highlight current element
        await delay();

        while(j >= 0) {
            if(!isSorting) return;

            // Compare current element with previous
            await compareElements(elements[j], elements[i]);
            
            if(array[j] > current) {
                // Shift larger element right
                array[j + 1] = array[j];
                elements[j + 1].style.height = `${array[j]}%`;
                elements[j + 1].querySelector('.bar-number').textContent = array[j];
                
                elements[j].style.backgroundColor = colors.SWAPPING; // Highlight shift
                elements[j + 1].style.backgroundColor = colors.SWAPPING;
                await delay();
                
                resetColors(elements[j], elements[j + 1]); // Reset both to DEFAULT after shift
                performanceMetrics.swaps++;
                document.getElementById('swapMetric').textContent = performanceMetrics.swaps;
                j--;
            } else {
                resetColors(elements[i]); // Reset current element if no shift
                break;
            }
        }
        
        // Place current element in its final position
        array[j + 1] = current;
        elements[j + 1].style.height = `${current}%`;
        elements[j + 1].querySelector('.bar-number').textContent = current;
        
        // Mark all elements up to i as sorted
        for(let k = 0; k <= i; k++) {
            elements[k].style.backgroundColor = colors.SORTED;
        }
        updateRealTimeMetrics();
    }
}

async function mergeSort() {
    const elements = document.querySelectorAll('.bar');
    await mergeSortHelper(0, array.length - 1, elements);
    markSorted(...elements);
}

async function mergeSortHelper(low, high, elements) {
    if(low >= high) return;
    
    const mid = Math.floor((low + high) / 2);
    await mergeSortHelper(low, mid, elements);
    await mergeSortHelper(mid + 1, high, elements);
    await merge(low, mid, high, elements);
}

async function merge(low, mid, high, elements) {
    const left = array.slice(low, mid + 1);
    const right = array.slice(mid + 1, high + 1);
    let i = 0, j = 0, k = low;

    while(i < left.length && j < right.length) {
        if(!isSorting) return;
        
        await compareElements(elements[low + i], elements[mid + 1 + j]);
        
        if(left[i] <= right[j]) {
            array[k] = left[i];
            updateBar(k, left[i], elements);
            i++;
        } else {
            array[k] = right[j];
            updateBar(k, right[j], elements);
            j++;
        }
        k++;
        await delay();
        updateRealTimeMetrics();
    }

    while(i < left.length) {
        array[k] = left[i];
        updateBar(k, left[i], elements);
        i++;
        k++;
        await delay();
        updateRealTimeMetrics();
    }

    while(j < right.length) {
        array[k] = right[j];
        updateBar(k, right[j], elements);
        j++;
        k++;
        await delay();
        updateRealTimeMetrics();
    }
}

function updateBar(index, value, elements) {
    elements[index].style.height = `${value}%`;
    elements[index].querySelector('.bar-number').textContent = value;
    markSorted(elements[index]);
}

async function quickSort() {
    const elements = document.querySelectorAll('.bar');
    await quickSortHelper(0, array.length - 1, elements);
    if(isSorting) {
        elements.forEach(bar => bar.style.backgroundColor = colors.SORTED);
    }
}

async function quickSortHelper(low, high, elements) {
    if(low < high) {
        const pi = await partition(low, high, elements);
        await quickSortHelper(low, pi - 1, elements);
        await quickSortHelper(pi + 1, high, elements);
    }
}

async function partition(low, high, elements) {
    const pivot = array[high];
    
    elements[high].style.backgroundColor = colors.PIVOT;
    await delay();
    let i = low - 1;
    
    for(let j = low; j < high; j++) {
        if(!isSorting) return;
        
        elements[j].style.backgroundColor = colors.COMPARING;
        elements[high].style.backgroundColor = colors.PIVOT;
        
        await compareElements(elements[j], elements[high]);
        
        if(array[j] < pivot) {
            i++;
            await swap(elements, i, j);
        }
        
        elements[j].style.backgroundColor = colors.DEFAULT;
        updateRealTimeMetrics();
    }
    
    await swap(elements, i + 1, high);
    elements[i + 1].style.backgroundColor = colors.SORTED;
    updateRealTimeMetrics();
    return i + 1;
}

async function heapSort() {
    const elements = document.querySelectorAll('.bar');
    const n = array.length;

    for(let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i, elements);
    }

    for(let i = n - 1; i > 0; i--) {
        await swap(elements, 0, i);
        markSorted(elements[i]);
        await heapify(i, 0, elements);
    }
    markSorted(elements[0]);
}

async function heapify(n, i, elements) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if(left < n) {
        await compareElements(elements[left], elements[largest]);
        if(array[left] > array[largest]) largest = left;
    }

    if(right < n) {
        await compareElements(elements[right], elements[largest]);
        if(array[right] > array[largest]) largest = right;
    }

    if(largest !== i) {
        await swap(elements, i, largest);
        await heapify(n, largest, elements);
    }
    updateRealTimeMetrics();
}

// Control Functions
async function startSorting() {
    performanceMetrics = {
        comparisons: 0,
        swaps: 0,
        startTime: performance.now()
    };
    document.getElementById('comparisonMetric').textContent = performanceMetrics.comparisons;
    document.getElementById('swapMetric').textContent = performanceMetrics.swaps;
    document.getElementById('timeMetric').textContent = '0ms';
    document.getElementById('speedMetric').textContent = '0 ops/ms';

    if(isSorting) return;
    
    isSorting = true;
    sortButton.disabled = true;
    arraySizeInput.disabled = true;
    
    try {
        const algorithm = algorithmSelect.value;
        switch(algorithm) {
            case 'bubbleSort': await bubbleSort(); break;
            case 'selectionSort': await selectionSort(); break;
            case 'insertionSort': await insertionSort(); break;
            case 'mergeSort': await mergeSort(); break;
            case 'quickSort': await quickSort(); break;
            case 'heapSort': await heapSort(); break;
        }
    } finally {
        isSorting = false;
        sortButton.disabled = false;
        arraySizeInput.disabled = false;
        document.getElementById('resetButton').disabled = false;
        playCompleteSound();

        const duration = performance.now() - performanceMetrics.startTime;
        document.getElementById('timeMetric').textContent = `${Math.round(duration)}ms`;
        const totalOperations = performanceMetrics.comparisons + performanceMetrics.swaps;
        const speed = totalOperations / (duration > 0 ? duration : 1); // Operations per millisecond
        console.log(`Speed Calculation: totalOperations=${totalOperations}, duration=${duration}, speed=${speed}`);
        document.getElementById('speedMetric').textContent = `${Math.round(speed * 1000)} ops/s`; // Convert to ops/second for readability
    }
}

// Time Complexity Display
function updateComplexity() {
    const complexities = {
        bubbleSort: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
        selectionSort: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' },
        insertionSort: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
        mergeSort: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
        quickSort: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
        heapSort: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' }
    };
    
    const algo = algorithmSelect.value;
    document.getElementById('best').textContent = complexities[algo].best;
    document.getElementById('average').textContent = complexities[algo].avg;
    document.getElementById('worst').textContent = complexities[algo].worst;
}

updateComplexity();

// Code Snippets
const codeSnippets = {
    bubbleSort: `
<span class="keyword">function</span> <span class="function">bubbleSort</span>() {
    <span class="keyword">for</span> (<span class="keyword">let</span> i = <span class="number">0</span><span class="punctuation">;</span> i < arr<span class="punctuation">.</span>length<span class="punctuation">;</span> i++<span class="punctuation">)</span> {
        <span class="keyword">for</span> (<span class="keyword">let</span> j = <span class="number">0</span><span class="punctuation">;</span> j < arr<span class="punctuation">.</span>length - i - <span class="number">1</span><span class="punctuation">;</span> j++<span class="punctuation">)</span> {
            <span class="keyword">if</span> (arr[j] > arr[j+<span class="number">1</span>]) {
                <span class="function">swap</span>(j<span class="punctuation">,</span> j+<span class="number">1</span>)<span class="punctuation">;</span>
            }
        }
    }
}`,

    selectionSort: `
<span class="keyword">function</span> <span class="function">selectionSort</span>() {
    <span class="keyword">for</span> (<span class="keyword">let</span> i = <span class="number">0</span><span class="punctuation">;</span> i < arr<span class="punctuation">.</span>length<span class="punctuation">;</span> i++<span class="punctuation">)</span> {
        <span class="keyword">let</span> min = i<span class="punctuation">;</span>
        <span class="keyword">for</span> (<span class="keyword">let</span> j = i+<span class="number">1</span><span class="punctuation">;</span> j < arr<span class="punctuation">.</span>length<span class="punctuation">;</span> j++<span class="punctuation">)</span> {
            <span class="keyword">if</span> (arr[j] < arr[min]) min = j<span class="punctuation">;</span>
        }
        <span class="keyword">if</span> (min != i) <span class="function">swap</span>(i<span class="punctuation">,</span> min)<span class="punctuation">;</span>
    }
}`,

    insertionSort: `
<span class="keyword">function</span> <span class="function">insertionSort</span>() {
    <span class="keyword">for</span> (<span class="keyword">let</span> i = <span class="number">1</span><span class="punctuation">;</span> i < arr<span class="punctuation">.</span>length<span class="punctuation">;</span> i++<span class="punctuation">)</span> {
        <span class="keyword">let</span> current = arr[i]<span class="punctuation">;</span>
        <span class="keyword">let</span> j = i - <span class="number">1</span><span class="punctuation">;</span>
        <span class="keyword">while</span> (j >= <span class="number">0</span> && arr[j] > current) {
            arr[j+<span class="number">1</span>] = arr[j]<span class="punctuation">;</span>
            j--<span class="punctuation">;</span>
        }
        arr[j+<span class="number">1</span>] = current<span class="punctuation">;</span>
    }
}`,

    mergeSort: `
<span class="keyword">function</span> <span class="function">mergeSort</span>(arr) {
    <span class="keyword">if</span> (arr<span class="punctuation">.</span>length <= <span class="number">1</span>) return arr<span class="punctuation">;</span>
    
    <span class="keyword">const</span> mid = Math<span class="punctuation">.</span><span class="function">floor</span>(arr<span class="punctuation">.</span>length / <span class="number">2</span>)<span class="punctuation">;</span>
    <span class="keyword">const</span> left = <span class="function">mergeSort</span>(arr<span class="punctuation">.</span><span class="function">slice</span>(<span class="number">0</span><span class="punctuation">,</span> mid))<span class="punctuation">;</span>
    <span class="keyword">const</span> right = <span class="function">mergeSort</span>(arr<span class="punctuation">.</span><span class="function">slice</span>(mid))<span class="punctuation">;</span>
    
    return <span class="function">merge</span>(left<span class="punctuation">,</span> right)<span class="punctuation">;</span>
}`,

    quickSort: `
<span class="keyword">function</span> <span class="function">quickSort</span>(low<span class="punctuation">,</span> high) {
    <span class="keyword">if</span> (low < high) {
        <span class="keyword">const</span> pi = <span class="function">partition</span>(low<span class="punctuation">,</span> high)<span class="punctuation">;</span>
        <span class="function">quickSort</span>(low<span class="punctuation">,</span> pi - <span class="number">1</span>)<span class="punctuation">;</span>
        <span class="function">quickSort</span>(pi + <span class="number">1</span><span class="punctuation">,</span> high)<span class="punctuation">;</span>
    }
}

<span class="keyword">function</span> <span class="function">partition</span>(low<span class="punctuation">,</span> high) {
    <span class="keyword">const</span> pivot = arr[high]<span class="punctuation">;</span>
    <span class="keyword">let</span> i = low - <span class="number">1</span><span class="punctuation">;</span>
    
    <span class="keyword">for</span> (<span class="keyword">let</span> j = low<span class="punctuation">;</span> j < high<span class="punctuation">;</span> j++<span class="punctuation">)</span> {
        <span class="keyword">if</span> (arr[j] < pivot) {
            i++<span class="punctuation">;</span>
            <span class="function">swap</span>(i<span class="punctuation">,</span> j)<span class="punctuation">;</span>
        }
    }
    <span class="function">swap</span>(i+<span class="number">1</span><span class="punctuation">,</span> high)<span class="punctuation">;</span>
    return i + <span class="number">1</span><span class="punctuation">;</span>
}`,

    heapSort: `
<span class="keyword">function</span> <span class="function">heapSort</span>() {
    <span class="keyword">for</span> (<span class="keyword">let</span> i = Math<span class="punctuation">.</span><span class="function">floor</span>(arr<span class="punctuation">.</span>length/<span class="number">2</span>)-<span class="number">1</span><span class="punctuation">;</span> i >= <span class="number">0</span><span class="punctuation">;</span> i--<span class="punctuation">)</span> {
        <span class="function">heapify</span>(arr<span class="punctuation">.</span>length<span class="punctuation">,</span> i)<span class="punctuation">;</span>
    }
    
    <span class="keyword">for</span> (<span class="keyword">let</span> i = arr<span class="punctuation">.</span>length-<span class="number">1</span><span class="punctuation">;</span> i > <span class="number">0</span><span class="punctuation">;</span> i--<span class="punctuation">)</span> {
        <span class="function">swap</span>(<span class="number">0</span><span class="punctuation">,</span> i)<span class="punctuation">;</span>
        <span class="function">heapify</span>(i<span class="punctuation">,</span> <span class="number">0</span>)<span class="punctuation">;</span>
    }
}

<span class="keyword">function</span> <span class="function">heapify</span>(n<span class="punctuation">,</span> i) {
    <span class="keyword">let</span> largest = i<span class="punctuation">;</span>
    <span class="keyword">const</span> left = <span class="number">2</span>*i + <span class="number">1</span><span class="punctuation">;</span>
    <span class="keyword">const</span> right = <span class="number">2</span>*i + <span class="number">2</span><span class="punctuation">;</span>
    
    <span class="keyword">if</span> (left < n && arr[left] > arr[largest]) {
        largest = left<span class="punctuation">;</span>
    }
    <span class="keyword">if</span> (right < n && arr[right] > arr[largest]) {
        largest = right<span class="punctuation">;</span>
    }
    <span class="keyword">if</span> (largest != i) {
        <span class="function">swap</span>(i<span class="punctuation">,</span> largest)<span class="punctuation">;</span>
        <span class="function">heapify</span>(n<span class="punctuation">,</span> largest)<span class="punctuation">;</span>
    }
}`
};

// Add this event listener
algorithmSelect.addEventListener('change', () => {
    const selectedAlgo = algorithmSelect.value;
    document.getElementById('algorithmCode').innerHTML = codeSnippets[selectedAlgo];
});

// Initialize code display
updateComplexity();
document.getElementById('algorithmCode').innerHTML = codeSnippets.bubbleSort;

// Audio Functions
let audioEnabled = false;
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSwapSound() {
    if (!audioEnabled) return;
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 784; // G5 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playCompareSound() {
    if (!audioEnabled) return;
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 523; // C5 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playCompleteSound() {
    if (!audioEnabled) return;
    initAudio();
    
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioContext.destination);
    
    osc1.frequency.value = 1046; // C6
    osc2.frequency.value = 1318; // E6
    gain.gain.value = 0.1;
    
    osc1.start();
    osc2.start();
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    osc1.stop(audioContext.currentTime + 1);
    osc2.stop(audioContext.currentTime + 1);
}

function toggleSound() {
    audioEnabled = !audioEnabled;
    document.getElementById('soundToggle').textContent = audioEnabled ? "🔊" : "🔇";
}

// Footer visibility based on cursor position
document.addEventListener('mousemove', (event) => {
    const footer = document.getElementById('dynamic-footer');
    const windowHeight = window.innerHeight;
    const cursorY = event.clientY;
    const triggerZone = 50; // Distance from bottom to trigger footer (in pixels)

    if (cursorY > windowHeight - triggerZone) {
        footer.classList.add('visible');
    } else {
        footer.classList.remove('visible');
    }
});