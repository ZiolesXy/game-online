'use strict';

// Map chess pieces to image paths (relative to ChessRevamed/ directory)
const pieceImages = {
  'wK': '../ChessRevamed/Assets/Wking.png',
  'wQ': '../ChessRevamed/Assets/Wqueen.png',
  'wR': '../ChessRevamed/Assets/Wrook.png',
  'wB': '../ChessRevamed/Assets/Wbishop.png',
  'wN': '../ChessRevamed/Assets/Wknight.png',
  'wP': '../ChessRevamed/Assets/Wpawn.png',
  'bK': '../ChessRevamed/Assets/Bking.png',
  'bQ': '../ChessRevamed/Assets/Bqueen.png',
  'bR': '../ChessRevamed/Assets/Brook.png',
  'bB': '../ChessRevamed/Assets/Bbishop.png',
  'bN': '../ChessRevamed/Assets/Bknight.png',
  'bP': '../ChessRevamed/Assets/Bpawn.png',
};

// Game state
let board = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

let currentPlayer = 'w';
let selectedSquare = null;
let gameOver = false;
let moveHistory = [];
let castlingRights = {
  wK: true, wQ: true, bK: true, bQ: true
};
let enPassantTarget = null;
let boardFlipped = false;
let lastMove = null;

// Game mode settings
let gameMode = null; // 'human' or 'ai'
let aiDifficulty = null; // 'easy', 'medium', 'hard'
let humanColor = 'w'; // default human plays white

// PGN data
let gameMetadata = {
  date: new Date().toISOString().split('T')[0],
  white: 'Player 1',
  black: 'Player 2'
};


// Menu functions
function selectMode(mode) {
  gameMode = mode;

  // Update UI
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
  if (window.event) window.event.target.classList.add('selected');

  // Show/hide difficulty selection
  const difficultyDiv = document.getElementById('difficultySelection');
  if (mode === 'ai') {
    difficultyDiv.style.display = 'block';
    gameMetadata.white = 'Human';
    gameMetadata.black = 'AI';
  } else {
    difficultyDiv.style.display = 'none';
    aiDifficulty = null;
    gameMetadata.white = 'Player 1';
    gameMetadata.black = 'Player 2';
  }
}

function selectDifficulty(difficulty) {
  aiDifficulty = difficulty;

  // Update UI
  document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('selected'));
  if (window.event) window.event.target.classList.add('selected');
}

function startGame() {
  if (!gameMode || (gameMode === 'ai' && !aiDifficulty)) {
    alert('Silakan pilih mode permainan dan tingkat kesulitan!');
    return;
  }

  document.getElementById('mainMenu').style.display = 'none';
  document.getElementById('gameArea').style.display = 'block';

  resetGameState();
  createBoard();
  
}

function showMainMenu() {
  document.getElementById('gameArea').style.display = 'none';
  document.getElementById('mainMenu').style.display = 'block';
}

