// Define monaco editor and functionalities
let editor;
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' } });
require(['vs/editor/editor.main'], function () {
    function fontSize() {
        return window.innerWidth <= 768 ? 16 : 20;
    }

    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: localStorage.PROBLEM || `// احتمال یک آمدن تاس\r\nconst x = random(1, 6)\r\nreturn x == 1`,
        language: 'javascript',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: fontSize()
    });

    editor.onDidChangeModelContent(function () {
        localStorage.PROBLEM = editor.getValue();
    });

    $(window).on('resize', function () {
        editor.layout();
        editor.updateOptions({ fontSize: fontSize() });
    });

    $('.spinner-border').parent().remove();
});


// Define worker
let worker;
defineWorker();


// Define loop input element
const loopInputElement = $('#loop-input');
loopInputElement.val(localStorage.LOOP || '');


// Start button function
$('#btn-start').on('click', function () {
    // Check editor loaded
    if (!editor) return;

    // Get loop
    const loopValue = loopInputElement.val();
    let loop = Number(loopValue);
    if (!loop || loop < 1) {
        loopInputElement.focus();
        return;
    }
    localStorage.LOOP = loopValue;

    // Empty table & error, Toggle buttons
    $('.right-block tbody').html('');
    $('.error').text('');
    $('#btn-start').addClass('d-none');
    $('#btn-stop').removeClass('d-none');

    // Get problem
    const problem = editor.getValue();

    // Call worker
    worker.postMessage({ loop, problem });
});


// Stop button function
$('#btn-stop').on('click', function () {
    window.location.reload();
});


// tr adder function
function tableRowAdder(row) {
    $('.right-block tbody').append(`<tr>${row}</tr>`);
    const el = $('.right-block');
    const remainingSpace = el[0].scrollHeight - el.scrollTop() - el.innerHeight();
    if (remainingSpace < 70) el.scrollTop(el[0].scrollHeight);
}


// toggle buttons after process finished
function finishToggle() {
    $('#btn-start').removeClass('d-none');
    $('#btn-stop').addClass('d-none');
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
            finishToggle();
            defineWorker();
        } else if (type === 'error') {
            $('.error').text(data);
            finishToggle();
            defineWorker();
        } else {
            window.location.reload();
        }
    };
}