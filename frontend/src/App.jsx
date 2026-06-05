import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import usePlayback from './hooks/usePlayback';

// Visualizer imports
import SortingVisualizer from './components/visualizers/SortingVisualizer';
import StackVisualizer from './components/visualizers/StackVisualizer';
import QueueVisualizer from './components/visualizers/QueueVisualizer';
import LinkedListVisualizer from './components/visualizers/LinkedListVisualizer';
import TreeVisualizer from './components/visualizers/TreeVisualizer';
import GraphVisualizer from './components/visualizers/GraphVisualizer';
import MatrixVisualizer from './components/visualizers/MatrixVisualizer';

/* -------------------- ALGORITHM TEMPLATES -------------------- */
const ALGO_TEMPLATES = {
  bubble_sort: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            # Check if adjacent elements need swapping
            if arr.compare(j, j + 1):
                arr[j], arr[j+1] = arr[j+1], arr[j]`,

  selection_sort: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            # Look for the minimum value dynamically
            if arr.compare(min_idx, j):
                min_idx = j
        # Perform persistent swap if found
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]`,

  insertion_sort: `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        j = i
        while j > 0 and arr.compare(j-1, j):
            arr[j-1], arr[j] = arr[j], arr[j-1]
            j -= 1`,

  quick_sort: `def quick_sort(arr):
    # Entry wrapper for auto-detect
    recursive_quick(arr, 0, len(arr) - 1)

def recursive_quick(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        recursive_quick(arr, low, pi - 1)
        recursive_quick(arr, pi + 1, high)

def partition(arr, low, high):
    pivot_idx = high
    i = low - 1
    for j in range(low, high):
        if arr.compare(pivot_idx, j):
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1`,

  merge_sort: `def merge_sort(arr):
    # In-place merge sort using ObservableArray
    merge_sort_range(arr, 0, len(arr) - 1)

def merge_sort_range(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort_range(arr, left, mid)
        merge_sort_range(arr, mid + 1, right)
        merge(arr, left, mid, right)

def merge(arr, left, mid, right):
    # Copy values to temp arrays
    left_vals = [arr[i] for i in range(left, mid + 1)]
    right_vals = [arr[j] for j in range(mid + 1, right + 1)]
    i = 0
    j = 0
    k = left
    while i < len(left_vals) and j < len(right_vals):
        if left_vals[i] <= right_vals[j]:
            arr[k] = left_vals[i]
            i += 1
        else:
            arr[k] = right_vals[j]
            j += 1
        k += 1
    while i < len(left_vals):
        arr[k] = left_vals[i]
        i += 1
        k += 1
    while j < len(right_vals):
        arr[k] = right_vals[j]
        j += 1
        k += 1`,

  heap_sort: `def heap_sort(arr):
    n = len(arr)
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr.compare(left, largest):
        largest = left
    if right < n and arr.compare(right, largest):
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [mode, setMode] = useState('sorting');
  const [algorithm, setAlgorithm] = useState('bubble_sort');
  const [editorValue, setEditorValue] = useState(ALGO_TEMPLATES.bubble_sort);
  const [arrayInputValue, setArrayInputValue] = useState('5,3,8,1');
  const [arrayInput, setArrayInput] = useState([5, 3, 8, 1]);

  // Local state for non-editor structures
  // Stack
  const [stack, setStack] = useState([]);
  const [stackValue, setStackValue] = useState('');
  const [poppingIndex, setPoppingIndex] = useState(null);
  const [newStackIndex, setNewStackIndex] = useState(null);
  const [isAnimatingStack, setIsAnimatingStack] = useState(false);

  // Queue
  const [queue, setQueue] = useState([]);
  const [queueValue, setQueueValue] = useState('');
  const [dequeueIndex, setDequeueIndex] = useState(null);
  const [newQueueIndex, setNewQueueIndex] = useState(null);
  const [isAnimatingQueue, setIsAnimatingQueue] = useState(false);

  // Linked List
  const [linkedList, setLinkedList] = useState([]);
  const [llValue, setLlValue] = useState('');
  const [llStatus, setLlStatus] = useState('-');

  // Binary Search Tree
  const [tree, setTree] = useState(null);
  const [treeValue, setTreeValue] = useState('');
  const [treeStatus, setTreeStatus] = useState('-');

  // Graph
  const [graph, setGraph] = useState({});
  const [graphNodes, setGraphNodes] = useState([]);
  const [nodeValue, setNodeValue] = useState('');
  const [edgeFrom, setEdgeFrom] = useState('');
  const [edgeTo, setEdgeTo] = useState('');
  const [graphStatus, setGraphStatus] = useState('-');

  // Matrix
  const [matrix, setMatrix] = useState([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]);
  const [matrixRows, setMatrixRows] = useState(3);
  const [matrixCols, setMatrixCols] = useState(3);
  const [matrixInputValue, setMatrixInputValue] = useState('');
  const [matrixStatus, setMatrixStatus] = useState('Matrix initialized (3x3).');

  // Console and Errors
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleVisible, setConsoleVisible] = useState(false);
  const [errorToast, setErrorToast] = useState(null);

  // Monaco editor instance states
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const errorDecorationsRef = useRef([]);

  // Load playback engine hook
  const playback = usePlayback(300);

  // Sync editor values when template changes
  const handleTemplateChange = (key) => {
    setAlgorithm(key);
    if (ALGO_TEMPLATES[key]) {
      setEditorValue(ALGO_TEMPLATES[key]);
      if (editorRef.current) {
        editorRef.current.setValue(ALGO_TEMPLATES[key]);
      }
    }
    playback.stop();
    clearEditorErrors();
  };

  // Switch modes
  const handleModeChange = (newMode) => {
    setMode(newMode);
    playback.stop();
    clearEditorErrors();
    setConsoleOutput('');
    setConsoleVisible(false);
    
    // Matrix initialization logic on tab focus
    if (newMode === 'matrix') {
      reinitMatrix(matrixRows, matrixCols);
    }
  };

  /* -------------------- MONACO INTEGRATION -------------------- */
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Trace line highlighting during playback
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const currentLine = playback.currentStep?.line;
    const newDecorations = [];

    if (currentLine) {
      newDecorations.push({
        range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'executingLine'
        }
      });
    }

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [playback.currentIdx, playback.currentStep]);

  // Show compiler/syntax error toasts in editor
  const showEditorError = (message, line, errorType) => {
    if (!editorRef.current || !monacoRef.current) {
      alert(message);
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) return;

    if (line) {
      monacoRef.current.editor.setModelMarkers(model, 'python-errors', [{
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: model.getLineMaxColumn(line),
        message: `${errorType || 'Error'}: ${message}`,
        severity: monacoRef.current.MarkerSeverity.Error
      }]);

      errorDecorationsRef.current = editorRef.current.deltaDecorations(
        errorDecorationsRef.current,
        [{
          range: new monacoRef.current.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: 'errorLine'
          }
        }]
      );

      editorRef.current.revealLineInCenter(line);
    }

    setErrorToast({ message, line, errorType });
  };

  const clearEditorErrors = () => {
    setErrorToast(null);
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (model) {
      monacoRef.current.editor.setModelMarkers(model, 'python-errors', []);
    }

    errorDecorationsRef.current = editorRef.current.deltaDecorations(errorDecorationsRef.current, []);
  };

  /* -------------------- CODE EXECUTION (SORTING) -------------------- */
  const runSortingCode = async () => {
    playback.stop();
    clearEditorErrors();

    const code = editorRef.current ? editorRef.current.getValue() : editorValue;
    if (!arrayInputValue.trim()) {
      alert("Please enter numbers for the array input.");
      return;
    }

    const parsedArray = arrayInputValue
      .split(',')
      .map(num => Number(num.trim()))
      .filter(val => !isNaN(val));

    setArrayInput(parsedArray);

    try {
      const response = await fetch("http://127.0.0.1:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          input_array: parsedArray,
          algorithm: algorithm
        })
      });

      const data = await response.json();

      if (data.error) {
        showEditorError(data.error, data.error_line, data.error_type);
        setConsoleOutput(data.console_output || '');
        if (data.console_output) setConsoleVisible(true);
        return;
      }

      setConsoleOutput(data.console_output || '');
      if (data.console_output) setConsoleVisible(true);

      const steps = data.steps || [];
      if (steps.length === 0) {
        alert("No steps returned from execution.");
        return;
      }

      playback.load(steps);

    } catch (err) {
      console.error("Failed to run code:", err);
      showEditorError("Network error: Could not connect to backend server.", null, "ConnectionError");
    }
  };

  /* -------------------- STACK METHODS -------------------- */
  const handleStackPush = (e) => {
    e.preventDefault();
    if (isAnimatingStack || stackValue.trim() === '') return;
    const val = Number(stackValue.trim());
    if (isNaN(val)) return;

    const newStack = [...stack, val];
    setStack(newStack);
    setNewStackIndex(newStack.length - 1);
    setStackValue('');
    setIsAnimatingStack(true);

    setTimeout(() => {
      setNewStackIndex(null);
      setIsAnimatingStack(false);
    }, 350);
  };

  const handleStackPop = () => {
    if (isAnimatingStack || stack.length === 0) return;

    setIsAnimatingStack(true);
    setPoppingIndex(stack.length - 1);

    setTimeout(() => {
      setStack(prev => prev.slice(0, -1));
      setPoppingIndex(null);
      setIsAnimatingStack(false);
    }, 300);
  };

  /* -------------------- QUEUE METHODS -------------------- */
  const handleQueueEnqueue = (e) => {
    e.preventDefault();
    if (isAnimatingQueue || queueValue.trim() === '') return;
    const val = Number(queueValue.trim());
    if (isNaN(val)) return;

    const newQueue = [...queue, val];
    setQueue(newQueue);
    setNewQueueIndex(newQueue.length - 1);
    setQueueValue('');
    setIsAnimatingQueue(true);

    setTimeout(() => {
      setNewQueueIndex(null);
      setIsAnimatingQueue(false);
    }, 350);
  };

  const handleQueueDequeue = () => {
    if (isAnimatingQueue || queue.length === 0) return;

    setIsAnimatingQueue(true);
    setDequeueIndex(0);

    setTimeout(() => {
      setQueue(prev => prev.slice(1));
      setDequeueIndex(null);
      setIsAnimatingQueue(false);
    }, 300);
  };

  /* -------------------- LINKED LIST METHODS -------------------- */
  const handleLLInsert = () => {
    if (llValue.trim() === '') return;
    const val = Number(llValue.trim());
    if (isNaN(val)) return;

    setLinkedList([...linkedList, val]);
    setLlValue('');
    setLlStatus(`Inserted ${val} at the end.`);
    playback.stop();
  };

  const handleLLDelete = () => {
    if (llValue.trim() === '') return;
    const val = Number(llValue.trim());
    if (isNaN(val)) return;

    setLinkedList(linkedList.filter(v => v !== val));
    setLlValue('');
    setLlStatus(`Deleted nodes with value ${val}.`);
    playback.stop();
  };

  const handleLLTraverse = () => {
    if (linkedList.length === 0) return;
    setLlStatus('Starting traversal...');

    const steps = [];
    for (let i = 0; i < linkedList.length; i++) {
      steps.push({
        type: 'll_traverse',
        index: i,
        state: 'visiting',
        value: linkedList[i],
        message: `Visiting Node ${i + 1} with Value: ${linkedList[i]}`
      });
    }

    playback.load(steps, () => {
      setLlStatus("Traversal Completed!");
    });
  };

  const handleLLSearch = () => {
    if (llValue.trim() === '') return;
    const target = Number(llValue.trim());
    setLlValue('');
    setLlStatus(`Searching for ${target}...`);

    if (linkedList.length === 0) {
      setLlStatus("Empty List!");
      return;
    }

    const steps = [];
    let found = false;
    for (let i = 0; i < linkedList.length; i++) {
      if (linkedList[i] === target) {
        steps.push({
          type: 'll_search',
          index: i,
          state: 'found',
          value: linkedList[i],
          message: `Found target ${target} at Node ${i + 1}!`
        });
        found = true;
        break;
      } else {
        steps.push({
          type: 'll_search',
          index: i,
          state: 'checking',
          value: linkedList[i],
          message: `Node ${i + 1} (${linkedList[i]}) is not ${target}. Moving next...`
        });
      }
    }

    if (!found) {
      steps.push({
        type: 'll_search',
        index: linkedList.length - 1,
        state: 'not_found',
        value: linkedList[linkedList.length - 1],
        message: `Target ${target} not found in the list.`
      });
    }

    playback.load(steps, () => {
      setLlStatus(found ? `Found ${target}!` : `Target ${target} not found!`);
    });
  };

  // Synchronize LinkedList message from steps
  useEffect(() => {
    if (mode === 'linkedlist' && playback.currentStep) {
      setLlStatus(playback.currentStep.message);
    }
  }, [playback.currentIdx, playback.currentStep, mode]);

  /* -------------------- TREE METHODS -------------------- */
  const insertBST = (node, value) => {
    if (node === null) {
      return { value, left: null, right: null };
    }
    if (value < node.value) {
      node.left = insertBST(node.left, value);
    } else {
      node.right = insertBST(node.right, value);
    }
    return node;
  };

  const findMin = (node) => {
    while (node.left) node = node.left;
    return node;
  };

  const deleteBST = (node, value) => {
    if (node === null) return null;
    if (value < node.value) {
      node.left = deleteBST(node.left, value);
    } else if (value > node.value) {
      node.right = deleteBST(node.right, value);
    } else {
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      const successor = findMin(node.right);
      node.value = successor.value;
      node.right = deleteBST(node.right, successor.value);
    }
    return node;
  };

  const handleTreeInsert = () => {
    if (treeValue.trim() === '') return;
    const val = Number(treeValue.trim());
    if (isNaN(val)) return;

    const newTree = insertBST(tree ? JSON.parse(JSON.stringify(tree)) : null, val);
    setTree(newTree);
    setTreeValue('');
    setTreeStatus(`Inserted ${val} in BST.`);
    playback.stop();
  };

  const handleTreeDelete = () => {
    if (treeValue.trim() === '') return;
    const val = Number(treeValue.trim());
    if (isNaN(val)) return;

    const newTree = deleteBST(tree ? JSON.parse(JSON.stringify(tree)) : null, val);
    setTree(newTree);
    setTreeValue('');
    setTreeStatus(`Deleted ${val} from BST.`);
    playback.stop();
  };

  // BST Traversal computations
  const getInorder = (node, result) => {
    if (!node) return;
    getInorder(node.left, result);
    result.push(node.value);
    getInorder(node.right, result);
  };
  const getPreorder = (node, result) => {
    if (!node) return;
    result.push(node.value);
    getPreorder(node.left, result);
    getPreorder(node.right, result);
  };
  const getPostorder = (node, result) => {
    if (!node) return;
    getPostorder(node.left, result);
    getPostorder(node.right, result);
    result.push(node.value);
  };
  const getLevelorder = (root, result) => {
    const q = [];
    if (root) q.push(root);
    while (q.length > 0) {
      const node = q.shift();
      result.push(node.value);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
  };

  const handleTreeTraversal = (type) => {
    if (!tree) return;
    const result = [];
    if (type === "inorder") getInorder(tree, result);
    else if (type === "preorder") getPreorder(tree, result);
    else if (type === "postorder") getPostorder(tree, result);
    else if (type === "levelorder") getLevelorder(tree, result);

    if (result.length === 0) return;
    setTreeStatus(`Starting ${type} traversal...`);

    const steps = result.map((val, idx) => ({
      type: 'tree_visit',
      value: val,
      traversalType: type,
      outputSoFar: result.slice(0, idx + 1).join(" ")
    }));

    playback.load(steps, () => {
      setTreeStatus(result.join(" "));
    });
  };

  // BST Sync Output
  useEffect(() => {
    if (mode === 'tree' && playback.currentStep) {
      setTreeStatus(playback.currentStep.outputSoFar);
    }
  }, [playback.currentIdx, playback.currentStep, mode]);

  /* -------------------- GRAPH METHODS -------------------- */
  const handleAddGraphNode = () => {
    if (nodeValue.trim() === '') return;
    const node = nodeValue.trim();
    if (graphNodes.includes(node)) {
      alert("Node already exists!");
      return;
    }

    setGraph(prev => ({ ...prev, [node]: [] }));
    setGraphNodes([...graphNodes, node]);
    setNodeValue('');
    setGraphStatus(`Added node ${node}.`);
    playback.stop();
  };

  const handleAddGraphEdge = () => {
    const from = edgeFrom.trim();
    const to = edgeTo.trim();

    if (!from || !to || !graph[from] || !graph[to]) {
      alert("Both nodes must exist in the graph!");
      return;
    }

    setGraph(prev => {
      const adjacent = prev[from] || [];
      if (adjacent.includes(to)) return prev; // already connected
      return { ...prev, [from]: [...adjacent, to] };
    });

    setEdgeFrom('');
    setEdgeTo('');
    setGraphStatus(`Connected ${from} → ${to}.`);
    playback.stop();
  };

  const getBFS = (start) => {
    const visited = new Set();
    const q = [start];
    const order = [];

    while (q.length) {
      const node = q.shift();
      if (!visited.has(node)) {
        visited.add(node);
        order.push(node);
        (graph[node] || []).forEach(n => q.push(n));
      }
    }
    return order;
  };

  const dfsRecursive = (node, visited, order) => {
    visited.add(node);
    order.push(node);
    (graph[node] || []).forEach(n => {
      if (!visited.has(n)) dfsRecursive(n, visited, order);
    });
  };

  const handleGraphTraversal = (type) => {
    const start = graphNodes[0];
    if (!start) return;

    let order = [];
    if (type === "bfs") {
      order = getBFS(start);
    } else {
      const visited = new Set();
      dfsRecursive(start, visited, order);
    }

    if (order.length === 0) return;
    setGraphStatus(`Starting ${type.toUpperCase()}...`);

    const steps = order.map((val, idx) => ({
      type: 'graph_visit',
      currentNode: val,
      visitedSoFar: order.slice(0, idx),
      traversalType: type,
      outputSoFar: order.slice(0, idx + 1).join(" ")
    }));

    playback.load(steps, () => {
      setGraphStatus(order.join(" "));
    });
  };

  // Sync Graph Status
  useEffect(() => {
    if (mode === 'graph' && playback.currentStep) {
      setGraphStatus(playback.currentStep.outputSoFar);
    }
  }, [playback.currentIdx, playback.currentStep, mode]);

  /* -------------------- MATRIX METHODS -------------------- */
  const reinitMatrix = (rCount, cCount) => {
    playback.stop();
    const rowsVal = Math.max(1, Math.min(8, rCount));
    const colsVal = Math.max(1, Math.min(8, cCount));

    setMatrixRows(rowsVal);
    setMatrixCols(colsVal);

    const newMatrix = [];
    let val = 1;
    for (let r = 0; r < rowsVal; r++) {
      const row = [];
      for (let c = 0; c < colsVal; c++) {
        row.push(val++);
      }
      newMatrix.push(row);
    }
    setMatrix(newMatrix);
    setMatrixStatus(`Matrix initialized (${rowsVal}x${colsVal}).`);
  };

  const randomizeMatrix = () => {
    playback.stop();
    const newMatrix = [];
    for (let r = 0; r < matrixRows; r++) {
      const row = [];
      for (let c = 0; c < matrixCols; c++) {
        row.push(Math.floor(Math.random() * 90) + 10);
      }
      newMatrix.push(row);
    }
    setMatrix(newMatrix);
    setMatrixStatus("Randomized matrix values.");
  };

  const loadUserMatrix = () => {
    playback.stop();
    if (!matrixInputValue.trim()) {
      setMatrixStatus("Please enter comma-separated numbers first.");
      return;
    }

    const parsed = matrixInputValue.split(",")
      .map(v => v.trim())
      .filter(v => v !== "")
      .map(Number)
      .filter(n => !isNaN(n));

    if (parsed.length === 0) {
      setMatrixStatus("No valid numbers found in input.");
      return;
    }

    const count = parsed.length;
    const computedCols = Math.max(1, Math.min(8, Math.ceil(count / matrixRows)));
    setMatrixCols(computedCols);

    const newMatrix = [];
    let idx = 0;
    for (let r = 0; r < matrixRows; r++) {
      const row = [];
      for (let c = 0; c < computedCols; c++) {
        if (idx < parsed.length) {
          row.push(parsed[idx++]);
        } else {
          row.push(0);
        }
      }
      newMatrix.push(row);
    }

    setMatrix(newMatrix);
    setMatrixInputValue('');
    setMatrixStatus(`Loaded custom ${matrixRows}x${computedCols} matrix!`);
  };

  const animateTranspose = () => {
    playback.stop();
    const steps = [];
    const origRows = matrix.length;
    const origCols = matrix[0].length;

    let targetMatrix = [];
    for (let c = 0; c < origCols; c++) {
      const row = [];
      for (let r = 0; r < origRows; r++) {
        row.push(0);
      }
      targetMatrix.push(row);
    }

    steps.push({
      type: 'matrix_frame',
      matrixSnapshot: matrix.map(row => [...row]),
      highlights: {},
      message: `Starting Transpose: converting ${origRows}x${origCols} matrix to a transposed ${origCols}x${origRows} structure.`
    });

    let currentTarget = targetMatrix.map(row => [...row]);

    for (let r = 0; r < origRows; r++) {
      for (let c = 0; c < origCols; c++) {
        const origHighlights = {};
        origHighlights[`${r}_${c}`] = 'checking';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: matrix.map(row => [...row]),
          highlights: origHighlights,
          message: `[Transpose] Reading M[${r}][${c}] = ${matrix[r][c]}`
        });

        currentTarget[c][r] = matrix[r][c];

        const targetHighlights = {};
        targetHighlights[`${c}_${r}`] = 'swapped';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: currentTarget.map(row => [...row]),
          highlights: targetHighlights,
          message: `[Transpose] Placed M[${r}][${c}] (${matrix[r][c]}) into M'[${c}][${r}]`
        });
      }
    }

    playback.load(steps, () => {
      setMatrix(currentTarget);
      setMatrixRows(origCols);
      setMatrixCols(origRows);
      setMatrixStatus(`Transpose completed! Size is now ${origCols}x${origRows}.`);
    });
  };

  const animateRotate90 = () => {
    playback.stop();
    const steps = [];
    const origRows = matrix.length;
    const origCols = matrix[0].length;

    steps.push({
      type: 'matrix_frame',
      matrixSnapshot: matrix.map(row => [...row]),
      highlights: {},
      message: `Rotate 90°: First, transpose ${origRows}x${origCols} to a ${origCols}x${origRows} structure.`
    });

    let currentTarget = [];
    for (let c = 0; c < origCols; c++) {
      const row = [];
      for (let r = 0; r < origRows; r++) {
        row.push(0);
      }
      currentTarget.push(row);
    }

    for (let r = 0; r < origRows; r++) {
      for (let c = 0; c < origCols; c++) {
        const origHighlights = {};
        origHighlights[`${r}_${c}`] = 'checking';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: matrix.map(row => [...row]),
          highlights: origHighlights,
          message: `[Transpose Phase] Reading M[${r}][${c}] = ${matrix[r][c]}`
        });

        currentTarget[c][r] = matrix[r][c];

        const targetHighlights = {};
        targetHighlights[`${c}_${r}`] = 'swapped';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: currentTarget.map(row => [...row]),
          highlights: targetHighlights,
          message: `[Transpose Phase] Placed M[${r}][${c}] into M'[${c}][${r}]`
        });
      }
    }

    steps.push({
      type: 'matrix_frame',
      matrixSnapshot: currentTarget.map(row => [...row]),
      highlights: {},
      message: "Transpose completed! Now reverse each row horizontally to complete rotation."
    });

    const tempRows = origCols;
    const tempCols = origRows;

    for (let r = 0; r < tempRows; r++) {
      let left = 0;
      let right = tempCols - 1;
      while (left < right) {
        const checkingHighlights = {};
        checkingHighlights[`${r}_${left}`] = 'checking';
        checkingHighlights[`${r}_${right}`] = 'checking';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: currentTarget.map(row => [...row]),
          highlights: checkingHighlights,
          message: `[Reverse Row ${r}] Swapping columns M[${r}][${left}] and M[${r}][${right}]`
        });

        const tmp = currentTarget[r][left];
        currentTarget[r][left] = currentTarget[r][right];
        currentTarget[r][right] = tmp;

        const swappedHighlights = {};
        swappedHighlights[`${r}_${left}`] = 'swapped';
        swappedHighlights[`${r}_${right}`] = 'swapped';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: currentTarget.map(row => [...row]),
          highlights: swappedHighlights,
          message: `[Reverse Row ${r}] Swapped columns M[${r}][${left}] and M[${r}][${right}]`
        });

        left++;
        right--;
      }
    }

    playback.load(steps, () => {
      setMatrix(currentTarget);
      setMatrixRows(origCols);
      setMatrixCols(origRows);
      setMatrixStatus(`Rotate 90° Completed! Size: ${origCols}x${origRows}.`);
    });
  };

  const animateMirror = () => {
    playback.stop();
    const steps = [];
    let tempMatrix = matrix.map(row => [...row]);
    const rows = tempMatrix.length;
    const cols = tempMatrix[0].length;

    steps.push({
      type: 'matrix_frame',
      matrixSnapshot: tempMatrix.map(row => [...row]),
      highlights: {},
      message: "Mirror: Reversing elements within each row from outer columns inward."
    });

    for (let r = 0; r < rows; r++) {
      let left = 0;
      let right = cols - 1;
      while (left < right) {
        const checkingHighlights = {};
        checkingHighlights[`${r}_${left}`] = 'checking';
        checkingHighlights[`${r}_${right}`] = 'checking';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: tempMatrix.map(row => [...row]),
          highlights: checkingHighlights,
          message: `[Row ${r}] Swapping columns M[${r}][${left}] and M[${r}][${right}]`
        });

        const tmp = tempMatrix[r][left];
        tempMatrix[r][left] = tempMatrix[r][right];
        tempMatrix[r][right] = tmp;

        const swappedHighlights = {};
        swappedHighlights[`${r}_${left}`] = 'swapped';
        swappedHighlights[`${r}_${right}`] = 'swapped';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: tempMatrix.map(row => [...row]),
          highlights: swappedHighlights,
          message: `[Row ${r}] Swapped columns M[${r}][${left}] and M[${r}][${right}]`
        });

        left++;
        right--;
      }
    }

    playback.load(steps, () => {
      setMatrix(tempMatrix);
      setMatrixStatus("Mirror completed!");
    });
  };

  const animateInvert = () => {
    playback.stop();
    const steps = [];
    let tempMatrix = matrix.map(row => [...row]);
    const rows = tempMatrix.length;
    const cols = tempMatrix[0].length;

    steps.push({
      type: 'matrix_frame',
      matrixSnapshot: tempMatrix.map(row => [...row]),
      highlights: {},
      message: "Inverting values: Negating each cell value M[r][c] = -M[r][c]."
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const checkingHighlights = {};
        checkingHighlights[`${r}_${c}`] = 'checking';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: tempMatrix.map(row => [...row]),
          highlights: checkingHighlights,
          message: `Inverting cell [${r}, ${c}]: negating ${tempMatrix[r][c]}`
        });

        tempMatrix[r][c] = -tempMatrix[r][c];

        const swappedHighlights = {};
        swappedHighlights[`${r}_${c}`] = 'swapped';

        steps.push({
          type: 'matrix_frame',
          matrixSnapshot: tempMatrix.map(row => [...row]),
          highlights: swappedHighlights,
          message: `Inverted cell [${r}, ${c}] to ${tempMatrix[r][c]}`
        });
      }
    }

    playback.load(steps, () => {
      setMatrix(tempMatrix);
      setMatrixStatus("Value inversion completed!");
    });
  };

  // Sync Matrix Message Status
  useEffect(() => {
    if (mode === 'matrix' && playback.currentStep) {
      setMatrixStatus(playback.currentStep.message);
    }
  }, [playback.currentIdx, playback.currentStep, mode]);

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-icon">⚡</div>
            <div className="logo-text">
              <h2>DSA Visualizer</h2>
              <span className="logo-tag">playground v1.2.0</span>
            </div>
          </div>
          <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Theme">
            {isDarkMode ? (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>

        <nav className="nav-menu">
          <button className={`nav-item sorting-tab ${mode === 'sorting' ? 'active' : ''}`} onClick={() => handleModeChange('sorting')}>
            <svg className="nav-icon" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Sorting
          </button>
          <button className={`nav-item stack-tab ${mode === 'stack' ? 'active' : ''}`} onClick={() => handleModeChange('stack')}>
            <svg className="nav-icon" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg> Stack
          </button>
          <button className={`nav-item queue-tab ${mode === 'queue' ? 'active' : ''}`} onClick={() => handleModeChange('queue')}>
            <svg className="nav-icon" viewBox="0 0 24 24"><path d="M3 12h18M21 12l-4-4M21 12l-4 4"></path><circle cx="6" cy="12" r="3"></circle><circle cx="14" cy="12" r="3"></circle></svg> Queue
          </button>
          <button className={`nav-item linkedlist-tab ${mode === 'linkedlist' ? 'active' : ''}`} onClick={() => handleModeChange('linkedlist')}>
            <svg className="nav-icon" viewBox="0 0 24 24"><rect x="3" y="9" width="5" height="6" rx="1"></rect><rect x="16" y="9" width="5" height="6" rx="1"></rect><path d="M8 12h8M13 9l3 3-3 3"></path></svg> Linked List
          </button>
          <button className={`nav-item tree-tab ${mode === 'tree' ? 'active' : ''}`} onClick={() => handleModeChange('tree')}>
            <svg className="nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"></circle><circle cx="6" cy="19" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="M12 8L7 16M12 8l5 8"></path></svg> Binary Tree
          </button>
          <button className={`nav-item graph-tab ${mode === 'graph' ? 'active' : ''}`} onClick={() => handleModeChange('graph')}>
            <svg className="nav-icon" viewBox="0 0 24 24"><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M9 6h6M6 9v6M9 18h6M18 9v6M8 8l8 8M16 8l-8 8"></path></svg> Graph
          </button>
          <button className={`nav-item matrix-tab ${mode === 'matrix' ? 'active' : ''}`} onClick={() => handleModeChange('matrix')}>
            <svg className="nav-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg> Matrix
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className="status-dot green"></span>
            <span class="status-text">Engine Ready</span>
          </div>
          <span className="built-by">Algorithms Lab</span>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="main-content">
        {/* CONTROL PANEL */}
        <section className="control-panel">
          <div className="panel-card">
            {/* Sorting Tab Controls */}
            {mode === 'sorting' && (
              <div className="control-group">
                <div className="config-header">
                  <div className="select-wrapper">
                    <label htmlFor="algorithm">Load Template</label>
                    <select id="algorithm" value={algorithm} onChange={(e) => handleTemplateChange(e.target.value)}>
                      <option value="" disabled>Choose Algorithm...</option>
                      <option value="bubble_sort">Bubble Sort</option>
                      <option value="selection_sort">Selection Sort</option>
                      <option value="insertion_sort">Insertion Sort</option>
                      <option value="merge_sort">Merge Sort</option>
                      <option value="quick_sort">Quick Sort</option>
                      <option value="heap_sort">Heap Sort</option>
                    </select>
                  </div>
                </div>

                {/* Monaco Editor Wrapper */}
                <div className="editor-container">
                  <div className="editor-header">
                    <div className="window-dots">
                      <span className="dot red"></span>
                      <span className="dot yellow"></span>
                      <span className="dot green"></span>
                    </div>
                    <div className="editor-tabs">
                      <div className="editor-tab active">
                        <span className="tab-icon">🐍</span>
                        <span className="tab-title">main.py</span>
                      </div>
                    </div>
                  </div>
                  <div className="monaco-instance">
                    <Editor
                      height="320px"
                      language="python"
                      theme={isDarkMode ? "vs-dark" : "vs"}
                      value={editorValue}
                      onMount={handleEditorDidMount}
                      options={{
                        automaticLayout: true,
                        fontSize: 14,
                        minimap: { enabled: false }
                      }}
                    />
                  </div>
                </div>

                <div className="action-footer">
                  <div className="input-field">
                    <label htmlFor="arrayInput">Array Inputs</label>
                    <input
                      id="arrayInput"
                      value={arrayInputValue}
                      onChange={(e) => setArrayInputValue(e.target.value)}
                      placeholder="Enter comma-separated values"
                    />
                  </div>
                  <div className="actions-row">
                    <button className="btn-primary" onClick={runSortingCode}>
                      <svg className="run-icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Run
                    </button>
                  </div>
                </div>

                {errorToast && (
                  <div className="error-toast">
                    <div className="error-toast-header">
                      <span className="error-badge">{errorToast.errorType || 'Error'}</span>
                      <button className="error-dismiss" onClick={clearEditorErrors}>✕</button>
                    </div>
                    <pre className="error-message">{errorToast.message}</pre>
                    {errorToast.line && <span className="error-location">Line {errorToast.line}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Stack Tab Controls */}
            {mode === 'stack' && (
              <div className="control-group">
                <h3>Stack Operations</h3>
                <form className="action-footer compact" onSubmit={handleStackPush}>
                  <input
                    placeholder="Value to push"
                    className="input-sm"
                    value={stackValue}
                    onChange={(e) => setStackValue(e.target.value)}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                  <button type="submit" className="btn-action">Push</button>
                  <button type="button" className="btn-action danger" onClick={handleStackPop}>Pop</button>
                </form>
              </div>
            )}

            {/* Queue Tab Controls */}
            {mode === 'queue' && (
              <div className="control-group">
                <h3>Queue Operations</h3>
                <form className="action-footer compact" onSubmit={handleQueueEnqueue}>
                  <input
                    placeholder="Value to enqueue"
                    className="input-sm"
                    value={queueValue}
                    onChange={(e) => setQueueValue(e.target.value)}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                  <button type="submit" className="btn-action">Enqueue</button>
                  <button type="button" className="btn-action danger" onClick={handleQueueDequeue}>Dequeue</button>
                </form>
              </div>
            )}

            {/* Linked List Tab Controls */}
            {mode === 'linkedlist' && (
              <div className="control-group">
                <h3>Linked List Operations</h3>
                <div className="action-footer compact">
                  <input
                    placeholder="Value"
                    className="input-sm"
                    value={llValue}
                    onChange={(e) => setLlValue(e.target.value)}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                  <button className="btn-action" onClick={handleLLInsert}>Insert End</button>
                  <button className="btn-action danger" onClick={handleLLDelete}>Delete Value</button>
                </div>
                <div className="traversal-group">
                  <div className="button-grid">
                    <button className="btn-outline" onClick={handleLLSearch}>Search Value</button>
                    <button className="btn-outline" onClick={handleLLTraverse}>Traverse</button>
                  </div>
                  <div className="traversal-output">
                    <span className="label">Status:</span> <span className="result">{llStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* BST Tab Controls */}
            {mode === 'tree' && (
              <div className="control-group">
                <h3>Binary Search Tree Operations</h3>
                <div className="action-footer compact">
                  <input
                    placeholder="Value"
                    className="input-sm"
                    value={treeValue}
                    onChange={(e) => setTreeValue(e.target.value)}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                  <button className="btn-action" onClick={handleTreeInsert}>Insert</button>
                  <button className="btn-action danger" onClick={handleTreeDelete}>Delete</button>
                </div>
                <div className="traversal-group">
                  <div className="button-grid">
                    <button className="btn-outline" onClick={() => handleTreeTraversal('inorder')}>Inorder</button>
                    <button className="btn-outline" onClick={() => handleTreeTraversal('preorder')}>Preorder</button>
                    <button className="btn-outline" onClick={() => handleTreeTraversal('postorder')}>Postorder</button>
                    <button className="btn-outline" onClick={() => handleTreeTraversal('levelorder')}>Level Order</button>
                  </div>
                  <div className="traversal-output">
                    <span className="label">Output:</span> <span className="result">{treeStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Graph Tab Controls */}
            {mode === 'graph' && (
              <div className="control-group">
                <h3>Graph Operations</h3>
                <div className="sub-section" style={{ marginBottom: '15px' }}>
                  <div className="action-footer compact">
                    <input
                      placeholder="Node name"
                      className="input-sm"
                      value={nodeValue}
                      onChange={(e) => setNodeValue(e.target.value)}
                      style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                    />
                    <button className="btn-action" onClick={handleAddGraphNode}>Add Node</button>
                  </div>
                </div>
                <div className="sub-section" style={{ marginBottom: '15px' }}>
                  <div className="action-footer compact">
                    <input
                      placeholder="From"
                      className="input-sm"
                      value={edgeFrom}
                      onChange={(e) => setEdgeFrom(e.target.value)}
                      style={{ width: '80px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                    />
                    <input
                      placeholder="To"
                      className="input-sm"
                      value={edgeTo}
                      onChange={(e) => setEdgeTo(e.target.value)}
                      style={{ width: '80px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                    />
                    <button className="btn-action" onClick={handleAddGraphEdge}>Connect</button>
                  </div>
                </div>
                <div className="traversal-group">
                  <div className="button-grid">
                    <button className="btn-outline" onClick={() => handleGraphTraversal('bfs')}>BFS</button>
                    <button className="btn-outline" onClick={() => handleGraphTraversal('dfs')}>DFS</button>
                  </div>
                  <div className="traversal-output">
                    <span className="label">Output:</span> <span className="result">{graphStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Matrix Tab Controls */}
            {mode === 'matrix' && (
              <div className="control-group">
                <h3>Matrix Operations</h3>
                <div className="sub-section" style={{ marginBottom: '15px' }}>
                  <div className="action-footer compact" style={{ gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rows:</label>
                    <input
                      type="number"
                      className="input-sm"
                      style={{ width: '55px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                      min="1" max="8"
                      value={matrixRows}
                      onChange={(e) => reinitMatrix(Number(e.target.value), matrixCols)}
                    />
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Cols:</label>
                    <input
                      type="number"
                      className="input-sm"
                      style={{ width: '55px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                      min="1" max="8"
                      value={matrixCols}
                      onChange={(e) => reinitMatrix(matrixRows, Number(e.target.value))}
                    />
                    <button className="btn-action" onClick={randomizeMatrix}>Random</button>
                  </div>
                </div>
                <div className="sub-section" style={{ marginBottom: '15px' }}>
                  <div className="action-footer compact" style={{ gap: '6px' }}>
                    <input
                      placeholder="Values (e.g. 1,2,3,4,5,6,7,8,9)"
                      className="input-sm"
                      style={{ flex: 1, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                      value={matrixInputValue}
                      onChange={(e) => setMatrixInputValue(e.target.value)}
                    />
                    <button className="btn-action" onClick={loadUserMatrix} style={{ whiteSpace: 'nowrap' }}>Set Values</button>
                  </div>
                </div>
                <div className="traversal-group">
                  <div className="button-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button className="btn-outline" onClick={animateTranspose}>Transpose</button>
                    <button className="btn-outline" onClick={animateRotate90}>Rotate 90°</button>
                    <button className="btn-outline" onClick={animateMirror}>Mirror (Horiz)</button>
                    <button className="btn-outline" onClick={animateInvert}>Invert Values</button>
                  </div>
                  <div className="traversal-output" style={{ marginTop: '10px' }}>
                    <span className="label">Status:</span> <span className="result">{matrixStatus}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* VISUALIZATION PANEL */}
        <section className="visual-panel">
          <div className="panel-header">
            <h3>Simulation Canvas</h3>
          </div>

          <div className="visualizer-container">
            {/* Visualizers selection render */}
            {mode === 'sorting' && (
              <SortingVisualizer playback={playback} arrayInput={arrayInput} />
            )}
            {mode === 'stack' && (
              <StackVisualizer stack={stack} newIndex={newStackIndex} poppingIndex={poppingIndex} />
            )}
            {mode === 'queue' && (
              <QueueVisualizer queue={queue} newIndex={newQueueIndex} dequeueIndex={dequeueIndex} />
            )}
            {mode === 'linkedlist' && (
              <LinkedListVisualizer linkedList={linkedList} playback={playback} />
            )}
            {mode === 'tree' && (
              <TreeVisualizer tree={tree} playback={playback} />
            )}
            {mode === 'graph' && (
              <GraphVisualizer graph={graph} graphNodes={graphNodes} playback={playback} />
            )}
            {mode === 'matrix' && (
              <MatrixVisualizer matrix={matrix} playback={playback} />
            )}

            {/* Playback Controls deck overlays */}
            {playback.steps.length > 0 && (
              <div className="global-playback">
                <button className="btn-ctrl" title="Step Back" onClick={playback.stepBackward}>⏮</button>
                <button className="btn-ctrl accent" title="Play / Pause" onClick={() => playback.setIsPlaying(!playback.isPlaying)}>
                  {playback.isPlaying ? '⏸' : '▶'}
                </button>
                <button className="btn-ctrl" title="Step Forward" onClick={playback.stepForward}>⏭</button>
                <span className="step-counter">{playback.currentIdx + 1} / {playback.steps.length}</span>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${((playback.currentIdx + 1) / playback.steps.length) * 100}%` }}
                  />
                </div>
                <div className="speed-control">
                  <label htmlFor="globalSpeed">Speed</label>
                  <input
                    type="range"
                    id="globalSpeed"
                    min="50" max="1000" step="50"
                    value={playback.speed}
                    onChange={(e) => playback.setSpeed(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terminal Console Panel */}
          {consoleOutput && (
            <div className="console-panel">
              <div className="console-header">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="console-title">⌨ Terminal Console</span>
                <div className="console-actions">
                  <button className="console-btn" onClick={() => setConsoleOutput('')} title="Clear">🗑</button>
                  <button className="console-btn" onClick={() => setConsoleVisible(!consoleVisible)} title="Toggle">
                    {consoleVisible ? '▼' : '▲'}
                  </button>
                </div>
              </div>
              {consoleVisible && (
                <pre className="console-body">{consoleOutput}</pre>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