function createBoard() {
  const chessboard = document.getElementById('chessboard');
  chessboard.innerHTML = '';

  for (let row = 0; row < 8; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      const displayRow = boardFlipped ? 7 - row : row;
      const displayCol = boardFlipped ? 7 - col : col;

      square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'white' : 'black'}`;
      square.onclick = () => handleSquareClick(row, col);
      square.dataset.row = row;
      square.dataset.col = col;

      // Add last move highlight
      if (lastMove && ((lastMove.from.row === row && lastMove.from.col === col) ||
                       (lastMove.to.row === row && lastMove.to.col === col))) {
        square.classList.add('last-move-highlight');
      }

      // Add coordinates
      if (col === 0) {
        const rankCoord = document.createElement('div');
        rankCoord.className = 'coordinates coord-rank';
        rankCoord.textContent = 8 - displayRow;
        square.appendChild(rankCoord);
      }
      if (row === 7) {
        const fileCoord = document.createElement('div');
        fileCoord.className = 'coordinates coord-file';
        fileCoord.textContent = String.fromCharCode(97 + displayCol);
        square.appendChild(fileCoord);
      }

      const piece = board[row][col];
      if (piece) {
        const img = document.createElement('img');
        img.className = 'piece-img';
        img.alt = piece;
        img.src = pieceImages[piece];
        square.appendChild(img);
      }

      rowDiv.appendChild(square);
    }
    chessboard.appendChild(rowDiv);
  }


  updateGameStatus();
}

function flipBoard() {
  boardFlipped = !boardFlipped;
  createBoard();
}

function handleSquareClick(row, col) {
  if (gameOver) return;

  if (gameMode === 'ai' && currentPlayer !== humanColor) return;

  const piece = board[row][col];

  if (!selectedSquare) {
    if (piece && piece[0] === currentPlayer) {
      selectSquare(row, col);
    }
    return;
  }

  if (selectedSquare.row === row && selectedSquare.col === col) {
    deselectSquare();
    return;
  }

  if (piece && piece[0] === currentPlayer) {
    selectSquare(row, col);
    return;
  }

  const move = { from: { row: selectedSquare.row, col: selectedSquare.col }, to: { row, col } };
  if (isValidMove(move)) {
    makeMove(move);
  }

  deselectSquare();
}

function selectSquare(row, col) {
  deselectSquare();
  selectedSquare = { row, col };

  const square = getSquareElement(row, col);
  square.classList.add('selected');

  highlightPossibleMoves(row, col);
}

function deselectSquare() {
  if (selectedSquare) {
    const square = getSquareElement(selectedSquare.row, selectedSquare.col);
    square.classList.remove('selected');
  }
  selectedSquare = null;
  clearHighlights();
}

function highlightPossibleMoves(row, col) {
  const moves = getPossibleMoves(row, col);

  moves.forEach(move => {
    const square = getSquareElement(move.row, move.col);
    if (board[move.row][move.col]) {
      square.classList.add('capture-move');
    } else {
      square.classList.add('possible-move');
    }
  });
}

function clearHighlights() {
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
    // Do not remove 'in-check' here; it should persist until the board state is safe.
    square.classList.remove('possible-move', 'capture-move');
  });
}

function getSquareElement(row, col) {
  return document.querySelectorAll('.row')[row].children[col];
}

function makeMoveWithAnimation(move) {
  makeMove(move);
}

function getPossibleMoves(row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const pieceType = piece[1];
  const color = piece[0];

  switch (pieceType) {
    case 'P': moves.push(...getPawnMoves(row, col, color)); break;
    case 'R': moves.push(...getRookMoves(row, col, color)); break;
    case 'N': moves.push(...getKnightMoves(row, col, color)); break;
    case 'B': moves.push(...getBishopMoves(row, col, color)); break;
    case 'Q': moves.push(...getQueenMoves(row, col, color)); break;
    case 'K': moves.push(...getKingMoves(row, col, color)); break;
  }

  return moves.filter(move => !wouldBeInCheck(color, { from: { row, col }, to: { row: move.row, col: move.col } }));
}

function getPawnMoves(row, col, color) {
  const moves = [];
  const direction = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
    moves.push({ row: row + direction, col });
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  for (let dc of [-1, 1]) {
    const newRow = row + direction;
    const newCol = col + dc;
    if (isValidSquare(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (target && target[0] !== color) {
        moves.push({ row: newRow, col: newCol });
      }
      if (enPassantTarget && enPassantTarget.row === newRow && enPassantTarget.col === newCol) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

function getRookMoves(row, col, color) {
  const moves = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      if (!isValidSquare(newRow, newCol)) break;
      const target = board[newRow][newCol];
      if (!target) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (target[0] !== color) moves.push({ row: newRow, col: newCol });
        break;
      }
    }
  }
  return moves;
}

function getKnightMoves(row, col, color) {
  const moves = [];
  const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (let [dr, dc] of knightMoves) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isValidSquare(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target || target[0] !== color) moves.push({ row: newRow, col: newCol });
    }
  }
  return moves;
}

function getBishopMoves(row, col, color) {
  const moves = [];
  const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      if (!isValidSquare(newRow, newCol)) break;
      const target = board[newRow][newCol];
      if (!target) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (target[0] !== color) moves.push({ row: newRow, col: newCol });
        break;
      }
    }
  }
  return moves;
}

function getQueenMoves(row, col, color) {
  return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
}

function getKingMoves(row, col, color) {
  const moves = [];
  const kingMoves = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let [dr, dc] of kingMoves) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isValidSquare(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target || target[0] !== color) moves.push({ row: newRow, col: newCol });
    }
  }
  if (canCastle(color, 'K')) moves.push({ row, col: col + 2 });
  if (canCastle(color, 'Q')) moves.push({ row, col: col - 2 });
  return moves;
}

function isValidSquare(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isValidMove(move) {
  const { from, to } = move;
  const piece = board[from.row][from.col];
  if (!piece || piece[0] !== currentPlayer) return false;
  const possibleMoves = getPossibleMoves(from.row, from.col);
  return possibleMoves.some(m => m.row === to.row && m.col === to.col);
}

function makeMove(move) {
  const { from, to } = move;
  const piece = board[from.row][from.col];
  const capturedPiece = board[to.row][to.col];

  const moveData = {
    from: { ...from },
    to: { ...to },
    piece,
    capturedPiece,
    castlingRights: { ...castlingRights },
    enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null
  };

  if (piece[1] === 'K' && Math.abs(to.col - from.col) === 2) {
    const isKingside = to.col > from.col;
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? 5 : 3;
    board[to.row][rookToCol] = board[from.row][rookFromCol];
    board[from.row][rookFromCol] = '';
    moveData.castling = { isKingside, rookFromCol, rookToCol };
  }

  if (piece[1] === 'P' && enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
    const capturedPawnRow = currentPlayer === 'w' ? to.row + 1 : to.row - 1;
    board[capturedPawnRow][to.col] = '';
    moveData.enPassant = { row: capturedPawnRow, col: to.col };
  }

  board[to.row][to.col] = piece;
  board[from.row][from.col] = '';

  if (piece[1] === 'P' && (to.row === 0 || to.row === 7)) {
    showPromotionDialog(to.row, to.col, moveData);
    return;
  }

  completeMove(moveData);
}

function completeMove(moveData) {
  moveHistory.push(moveData);
  lastMove = { from: moveData.from, to: moveData.to };
  updateCastlingRights(moveData);
  updateEnPassantTarget(moveData);
  currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
  createBoard();
  checkGameEnd();
  updateMoveHistory();
  if (gameMode === 'ai' && currentPlayer !== humanColor && !gameOver) {
    makeAIMove();
  }
}

function updateCastlingRights(moveData) {
  const { from, piece } = moveData;
  if (piece === 'wK') { castlingRights.wK = false; castlingRights.wQ = false; }
  else if (piece === 'bK') { castlingRights.bK = false; castlingRights.bQ = false; }
  else if (piece === 'wR') { if (from.col === 0) castlingRights.wQ = false; if (from.col === 7) castlingRights.wK = false; }
  else if (piece === 'bR') { if (from.col === 0) castlingRights.bQ = false; if (from.col === 7) castlingRights.bK = false; }
}

function updateEnPassantTarget(moveData) {
  const { from, to, piece } = moveData;
  enPassantTarget = null;
  if (piece[1] === 'P' && Math.abs(to.row - from.row) === 2) {
    enPassantTarget = { row: (from.row + to.row) / 2, col: to.col };
  }
}

function canCastle(color, side) {
  const row = color === 'w' ? 7 : 0;
  const kingCol = 4;
  const rookCol = side === 'K' ? 7 : 0;
  const rightKey = color + side;
  if (!castlingRights[rightKey]) return false;
  if (board[row][kingCol] !== color + 'K') return false;
  if (board[row][rookCol] !== color + 'R') return false;
  const start = Math.min(kingCol, rookCol) + 1;
  const end = Math.max(kingCol, rookCol);
  for (let c = start; c < end; c++) {
    if (board[row][c]) return false;
  }
  if (isInCheck(color)) return false;
  const direction = side === 'K' ? 1 : -1;
  for (let i = 1; i <= 2; i++) {
    if (wouldBeInCheck(color, { from: { row, col: kingCol }, to: { row, col: kingCol + direction * i } })) return false;
  }
  return true;
}

function isInCheck(color) {
  const kingPos = findKing(color);
  if (!kingPos) return false;
  return isSquareAttacked(kingPos.row, kingPos.col, color === 'w' ? 'b' : 'w');
}

function findKing(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === color + 'K') return { row: r, col: c };
    }
  }
  return null;
}

function isSquareAttacked(row, col, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece[0] === byColor) {
        const moves = getPossibleMovesForAttack(r, c, byColor);
        if (moves.some(m => m.row === row && m.col === col)) return true;
      }
    }
  }
  return false;
}

function getPossibleMovesForAttack(row, col, color) {
  const piece = board[row][col];
  const type = piece[1];
  switch (type) {
    case 'P': return getPawnAttacks(row, col, color);
    case 'R': return getRookMoves(row, col, color);
    case 'N': return getKnightMoves(row, col, color);
    case 'B': return getBishopMoves(row, col, color);
    case 'Q': return getQueenMoves(row, col, color);
    case 'K': return getKingAttacks(row, col, color);
    default: return [];
  }
}

function getPawnAttacks(row, col, color) {
  const moves = [];
  const direction = color === 'w' ? -1 : 1;
  for (let dc of [-1, 1]) {
    const newRow = row + direction;
    const newCol = col + dc;
    if (isValidSquare(newRow, newCol)) moves.push({ row: newRow, col: newCol });
  }
  return moves;
}

function getKingAttacks(row, col, color) {
  const moves = [];
  const kingMoves = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let [dr, dc] of kingMoves) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isValidSquare(newRow, newCol)) moves.push({ row: newRow, col: newCol });
  }
  return moves;
}

function wouldBeInCheck(color, move) {
  const originalBoard = board.map(row => [...row]);
  const { from, to } = move;
  board[to.row][to.col] = board[from.row][from.col];
  board[from.row][from.col] = '';
  const inCheck = isInCheck(color);
  board = originalBoard;
  return inCheck;
}

function hasLegalMoves(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece[0] === color) {
        const moves = getPossibleMoves(r, c);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

function checkGameEnd() {
  const inCheckNow = isInCheck(currentPlayer);
  const hasLegal = hasLegalMoves(currentPlayer);

  if (inCheckNow) {
    const kingPos = findKing(currentPlayer);
    if (kingPos) {
      const square = getSquareElement(kingPos.row, kingPos.col);
      square.classList.add('in-check');
    }
  }

  if (!hasLegal) {
    if (inCheckNow) {
      const winner = currentPlayer === 'w' ? 'Hitam' : 'Putih';
      document.getElementById('gameStatus').innerHTML = `<div class="game-over">SKAKMAT! ${winner} Menang!</div>`;
    } else {
      document.getElementById('gameStatus').innerHTML = `<div class="game-over">STALEMATE! Permainan Seri!</div>`;
    }
    gameOver = true;
  } else if (inCheckNow) {
    document.getElementById('gameStatus').innerHTML = `<div class="check-warning">SKAK!</div>`;
  } else {
    document.getElementById('gameStatus').innerHTML = '';
  }
}

function showPromotionDialog(row, col, moveData) {
  const modal = document.getElementById('promotionModal');
  const piecesDiv = document.getElementById('promotionPieces');

  // Use the piece color from moveData instead of currentPlayer (which has already switched)
  const color = moveData.piece[0];
  const promotionPieces = ['Q', 'R', 'B', 'N'];

  piecesDiv.innerHTML = '';
  promotionPieces.forEach(pieceType => {
    const pieceCode = color + pieceType;
    const pieceDiv = document.createElement('div');
    pieceDiv.className = 'promotion-piece';
    const img = document.createElement('img');
    img.className = 'piece-img';
    img.alt = pieceCode;
    img.src = pieceImages[pieceCode];
    pieceDiv.appendChild(img);
    pieceDiv.onclick = () => {
      board[row][col] = pieceCode;
      modal.style.display = 'none';
      completeMove(moveData);
    };
    piecesDiv.appendChild(pieceDiv);
  });

  modal.style.display = 'flex';
}

function updateGameStatus() {
  const playerName = currentPlayer === 'w' ? 'Putih' : 'Hitam';
  document.getElementById('currentPlayer').textContent = playerName;
}

function updateMoveHistory() {
  const historyDiv = document.getElementById('moveHistory');
  if (moveHistory.length === 0) {
    historyDiv.textContent = '';
    return;
  }
  const lastMove = moveHistory[moveHistory.length - 1];
  const moveNotation = getMoveNotation(lastMove);
  historyDiv.textContent = `Langkah terakhir: ${moveNotation}`;
}

function getMoveNotation(moveData) {
  const { from, to, piece, capturedPiece, castling } = moveData;
  if (castling) return castling.isKingside ? 'O-O' : 'O-O-O';
  const pieceSymbol = piece[1] === 'P' ? '' : piece[1];
  const fromSquare = String.fromCharCode(97 + from.col) + (8 - from.row);
  const toSquare = String.fromCharCode(97 + to.col) + (8 - to.row);
  const capture = capturedPiece ? 'x' : '';
  return `${pieceSymbol}${fromSquare}${capture}${toSquare}`;
}

// AI
function makeAIMove() {
  if (gameOver) return;
  document.getElementById('aiThinking').style.display = 'block';
  setTimeout(() => {
    const bestMove = getBestMove(currentPlayer, aiDifficulty);
    if (bestMove) makeMove(bestMove);
    document.getElementById('aiThinking').style.display = 'none';
  }, 500 + Math.random() * 1500);
}

function getBestMove(color, difficulty) {
  const allMoves = getAllPossibleMoves(color);
  if (allMoves.length === 0) return null;
  switch (difficulty) {
    case 'easy':
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    case 'medium':
      if (Math.random() < 0.3) return allMoves[Math.floor(Math.random() * allMoves.length)];
      return getBestMoveBasic(allMoves, color);
    case 'hard':
      return getBestMoveAdvanced(allMoves, color);
    default:
      return allMoves[0];
  }
}

function getAllPossibleMoves(color) {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === color) {
        const pieceMoves = getPossibleMoves(row, col);
        pieceMoves.forEach(m => moves.push({ from: { row, col }, to: { row: m.row, col: m.col } }));
      }
    }
  }
  return moves;
}

function getBestMoveBasic(moves, color) {
  let bestMove = null;
  let bestScore = -Infinity;
  for (let move of moves) {
    const score = evaluateMove(move, color);
    if (score > bestScore) { bestScore = score; bestMove = move; }
  }
  return bestMove || moves[0];
}

function getBestMoveAdvanced(moves, color) {
  let bestMove = null;
  let bestScore = -Infinity;
  for (let move of moves) {
    const score = minimax(move, color, 2, false);
    if (score > bestScore) { bestScore = score; bestMove = move; }
  }
  return bestMove || moves[0];
}

function evaluateMove(move, color) {
  const { from, to } = move;
  const capturedPiece = board[to.row][to.col];
  let score = 0;
  if (capturedPiece) {
    const values = { 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100 };
    score += values[capturedPiece[1]] || 0;
  }
  const center = [[3,3],[3,4],[4,3],[4,4]];
  if (center.some(([r,c]) => r === to.row && c === to.col)) score += 0.5;
  score += Math.random() * 0.1;
  return score;
}

function minimax(move, color, depth, isMaximizing) {
  if (depth === 0) return evaluatePosition(color);
  const originalBoard = board.map(r => [...r]);
  simulateMove(move);
  let bestScore = isMaximizing ? -Infinity : Infinity;
  const nextColor = color === 'w' ? 'b' : 'w';
  const moves = getAllPossibleMoves(nextColor);
  for (let nextMove of moves.slice(0, 10)) {
    const score = minimax(nextMove, nextColor, depth - 1, !isMaximizing);
    bestScore = isMaximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
  }
  board = originalBoard;
  return bestScore;
}

function simulateMove(move) {
  const { from, to } = move;
  board[to.row][to.col] = board[from.row][from.col];
  board[from.row][from.col] = '';
}

function evaluatePosition(color) {
  let score = 0;
  const values = { 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100 };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const v = values[piece[1]] || 0;
        score += piece[0] === color ? v : -v;
      }
    }
  }
  return score;
}

// PGN
function exportPGN() {
  const pgn = generatePGN();
  const exportDiv = document.getElementById('pgnExport');
  exportDiv.textContent = pgn;
  exportDiv.style.display = 'block';
  const blob = new Blob([pgn], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chess_game_${gameMetadata.date}.pgn`;
  a.click();
  URL.revokeObjectURL(url);
}

