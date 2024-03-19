// Define elements
const errorElement = document.querySelector('.error');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const loopInput = document.getElementById('loop-input');
const rightBlock = document.querySelector('.right-block');
const tableBody = document.querySelector('.right-block table tbody');


// Define editor & worker
let editor;
defineEditor();
let worker;
defineWorker();


// Default loop value
loopInput.value = localStorage.getItem('LOOP') || '';
loopInput.addEventListener('input', function () {
    localStorage.setItem('LOOP', loopInput.value);
});


// Start button function
btnStart.addEventListener('click', function () {
    // Check editor loaded
    if (!editor) return;

    // Get loop
    const loop = Number(loopInput.value);
    if (!loop || loop < 1) {
        loopInput.focus();
        return;
    }

    // Empty table & error, Toggle buttons
    tableBody.innerHTML = '';
    errorElement.textContent = '';
    btnStart.classList.add('d-none');
    btnStop.classList.remove('d-none');

    // Get problem
    const problem = editor.getValue();

    // Call worker
    worker.postMessage({ loop, problem });
});


// Stop button function
btnStop.addEventListener('click', function () {
    window.location.reload();
});


// tr adder function
function tableRowAdder(row) {
    tableBody.insertAdjacentHTML('beforeend', `<tr>${row}</tr>`);
    const el = rightBlock;
    const remainingSpace = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remainingSpace < 70) el.scrollTop = el.scrollHeight;
}


// toggle buttons after process finished
function finishedToggle() {
    btnStart.classList.remove('d-none');
    btnStop.classList.add('d-none');
}


// Function to define worker
function defineWorker() {
    if (worker) worker.terminate(); // Terminate the existing worker
    worker = new Worker('script/worker.js'); // Create a new worker
    worker.onmessage = function (event) {
        const [type, data] = event.data;
        if (type === 'result') {
            const { result, attempt } = data;
            tableRowAdder(`
                <td class="text-center">${result}</td>
                <td class="text-center">${attempt}</td>
            `);
        } else if (type === 'finish') {
            const { result, time } = data;
            tableRowAdder(`<td colspan="2" class="text-center finish">${result}</td>`);
            tableRowAdder(`<td colspan="2" class="text-center finish">${time}</td>`);
            finishedToggle();
            defineWorker();
        } else if (type === 'error') {
            errorElement.textContent = data;
            finishedToggle();
            defineWorker();
        } else {
            window.location.reload();
        }
    };
}