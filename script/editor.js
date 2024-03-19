function defineEditor() {
    const editorContainer = document.getElementById('editor-container');
    const defaultValue = localStorage.getItem('PROBLEM') || `// احتمال یک آمدن تاس\r\nconst x = random(1, 6)\r\nreturn x == 1`;


    function finalConfig() {
        window.addEventListener('resize', function () {
            editor.layout();
        });

        const spinner = document.querySelector('.spinner-border');
        spinner?.parentNode?.remove();
    }


    if (!(/Mobi|Android/i.test(navigator.userAgent))) {
        loadMonacoEditor();
    } else {
        loadCodeMirrorEditor();
    }


    // Load Monaco Editor
    function loadMonacoEditor() {
        loadFile('https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs/editor/editor.main.min.css');
        loadFile('https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs/loader.js', function () {
            initMonacoEditor();
        });
    }


    // Load CodeMirror editor
    function loadCodeMirrorEditor() {
        loadFile('https://codemirror.net/6/codemirror.js', function () {
            initCodeMirrorEditor();
        });
    }


    // Init Monaco editor
    function initMonacoEditor() {
        require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(editorContainer, {
                value: defaultValue,
                language: 'javascript',
                theme: 'vs-dark',
                minimap: { enabled: false },
                fontSize: 20
            });

            editor.onDidChangeModelContent(function () {
                localStorage.setItem('PROBLEM', editor.getValue());
            });

            finalConfig();
        });
    }


    // Init CodeMirror editor
    function initCodeMirrorEditor() {
        const { basicSetup } = CM["codemirror"];
        const { EditorView, lineNumbers } = CM["@codemirror/view"];
        const { EditorState } = CM["@codemirror/state"];
        const { javascript } = CM["@codemirror/lang-javascript"];
        const { oneDark } = CM["@codemirror/theme-one-dark"];
        const { autocompletion } = CM["@codemirror/autocomplete"];
        const { bracketMatching } = CM["@codemirror/language"];

        editor = new EditorView({
            state: EditorState.create({
                doc: defaultValue,
                extensions: [
                    basicSetup,
                    lineNumbers(),
                    javascript(),
                    oneDark,
                    autocompletion(),
                    bracketMatching()
                ]
            }),
            parent: editorContainer,

            dispatch: (transaction) => {
                editor.update([transaction]);
                localStorage.setItem('PROBLEM', editor.getValue());
            }
        });
        editor.getValue = () => editor.state.doc.toString();
        editor.layout = () => editor.dom.style.height = editorContainer.clientHeight + 'px';
        editor.layout();

        editor.dom.style.backgroundColor = 'transparent';
        const cmGutters = editor.dom.querySelector('.cm-gutters');
        cmGutters.style.backgroundColor = '#212428';
        finalConfig();
    }

    
    // File loader function
    function loadFile(url, callback) {
        const fileType = url.endsWith('.css') ? 'css' : 'js';
        const file = document.createElement(fileType === 'css' ? 'link' : 'script');

        if (fileType === 'css') {
            file.rel = 'stylesheet';
            file.href = url;
        } else {
            file.src = url;
            file.defer = true;
            file.onload = callback;
        }

        document.head.appendChild(file);
    }
}