function generatePGN() {
  let pgn = `[Event "Chess Game"]\n`;
  pgn += `[Site "Web Browser"]\n`;
  pgn += `[Date "${gameMetadata.date}"]\n`;
  pgn += `[Round "1"]\n`;
  pgn += `[White "${gameMetadata.white}"]\n`;
  pgn += `[Black "${gameMetadata.black}"]\n`;
  if (gameOver) {
    if (document.getElementById('gameStatus').textContent.includes('Putih Menang')) pgn += `[Result "1-0"]\n`;
    else if (document.getElementById('gameStatus').textContent.includes('Hitam Menang')) pgn += `[Result "0-1"]\n`;
    else pgn += `[Result "1/2-1/2"]\n`;
  } else {
    pgn += `[Result "*"]\n`;
  }
  pgn += '\n';
  for (let i = 0; i < moveHistory.length; i++) {
    if (i % 2 === 0) pgn += `${Math.floor(i / 2) + 1}. `;
    pgn += getMoveNotation(moveHistory[i]) + ' ';
  }
  if (gameOver) {
    if (document.getElementById('gameStatus').textContent.includes('Putih Menang')) pgn += '1-0';
    else if (document.getElementById('gameStatus').textContent.includes('Hitam Menang')) pgn += '0-1';
    else pgn += '1/2-1/2';
  } else {
    pgn += '*';
  }
  return pgn;
}

function resetGame() {
  resetGameState();
  createBoard();
}

function resetGameState() {
  board = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
  ];
  currentPlayer = 'w';
  selectedSquare = null;
  gameOver = false;
  moveHistory = [];
  lastMove = null;
  castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
  enPassantTarget = null;
  gameMetadata.date = new Date().toISOString().split('T')[0];
  document.getElementById('pgnExport').style.display = 'none';
  document.getElementById('aiThinking').style.display = 'none';
}

function undoMove() {
  if (moveHistory.length === 0) return;
  const lastMoveData = moveHistory.pop();
  const { from, to, piece, capturedPiece, castling, enPassant } = lastMoveData;
  board[from.row][from.col] = piece;
  board[to.row][to.col] = capturedPiece || '';
  if (castling) {
    const { isKingside, rookFromCol, rookToCol } = castling;
    board[from.row][rookFromCol] = board[to.row][rookToCol];
    board[to.row][rookToCol] = '';
  }
  if (enPassant) {
    const capturedPawn = currentPlayer === 'w' ? 'bP' : 'wP';
    board[enPassant.row][enPassant.col] = capturedPawn;
  }
  castlingRights = lastMoveData.castlingRights;
  enPassantTarget = lastMoveData.enPassantTarget;
  currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
  gameOver = false;
  
  // Update last move for highlighting
  lastMove = moveHistory.length > 0 ? {
    from: moveHistory[moveHistory.length - 1].from,
    to: moveHistory[moveHistory.length - 1].to
  } : null;
  
  createBoard();
  updateMoveHistory();
}

// Initialize UI state
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mainMenu').style.display = 'block';
  document.getElementById('gameArea').style.display = 'none';
});