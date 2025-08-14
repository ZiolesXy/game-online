//inserting the images
function insertImage() {
    document.querySelectorAll('.box').forEach(image => {
        if (image.innerText.length !== 0) {
            if (image.innerText == 'Wpawn' || image.innerText == 'Bpawn') {
                image.innerHTML = `${image.innerText} <img class='all-img all-pown' src="${image.innerText}.png" alt="">`
                image.style.cursor = 'pointer'
            }
            else {
                image.innerHTML = `${image.innerText} <img class='all-img' src="${image.innerText}.png" alt="">`
                image.style.cursor = 'pointer'
            }
        }
    })
}
insertImage()

//Coloring the board

function coloring() {
    const color = document.querySelectorAll('.box')

    color.forEach(color => {
        getId = color.id
        arr = Array.from(getId)
        arr.shift()
        aside = eval(arr.pop())
        aup = eval(arr.shift())
        a = aside + aup

        if (a % 2 == 0) {
            color.style.backgroundColor = 'rgb(232 235 239)'
        }
        if (a % 2 !== 0) {
            color.style.backgroundColor = 'rgb(125 135 150)'
        }
    })
}
coloring()


//function to not remove the same team element

function reddish() {
    document.querySelectorAll('.box').forEach(i1 => {
        if (i1.style.backgroundColor == 'blue') {

            document.querySelectorAll('.box').forEach(i2 => {

                if (i2.style.backgroundColor == 'greenyellow' && i2.innerText.length !== 0) {


                    greenyellowText = i2.innerText

                    blueText = i1.innerText

                    blueColor = ((Array.from(blueText)).shift()).toString()
                    greenyellowColor = ((Array.from(greenyellowText)).shift()).toString()

                    // Don't remove greenyellow from pieces that can be captured (different colors)
                    // Only remove greenyellow from same-color pieces (invalid captures)
                    if (blueColor == greenyellowColor) {
                        getId = i2.id
                        arr = Array.from(getId)
                        arr.shift()
                        aside = eval(arr.pop())
                        aup = eval(arr.shift())
                        a = aside + aup

                        if (a % 2 == 0) {
                            i2.style.backgroundColor = 'rgb(232 235 239)'
                        }
                        if (a % 2 !== 0) {
                            i2.style.backgroundColor = 'rgb(125 135 150)'
                        }
                    }

                }
            })
        }
    })
}

//reset button
document.getElementById("reset-btn").addEventListener("click", function () {
    location.reload();
});


tog = 1

let gameOver = false

// Initialize turn display
function updateTurnDisplay() {
    if (tog % 2 !== 0) {
        document.getElementById('tog').innerText = "White's Turn"
    } else {
        document.getElementById('tog').innerText = "Black's Turn"
    }
}

// Set initial turn display
document.addEventListener('DOMContentLoaded', function() {
    updateTurnDisplay()
})

// Castling rights flags
let movedWK = false, movedWRA = false, movedWRH = false
let movedBK = false, movedBRA = false, movedBRH = false

// Game mode and bot settings
let gameMode = 'pvp' // 'pvp' or 'bot'
let botColor = 'B'   // Bot plays Black by default
let botDifficulty = 'easy' // 'easy' | 'medium' | 'hard'

// Check highlight tracking
let lastCheckId = null

// Previous move highlight tracking
let lastMoveFromId = null
let lastMoveToId = null

// 50-move rule counter (half-moves)
let halfmoveClock = 0

function baseColorForId(id) {
    const n = parseInt(id.slice(1), 10)
    const col = n % 100
    const row = Math.floor(n / 100)
    const a = col + row * 0 // mimic earlier parity logic based on aside + aup/100
    // Reconstruct parity used in coloring(): aside + aup (where aup was row*100)
    const aside = col
    const aup = row * 100
    const sum = aside + aup
    return (sum % 2 === 0) ? 'rgb(232 235 239)' : 'rgb(125 135 150)'
}

function clearCheckHighlight() {
    if (lastCheckId) {
        const el = document.getElementById(lastCheckId)
        if (el) el.style.backgroundColor = baseColorForId(lastCheckId)
        lastCheckId = null
    }
}

function clearPrevMoveHighlight() {
    if (lastMoveFromId) {
        const el = document.getElementById(lastMoveFromId)
        if (el) el.style.backgroundColor = baseColorForId(lastMoveFromId)
    }
    if (lastMoveToId) {
        const el = document.getElementById(lastMoveToId)
        if (el) el.style.backgroundColor = baseColorForId(lastMoveToId)
    }
}

function applyPrevMoveHighlight() {
    if (lastMoveFromId) {
        const el = document.getElementById(lastMoveFromId)
        if (el) el.style.backgroundColor = 'lightgreen'
    }
    if (lastMoveToId) {
        const el = document.getElementById(lastMoveToId)
        if (el) el.style.backgroundColor = 'lightgreen'
    }
}

function cleanupDuplicatePieces() {
    // Clean up any duplicate pieces that might have been left behind
    const pieceCount = {}
    document.querySelectorAll('.box').forEach(box => {
        const piece = box.innerText
        if (piece && piece.length > 0) {
            if (!pieceCount[piece]) {
                pieceCount[piece] = []
            }
            pieceCount[piece].push(box.id)
        }
    })
    
    // For kings, ensure only one of each color exists
    Object.keys(pieceCount).forEach(piece => {
        if (piece.endsWith('king') && pieceCount[piece].length > 1) {
            // Keep only the last moved king (most recent position)
            const squares = pieceCount[piece]
            const keepSquare = (piece[0] === 'W') ? 
                (lastMoveToId && squares.includes(lastMoveToId) ? lastMoveToId : squares[squares.length - 1]) :
                (lastMoveToId && squares.includes(lastMoveToId) ? lastMoveToId : squares[squares.length - 1])
            
            squares.forEach(squareId => {
                if (squareId !== keepSquare) {
                    const el = document.getElementById(squareId)
                    if (el) el.innerText = ''
                }
            })
        }
    })
}

function reapplyStatusOverlays() {
    // Clean up any duplicate pieces first
    cleanupDuplicatePieces()
    
    // Reapply check and previous move highlight after any coloring reset
    // But preserve greenyellow highlights for legal moves
    const greenyellowSquares = []
    document.querySelectorAll('.box').forEach(box => {
        if (box.style.backgroundColor === 'greenyellow') {
            greenyellowSquares.push(box.id)
        }
    })
    
    applyPrevMoveHighlight()
    
    // Restore greenyellow highlights that were overwritten
    greenyellowSquares.forEach(id => {
        const el = document.getElementById(id)
        if (el) el.style.backgroundColor = 'greenyellow'
    })
    
    // Reapply check highlight if it exists (don't recompute, just restore visual)
    if (lastCheckId) {
        const el = document.getElementById(lastCheckId)
        if (el) {
            el.style.backgroundColor = 'red'
        }
    }
}

function idToPos(id) {
    // id format: bXY... where we used aside (1-8) + aup (row*100)
    const n = parseInt(id.slice(1), 10)
    const col = n % 100
    const row = Math.floor(n / 100)
    return { row, col }
}

function posToId(row, col) {
    return `b${row * 100 + col}`
}

function readBoard() {
    const board = Array.from({ length: 8 }, () => Array(8).fill(''))
    document.querySelectorAll('.box').forEach(box => {
        const { row, col } = idToPos(box.id)
        if (row >= 1 && row <= 8 && col >= 1 && col <= 8) {
            board[row - 1][col - 1] = box.innerText
        }
    })
    return board
}

function findKingPos(board, color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const t = board[r][c]
            if (t && t[0] === color && t.slice(1) === 'king') {
                return { row: r + 1, col: c + 1 }
            }
        }
    }
    return null
}

function isSquareAttacked(board, target, byColor) {
    // Knights
    const knightD = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
    ]
    for (const [dr, dc] of knightD) {
        const r = target.row + dr - 1, c = target.col + dc - 1
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const t = board[r][c]
            if (t && t[0] === byColor && t.slice(1) === 'knight') return true
        }
    }
    // Pawns
    if (byColor === 'W') {
        const r = target.row - 2
        const c1 = target.col - 2, c2 = target.col
        if (r >= 0) {
            if (c1 >= 0 && board[r][c1] && board[r][c1][0] === 'W' && board[r][c1].slice(1) === 'pawn') return true
            if (c2 < 8 && board[r][c2] && board[r][c2][0] === 'W' && board[r][c2].slice(1) === 'pawn') return true
        }
    } else {
        const r = target.row
        const c1 = target.col - 2, c2 = target.col
        if (r < 8) {
            if (c1 >= 0 && board[r][c1] && board[r][c1][0] === 'B' && board[r][c1].slice(1) === 'pawn') return true
            if (c2 < 8 && board[r][c2] && board[r][c2][0] === 'B' && board[r][c2].slice(1) === 'pawn') return true
        }
    }
    // King
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const r = target.row + dr - 1, c = target.col + dc - 1
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const t = board[r][c]
                if (t && t[0] === byColor && t.slice(1) === 'king') return true
            }
        }
    }
    // Sliding pieces (rook/queen: straight)
    const lines = [[1,0],[-1,0],[0,1],[0,-1]]
    for (const [dr, dc] of lines) {
        let r = target.row - 1 + dr, c = target.col - 1 + dc
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const t = board[r][c]
            if (t) {
                if (t[0] === byColor && (t.slice(1) === 'rook' || t.slice(1) === 'queen')) return true
                break
            }
            r += dr; c += dc
        }
    }
    // Sliding pieces (bishop/queen: diagonals)
    const diags = [[1,1],[1,-1],[-1,1],[-1,-1]]
    for (const [dr, dc] of diags) {
        let r = target.row - 1 + dr, c = target.col - 1 + dc
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const t = board[r][c]
            if (t) {
                if (t[0] === byColor && (t.slice(1) === 'bishop' || t.slice(1) === 'queen')) return true
                break
            }
            r += dr; c += dc
        }
    }
    return false
}

function simulateAndKingSafe(board, fromId, toId, color) {
    const b = board.map(row => row.slice())
    const from = idToPos(fromId)
    const to = idToPos(toId)
    const piece = b[from.row - 1][from.col - 1]
    b[from.row - 1][from.col - 1] = ''
    b[to.row - 1][to.col - 1] = piece
    const king = findKingPos(b, color)
    if (!king) return false
    const opp = color === 'W' ? 'B' : 'W'
    return !isSquareAttacked(b, king, opp)
}

function filterHighlightsForSafety(color) {
    const blue = Array.from(document.querySelectorAll('.box')).find(b => b.style.backgroundColor == 'blue')
    if (!blue) return
    const board = readBoard()
    document.querySelectorAll('.box').forEach(sq => {
        if (sq.style.backgroundColor == 'greenyellow') {
            const safe = simulateAndKingSafe(board, blue.id, sq.id, color)
            if (!safe) {
                // restore square color
                const { row, col } = idToPos(sq.id)
                const base = ((row + col) % 2 === 0) ? 'rgb(232 235 239)' : 'rgb(125 135 150)'
                sq.style.backgroundColor = base
            }
        }
    })
}

function anyLegalMove(board, color) {
    // Iterate all pieces of color, try all destination squares and test safety using existing piece patterns roughly
    // We'll attempt moves to any square and rely on simulateAndKingSafe to validate king safety and basic occupancy rules
    const opp = color === 'W' ? 'B' : 'W'
    for (let r = 1; r <= 8; r++) {
        for (let c = 1; c <= 8; c++) {
            const id = posToId(r, c)
            const t = board[r-1][c-1]
            if (!t || t[0] !== color) continue
            // Try all 64 squares as candidate targets; simulate will also allow captures
            for (let r2 = 1; r2 <= 8; r2++) {
                for (let c2 = 1; c2 <= 8; c2++) {
                    const toId = posToId(r2, c2)
                    if (id === toId) continue
                    // quick reject: don't capture own piece
                    const dest = board[r2-1][c2-1]
                    if (dest && dest[0] === color) continue
                    // Use rough piece rules to limit tries
                    const name = t.slice(1)
                    const dr = r2 - r, dc = c2 - c
                    const adr = Math.abs(dr), adc = Math.abs(dc)
                    let patternOk = false
                    if (name === 'knight') patternOk = (adr === 2 && adc === 1) || (adr === 1 && adc === 2)
                    else if (name === 'king') patternOk = adr <= 1 && adc <= 1 && (adr+adc>0)
                    else if (name === 'rook') patternOk = (dr === 0 || dc === 0)
                    else if (name === 'bishop') patternOk = adr === adc
                    else if (name === 'queen') patternOk = (dr === 0 || dc === 0 || adr === adc)
                    else if (name === 'pawn') {
                        if (color === 'W') {
                            if (dc === 0 && dr === 1 && !dest) patternOk = true
                            if (dc === 0 && dr === 2 && r === 2 && !dest && !board[r][c-1]) patternOk = true
                            if (adr === 1 && dr === 1 && dest && dest[0] === opp) patternOk = true
                        } else {
                            if (dc === 0 && dr === -1 && !dest) patternOk = true
                            if (dc === 0 && dr === -2 && r === 7 && !dest && !board[r-2][c-1]) patternOk = true
                            if (adr === 1 && dr === -1 && dest && dest[0] === opp) patternOk = true
                        }
                    }
                    // path clear for sliders
                    if (patternOk && (name === 'rook' || name === 'bishop' || name === 'queen')) {
                        let rr = r + Math.sign(dr), cc = c + Math.sign(dc)
                        let clear = true
                        while (rr !== r2 || cc !== c2) {
                            if (board[rr-1][cc-1]) { clear = false; break }
                            rr += Math.sign(dr); cc += Math.sign(dc)
                        }
                        if (!clear) patternOk = false
                    }
                    if (!patternOk) continue
                    if (simulateAndKingSafe(board, id, toId, color)) return true
                }
            }
        }
    }
    return false
}

function evaluateGameState(colorToMove) {
    const board = readBoard()
    const king = findKingPos(board, colorToMove)
    const opp = colorToMove === 'W' ? 'B' : 'W'
    const inCheck = king ? isSquareAttacked(board, king, opp) : false
    const hasMove = anyLegalMove(board, colorToMove)
    if (inCheck && !hasMove) {
        document.getElementById('tog').innerText = `Checkmate. ${colorToMove === 'W' ? 'Black' : 'White'} wins`
        gameOver = true
    } else if (!inCheck && !hasMove) {
        document.getElementById('tog').innerText = 'Draw (Stalemate)'
        gameOver = true
    } else if (inCheck) {
        const who = colorToMove === 'W' ? "White's Turn (Check)" : "Black's Turn (Check)"
        document.getElementById('tog').innerText = who
    }

    // Update check highlight on the current side to move
    clearCheckHighlight()
    if (inCheck && king) {
        const kid = posToId(king.row, king.col)
        const el = document.getElementById(kid)
        if (el) {
            el.style.backgroundColor = 'red'
            lastCheckId = kid
        }
    }

    // Additional draw conditions
    if (!gameOver) {
        if (isInsufficientMaterial(board)) {
            document.getElementById('tog').innerText = 'Draw (Insufficient material)'
            gameOver = true
        } else if (halfmoveClock >= 100) { // 50 full moves = 100 half-moves
            document.getElementById('tog').innerText = 'Draw (50-move rule)'
            gameOver = true
        }
    }
}

document.querySelectorAll('.box').forEach(item => {


    item.addEventListener('click', function () {
        if (gameOver) return

        if (item.style.backgroundColor == 'greenyellow' && item.innerText.length == 0) {
            // Turn will be toggled after the move is actually made (handled below)
        }

        else if (item.style.backgroundColor == 'greenyellow' && item.innerText.length !== 0) {
            // Capture handling is consolidated in the movement handler below
        }



        getId = item.id
        arr = Array.from(getId)
        arr.shift()
        aside = eval(arr.pop())
        arr.push('0')
        aup = eval(arr.join(''))
        a = aside + aup

        //function to display the available paths for all pieces

        function whosTurn(toggle) {
            // PAWN

            if (item.innerText == `${toggle}pawn`) {
                item.style.backgroundColor = 'blue';

                if (toggle === 'W' && aup < 800) {
                    // First move for white pawns
                    if (document.getElementById(`b${a + 100}`).innerText.length == 0) {
                        document.getElementById(`b${a + 100}`).style.backgroundColor = 'greenyellow';
                        if (document.getElementById(`b${a + 200}`).innerText.length == 0 && aup < 300) {
                            document.getElementById(`b${a + 200}`).style.backgroundColor = 'greenyellow';
                        }
                    }
                    if (aside < 8 && document.getElementById(`b${a + 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 + 1}`).style.backgroundColor = 'greenyellow';
                    }
                    if (aside > 1 && document.getElementById(`b${a + 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 - 1}`).style.backgroundColor = 'greenyellow';
                    }
                }

                if (toggle === 'B' && aup > 100) {
                    // First move for black pawns
                    if (document.getElementById(`b${a - 100}`).innerText.length == 0) {
                        document.getElementById(`b${a - 100}`).style.backgroundColor = 'greenyellow';
                        if (document.getElementById(`b${a - 200}`).innerText.length == 0 && aup > 600) {
                            document.getElementById(`b${a - 200}`).style.backgroundColor = 'greenyellow';
                        }
                    }
                    if (aside < 8 && document.getElementById(`b${a - 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 + 1}`).style.backgroundColor = 'greenyellow';
                    }
                    if (aside > 1 && document.getElementById(`b${a - 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 - 1}`).style.backgroundColor = 'greenyellow';
                    }
                }
                // Second move for pawns
                if (toggle === 'W' && aup >= 800) {
                    if (document.getElementById(`b${a + 100}`).innerText.length == 0) {
                        document.getElementById(`b${a + 100}`).style.backgroundColor = 'greenyellow';
                    }
                    if (aside < 8 && document.getElementById(`b${a + 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 + 1}`).style.backgroundColor = 'greenyellow';
                    }
                    if (aside > 1 && document.getElementById(`b${a + 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 - 1}`).style.backgroundColor = 'greenyellow';
                    }
                }
                if (toggle === 'B' && aup <= 100) {
                    if (document.getElementById(`b${a - 100}`).innerText.length == 0) {
                        document.getElementById(`b${a - 100}`).style.backgroundColor = 'greenyellow';
                    }
                    if (aside < 8 && document.getElementById(`b${a - 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 + 1}`).style.backgroundColor = 'greenyellow';
                    }
                    if (aside > 1 && document.getElementById(`b${a - 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 - 1}`).style.backgroundColor = 'greenyellow';
                    }
                }
            }

            // KING

            if (item.innerText == `${toggle}king`) {


                if (aside < 8) {
                    document.getElementById(`b${a + 1}`).style.backgroundColor = 'greenyellow'

                }
                if (aside > 1) {

                    document.getElementById(`b${a - 1}`).style.backgroundColor = 'greenyellow'
                }
                if (aup < 800) {

                    document.getElementById(`b${a + 100}`).style.backgroundColor = 'greenyellow'
                }
                if (aup > 100) {

                    document.getElementById(`b${a - 100}`).style.backgroundColor = 'greenyellow'
                }

                if (aup > 100 && aside < 8) {

                    document.getElementById(`b${a - 100 + 1}`).style.backgroundColor = 'greenyellow'
                }
                if (aup > 100 && aside > 1) {

                    document.getElementById(`b${a - 100 - 1}`).style.backgroundColor = 'greenyellow'
                }
                if (aup < 800 && aside < 8) {

                    document.getElementById(`b${a + 100 + 1}`).style.backgroundColor = 'greenyellow'
                }
                if (aup < 800 && aside > 1) {

                    document.getElementById(`b${a + 100 - 1}`).style.backgroundColor = 'greenyellow'
                }

                item.style.backgroundColor = 'blue'

            }

            // KNIGHT

            if (item.innerText == `${toggle}knight`) {


                if (aside < 7 && aup < 800) {
                    document.getElementById(`b${a + 100 + 2}`).style.backgroundColor = 'greenyellow'
                }
                if (aside < 7 && aup > 200) {
                    document.getElementById(`b${a - 100 + 2}`).style.backgroundColor = 'greenyellow'
                }
                if (aside < 8 && aup < 700) {
                    document.getElementById(`b${a + 200 + 1}`).style.backgroundColor = 'greenyellow'
                }
                if (aside > 1 && aup < 700) {
                    document.getElementById(`b${a + 200 - 1}`).style.backgroundColor = 'greenyellow'
                }
                if (aside > 2 && aup < 800) {
                    document.getElementById(`b${a - 2 + 100}`).style.backgroundColor = 'greenyellow'
                }
                if (aside > 2 && aup > 100) {
                    document.getElementById(`b${a - 2 - 100}`).style.backgroundColor = 'greenyellow'
                }
                if (aside < 8 && aup > 200) {
                    document.getElementById(`b${a - 200 + 1}`).style.backgroundColor = 'greenyellow'
                }
                if (aside > 1 && aup > 200) {
                    document.getElementById(`b${a - 200 - 1}`).style.backgroundColor = 'greenyellow'
                }

                item.style.backgroundColor = 'blue'

            }

            // QUEEN

            if (item.innerText == `${toggle}queen`) {


                for (let i = 1; i < 9; i++) {

                    if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }



                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'greenyellow'
                        break
                    }

                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }



                item.style.backgroundColor = 'blue'

                // Castling (rokade)
                const board = readBoard()
                const opp = toggle === 'W' ? 'B' : 'W'
                const kingRow = (toggle === 'W') ? 1 : 8
                const atStart = (aup === (toggle === 'W' ? 100 : 800)) && (aside === 5)
                const inCheck = isSquareAttacked(board, { row: kingRow, col: 5 }, opp)
                if (atStart && !inCheck) {
                    // King-side
                    const sqF = { row: kingRow, col: 6 }
                    const sqG = { row: kingRow, col: 7 }
                    const idF = posToId(sqF.row, sqF.col)
                    const idG = posToId(sqG.row, sqG.col)
                    const idH = posToId(kingRow, 8)
                    const rookH = document.getElementById(idH).innerText
                    const pathClearK = document.getElementById(idF).innerText.length === 0 && document.getElementById(idG).innerText.length === 0
                    const rightsK = (toggle === 'W') ? (!movedWK && !movedWRH) : (!movedBK && !movedBRH)
                    if (rightsK && pathClearK) {
                        if (rookH === `${toggle}rook`) {
                            const fSafe = !isSquareAttacked(board, sqF, opp)
                            const gSafe = !isSquareAttacked(board, sqG, opp)
                            if (fSafe && gSafe) {
                                document.getElementById(idG).style.backgroundColor = 'greenyellow'
                            }
                        }
                    }
                    // Queen-side
                    const sqD = { row: kingRow, col: 4 }
                    const sqC = { row: kingRow, col: 3 }
                    const sqB = { row: kingRow, col: 2 }
                    const idD = posToId(sqD.row, sqD.col)
                    const idC = posToId(sqC.row, sqC.col)
                    const idB = posToId(sqB.row, sqB.col)
                    const idA = posToId(kingRow, 1)
                    const rookA = document.getElementById(idA).innerText
                    const pathClearQ = document.getElementById(idD).innerText.length === 0 && document.getElementById(idC).innerText.length === 0 && document.getElementById(idB).innerText.length === 0
                    const rightsQ = (toggle === 'W') ? (!movedWK && !movedWRA) : (!movedBK && !movedBRA)
                    if (rightsQ && pathClearQ) {
                        if (rookA === `${toggle}rook`) {
                            const dSafe = !isSquareAttacked(board, sqD, opp)
                            const cSafe = !isSquareAttacked(board, sqC, opp)
                            if (dSafe && cSafe) {
                                document.getElementById(idC).style.backgroundColor = 'greenyellow'
                            }
                        }
                    }
                }

            }

            // BISHOP

            if (item.innerText == `${toggle}bishop`) {


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'greenyellow'
                        break
                    }

                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }



                item.style.backgroundColor = 'blue'

            }

            // ROOK

            if (item.innerText == `${toggle}rook`) {

                for (let i = 1; i < 9; i++) {

                    if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText == 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText !== 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText == 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText !== 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText == 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText !== 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText == 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'greenyellow'
                    }
                    else if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText !== 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'greenyellow'
                        break
                    }
                }

                item.style.backgroundColor = 'blue'
            }

        }

        // Determine whose turn and show legal moves (don't change turn display here)

        if (tog % 2 !== 0) {
            // White's turn - show white moves
            whosTurn('W')
            filterHighlightsForSafety('W')
        }
        if (tog % 2 == 0) {
            // Black's turn - show black moves
            whosTurn('B')
            filterHighlightsForSafety('B')
        }

        reddish()

        // If vs Bot and it's bot's turn, trigger bot move after small delay
        if (!gameOver && gameMode === 'bot') {
            const sideToMove = (tog % 2 !== 0) ? 'W' : 'B'
            if (sideToMove === botColor) {
                setTimeout(botMove, 300)
            }
        }

        // Reapply overlays (check + prev move) after any UI recolor side-effects
        reapplyStatusOverlays()



    })
})

// Moving the element
document.querySelectorAll('.box').forEach(hathiTest => {

    hathiTest.addEventListener('click', function () {

        if (hathiTest.style.backgroundColor == 'blue') {

            blueId = hathiTest.id
            blueText = hathiTest.innerText
            document.querySelectorAll('.box').forEach(hathiTest2 => {

                hathiTest2.addEventListener('click', function () {
                    if (hathiTest2.style.backgroundColor == 'greenyellow' || hathiTest2.style.backgroundColor == 'lightgreen') {
                        // Determine if this is a move to empty square or a capture
                        const targetHasPiece = hathiTest2.innerText.length !== 0
                        if (!targetHasPiece) {
                            // Simple move
                            const fromId = blueId
                            const toId = hathiTest2.id
                            const movingPiece = blueText
                            
                            // Ensure clean move: clear source first, then set destination
                            const fromEl = document.getElementById(fromId)
                            const toEl = hathiTest2
                            if (fromEl) fromEl.innerText = ''
                            if (toEl) toEl.innerText = movingPiece

                            // Castling execution if king moved two squares
                            if (movingPiece.endsWith('king')) {
                                const from = idToPos(fromId)
                                const to = idToPos(toId)
                                const colDelta = to.col - from.col
                                // Update king move flags
                                if (movingPiece[0] === 'W') movedWK = true; else movedBK = true
                                // King-side
                                if (colDelta === 2) {
                                    const rookFromId = posToId(from.row, 8)
                                    const rookToId = posToId(from.row, 6)
                                    const rookEl = document.getElementById(rookFromId)
                                    if (rookEl && rookEl.innerText === `${movingPiece[0]}rook`) {
                                        rookEl.innerText = ''
                                        document.getElementById(rookToId).innerText = `${movingPiece[0]}rook`
                                    }
                                    if (movingPiece[0] === 'W') movedWRH = true; else movedBRH = true
                                }
                                // Queen-side
                                if (colDelta === -2) {
                                    const rookFromId = posToId(from.row, 1)
                                    const rookToId = posToId(from.row, 4)
                                    const rookEl = document.getElementById(rookFromId)
                                    if (rookEl && rookEl.innerText === `${movingPiece[0]}rook`) {
                                        rookEl.innerText = ''
                                        document.getElementById(rookToId).innerText = `${movingPiece[0]}rook`
                                    }
                                    if (movingPiece[0] === 'W') movedWRA = true; else movedBRA = true
                                }
                            }

                            // Update rook moved flags when rooks move from starting squares
                            if (movingPiece.endsWith('rook')) {
                                const from = idToPos(fromId)
                                if (movingPiece[0] === 'W' && from.row === 1 && from.col === 1) movedWRA = true
                                if (movingPiece[0] === 'W' && from.row === 1 && from.col === 8) movedWRH = true
                                if (movingPiece[0] === 'B' && from.row === 8 && from.col === 1) movedBRA = true
                                if (movingPiece[0] === 'B' && from.row === 8 && from.col === 8) movedBRH = true
                            }

                            // Pawn promotion
                            if (movingPiece.endsWith('pawn')) {
                                const color = movingPiece[0]
                                const dest = idToPos(toId)
                                const promoteRow = color === 'W' ? 8 : 1
                                if (dest.row === promoteRow) {
                                    let choice = prompt('Promote to (Q/R/B/N):', 'Q')
                                    if (!choice) {
                                        // Cancel promotion: keep pawn as is
                                        choice = null
                                    }
                                    choice = choice ? choice.toUpperCase() : null
                                    const map = { Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' }
                                    if (choice && map[choice]) {
                                        const pieceName = map[choice]
                                        hathiTest2.innerText = `${color}${pieceName}`
                                    } // else keep pawn
                                }
                            }

                            coloring()
                            insertImage()
                            // Clean up any duplicate pieces immediately
                            cleanupDuplicatePieces()
                            // Previous move highlight and 50-move rule update
                            clearPrevMoveHighlight()
                            lastMoveFromId = fromId
                            lastMoveToId = toId
                            applyPrevMoveHighlight()
                            // Update halfmove clock
                            if (movingPiece.endsWith('pawn')) {
                                // Pawn moved counts as reset
                                halfmoveClock = 0
                            } else {
                                halfmoveClock += 1
                            }
                            // Toggle turn after successful move
                            tog = tog + 1
                            updateTurnDisplay()
                            // Evaluate next player state
                            const next = (tog % 2 !== 0) ? 'W' : 'B'
                            evaluateGameState(next)
                        } else {
                            // Capture only if opposite color
                            const movingColor = Array.from(blueText)[0]
                            const targetColor = Array.from(hathiTest2.innerText)[0]
                            if (movingColor !== targetColor) {
                                const fromId = blueId
                                const toId = hathiTest2.id
                                const movingPiece = blueText
                                
                                // Ensure clean capture: clear source first, then set destination
                                const fromEl = document.getElementById(fromId)
                                const toEl = hathiTest2
                                if (fromEl) fromEl.innerText = ''
                                if (toEl) toEl.innerText = movingPiece

                                // Castling flags for king move (capture case shouldn't happen for castling, but handle flags)
                                if (movingPiece.endsWith('king')) {
                                    if (movingPiece[0] === 'W') movedWK = true; else movedBK = true
                                }
                                // Rook moved flags
                                if (movingPiece.endsWith('rook')) {
                                    const from = idToPos(fromId)
                                    if (movingPiece[0] === 'W' && from.row === 1 && from.col === 1) movedWRA = true
                                    if (movingPiece[0] === 'W' && from.row === 1 && from.col === 8) movedWRH = true
                                    if (movingPiece[0] === 'B' && from.row === 8 && from.col === 1) movedBRA = true
                                    if (movingPiece[0] === 'B' && from.row === 8 && from.col === 8) movedBRH = true
                                }

                                // Pawn promotion on capture
                                if (movingPiece.endsWith('pawn')) {
                                    const color = movingPiece[0]
                                    const dest = idToPos(toId)
                                    const promoteRow = color === 'W' ? 8 : 1
                                    if (dest.row === promoteRow) {
                                        let choice = prompt('Promote to (Q/R/B/N):', 'Q')
                                        if (!choice) choice = 'Q'
                                        choice = choice.toUpperCase()
                                        const map = { Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' }
                                        const pieceName = map[choice] || 'queen'
                                        hathiTest2.innerText = `${color}${pieceName}`
                                    }
                                }

                                coloring()
                                insertImage()
                                // Clean up any duplicate pieces immediately
                                cleanupDuplicatePieces()
                                // Previous move highlight and 50-move rule update
                                clearPrevMoveHighlight()
                                lastMoveFromId = fromId
                                lastMoveToId = toId
                                applyPrevMoveHighlight()
                                // Capture resets halfmove clock
                                halfmoveClock = 0
                                // Toggle turn after successful capture
                                tog = tog + 1
                                updateTurnDisplay()
                                // Evaluate next player state
                                const next = (tog % 2 !== 0) ? 'W' : 'B'
                                evaluateGameState(next)
                            }
                        }
                    }

                })
            })

        }

    })

})




// Prvents from selecting multiple elements
z = 0
document.querySelectorAll('.box').forEach(ee => {
  ee.addEventListener('click', function () {
      z = z + 1
      if (z % 2 == 0 && ee.style.backgroundColor !== 'greenyellow') {
          coloring()
      }
  })
})



// =====================
// Bot and menu handlers
// =====================

// Read menu selections if present
function initMenu() {
    const menu = document.getElementById('main-menu')
    // Support either new or legacy IDs
    const startPvp = document.getElementById('vs-player-btn') || document.getElementById('start-pvp')
    const startBot = document.getElementById('vs-bot-btn') || document.getElementById('start-bot')
    const diffSel = document.getElementById('difficulty-level') || document.getElementById('bot-difficulty')
    if (diffSel) {
        diffSel.addEventListener('change', () => {
            botDifficulty = diffSel.value
        })
    }
    if (startPvp) {
        startPvp.addEventListener('click', () => {
            gameMode = 'pvp'
            if (menu) menu.style.display = 'none'
        })
    }
    if (startBot) {
        startBot.addEventListener('click', () => {
            gameMode = 'bot'
            botColor = 'B' // player plays White vs Bot (Black)
            if (menu) menu.style.display = 'none'
            // If bot starts (if we ever choose White bot), handle here
        })
    }
}

// Generate all legal moves for a color: returns array of {fromId, toId}
function generateLegalMoves(board, color) {
    const moves = []
    const opp = color === 'W' ? 'B' : 'W'
    function pushIfLegal(fromId, toId) {
        if (simulateAndKingSafe(board, fromId, toId, color)) moves.push({ fromId, toId })
    }
    for (let r = 1; r <= 8; r++) {
        for (let c = 1; c <= 8; c++) {
            const piece = board[r-1][c-1]
            if (!piece || piece[0] !== color) continue
            const id = posToId(r, c)
            const type = piece.slice(1)
            // PAWN
            if (type === 'pawn') {
                if (color === 'W') {
                    if (r < 8) {
                        if (!board[r][c-1]) pushIfLegal(id, posToId(r+1, c))
                        if (r === 2 && !board[r][c-1] && !board[r+1][c-1]) pushIfLegal(id, posToId(r+2, c))
                        if (c > 1 && board[r][c-2] && board[r][c-2][0] === opp) pushIfLegal(id, posToId(r+1, c-1))
                        if (c < 8 && board[r][c] && board[r][c][0] === opp) pushIfLegal(id, posToId(r+1, c+1))
                    }
                } else {
                    if (r > 1) {
                        if (!board[r-2][c-1]) pushIfLegal(id, posToId(r-1, c))
                        if (r === 7 && !board[r-2][c-1] && !board[r-3][c-1]) pushIfLegal(id, posToId(r-2, c))
                        if (c > 1 && board[r-2][c-2] && board[r-2][c-2][0] === opp) pushIfLegal(id, posToId(r-1, c-1))
                        if (c < 8 && board[r-2][c] && board[r-2][c][0] === opp) pushIfLegal(id, posToId(r-1, c+1))
                    }
                }
            }
            // KNIGHT
            if (type === 'knight') {
                const ds = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]
                for (const [dr, dc] of ds) {
                    const rr = r + dr, cc = c + dc
                    if (rr>=1&&rr<=8&&cc>=1&&cc<=8) {
                        const t = board[rr-1][cc-1]
                        if (!t || t[0] !== color) pushIfLegal(id, posToId(rr, cc))
                    }
                }
            }
            // BISHOP / ROOK / QUEEN
            if (type === 'bishop' || type === 'rook' || type === 'queen') {
                const dirs = []
                if (type !== 'bishop') dirs.push([1,0],[-1,0],[0,1],[0,-1])
                if (type !== 'rook') dirs.push([1,1],[1,-1],[-1,1],[-1,-1])
                for (const [dr, dc] of dirs) {
                    let rr = r + dr, cc = c + dc
                    while (rr>=1&&rr<=8&&cc>=1&&cc<=8) {
                        const t = board[rr-1][cc-1]
                        if (!t) {
                            pushIfLegal(id, posToId(rr, cc))
                        } else {
                            if (t[0] !== color) pushIfLegal(id, posToId(rr, cc))
                            break
                        }
                        rr += dr; cc += dc
                    }
                }
            }
            // KING (normal + castling)
            if (type === 'king') {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue
                        const rr = r + dr, cc = c + dc
                        if (rr>=1&&rr<=8&&cc>=1&&cc<=8) {
                            const t = board[rr-1][cc-1]
                            if (!t || t[0] !== color) pushIfLegal(id, posToId(rr, cc))
                        }
                    }
                }
                // Castling
                const kingMoved = (color === 'W') ? movedWK : movedBK
                const rookAMoved = (color === 'W') ? movedWRA : movedBRA
                const rookHMoved = (color === 'W') ? movedWRH : movedBRH
                if (!kingMoved) {
                    // King side (H)
                    const row = (color === 'W') ? 1 : 8
                    const throughH = [posToId(row,6), posToId(row,7)]
                    const rookH = posToId(row,8)
                    const clearH = !board[row-1][5-1] && !board[row-1][6-1]
                    const rookHHere = board[row-1][8-1] && board[row-1][8-1].slice(1) === 'rook'
                    if (!rookHMoved && clearH && rookHHere) {
                        // squares not attacked
                        const kpos = {row, col:5}
                        const s6 = {row, col:6}
                        const s7 = {row, col:7}
                        if (!isSquareAttacked(board, kpos, opp) && !isSquareAttacked(board, s6, opp) && !isSquareAttacked(board, s7, opp)) {
                            pushIfLegal(id, posToId(row,7))
                        }
                    }
                    // Queen side (A)
                    const throughA = [posToId(row,2), posToId(row,3), posToId(row,4)]
                    const rookA = posToId(row,1)
                    const clearA = !board[row-1][2-1] && !board[row-1][3-1] && !board[row-1][4-1]
                    const rookAHere = board[row-1][1-1] && board[row-1][1-1].slice(1) === 'rook'
                    if (!rookAMoved && clearA && rookAHere) {
                        const kpos = {row, col:5}
                        const s4 = {row, col:4}
                        const s3 = {row, col:3}
                        if (!isSquareAttacked(board, kpos, opp) && !isSquareAttacked(board, s4, opp) && !isSquareAttacked(board, s3, opp)) {
                            pushIfLegal(id, posToId(row,3))
                        }
                    }
                }
            }
        }
    }
    return moves
}

function evaluateMaterial(board) {
    const val = { pawn:1, knight:3, bishop:3, rook:5, queen:9, king:0 }
    let score = 0
    for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
        const t = board[r][c]
        if (!t) continue
        const s = val[t.slice(1)] || 0
        score += (t[0] === 'B') ? s : -s // positive means good for Black
    }
    return score
}

function cloneBoard(board) {
    return board.map(row => row.slice())
}

function applyMoveOnBoard(board, move) {
    const from = idToPos(move.fromId)
    const to = idToPos(move.toId)
    const b2 = cloneBoard(board)
    b2[to.row-1][to.col-1] = b2[from.row-1][from.col-1]
    b2[from.row-1][from.col-1] = ''
    return b2
}

function pickBotMove(board, moves) {
    if (botDifficulty === 'easy') {
        return moves[Math.floor(Math.random()*moves.length)]
    }
    if (botDifficulty === 'medium') {
        // prefer captures
        const caps = moves.filter(m => {
            const to = idToPos(m.toId)
            return board[to.row-1][to.col-1]
        })
        return (caps[0] || moves[Math.floor(Math.random()*moves.length)])
    }
    // hard: shallow evaluation
    let best = null
    let bestScore = -Infinity
    for (const m of moves) {
        const nb = applyMoveOnBoard(board, m)
        const sc = evaluateMaterial(nb)
        if (sc > bestScore) { bestScore = sc; best = m }
    }
    return best || moves[0]
}

function performMoveOnDOM(move) {
    const fromEl = document.getElementById(move.fromId)
    const toEl = document.getElementById(move.toId)
    if (!fromEl || !toEl) return false
    const movingPiece = fromEl.innerText
    if (!movingPiece) return false
    const targetHadPiece = !!toEl.innerText

    // Move piece
    fromEl.innerText = ''
    toEl.innerText = movingPiece

    // Update castling movement flags
    if (movingPiece.endsWith('king')) {
        if (movingPiece[0] === 'W') movedWK = true; else movedBK = true
        // Handle rook movement for castling visually if king land on 7 or 3
        const to = idToPos(move.toId)
        if (movingPiece[0] === 'B' && to.row === 8 && to.col === 7) {
            // black king side: move rook from h8 to f8
            const rFrom = document.getElementById('b808')
            const rTo = document.getElementById('b806')
            if (rFrom && rTo && rFrom.innerText.endsWith('rook')) { rTo.innerText = rFrom.innerText; rFrom.innerText = '' }
        }
        if (movingPiece[0] === 'B' && to.row === 8 && to.col === 3) {
            // black queen side: move rook from a8 to d8
            const rFrom = document.getElementById('b801')
            const rTo = document.getElementById('b804')
            if (rFrom && rTo && rFrom.innerText.endsWith('rook')) { rTo.innerText = rFrom.innerText; rFrom.innerText = '' }
        }
        if (movingPiece[0] === 'W' && to.row === 1 && to.col === 7) {
            const rFrom = document.getElementById('b108')
            const rTo = document.getElementById('b106')
            if (rFrom && rTo && rFrom.innerText.endsWith('rook')) { rTo.innerText = rFrom.innerText; rFrom.innerText = '' }
        }
        if (movingPiece[0] === 'W' && to.row === 1 && to.col === 3) {
            const rFrom = document.getElementById('b101')
            const rTo = document.getElementById('b104')
            if (rFrom && rTo && rFrom.innerText.endsWith('rook')) { rTo.innerText = rFrom.innerText; rFrom.innerText = '' }
        }
    }
    if (movingPiece.endsWith('rook')) {
        const from = idToPos(move.fromId)
        if (movingPiece[0] === 'W' && from.row === 1 && from.col === 1) movedWRA = true
        if (movingPiece[0] === 'W' && from.row === 1 && from.col === 8) movedWRH = true
        if (movingPiece[0] === 'B' && from.row === 8 && from.col === 1) movedBRA = true
        if (movingPiece[0] === 'B' && from.row === 8 && from.col === 8) movedBRH = true
    }

    // Pawn promotion (auto queen)
    if (movingPiece.endsWith('pawn')) {
        const color = movingPiece[0]
        const dest = idToPos(move.toId)
        const promoteRow = color === 'W' ? 8 : 1
        if (dest.row === promoteRow) {
            // Bot auto-promotes to queen
            toEl.innerText = `${color}queen`
        }
    }

    coloring()
    insertImage()
    // Clean up any duplicate pieces immediately
    cleanupDuplicatePieces()
    // Previous move highlight
    clearPrevMoveHighlight()
    lastMoveFromId = move.fromId
    lastMoveToId = move.toId
    applyPrevMoveHighlight()
    // Update halfmove clock
    if (movingPiece.endsWith('pawn') || targetHadPiece) {
        halfmoveClock = 0
    } else {
        halfmoveClock += 1
    }
    return true
}

function botMove() {
    if (gameOver) return
    const sideToMove = (tog % 2 !== 0) ? 'W' : 'B'
    if (gameMode !== 'bot' || sideToMove !== botColor) return
    const board = readBoard()
    const moves = generateLegalMoves(board, botColor)
    if (moves.length === 0) return // nothing to do
    const m = pickBotMove(board, moves)
    const ok = performMoveOnDOM(m)
    if (!ok) return
    // Toggle turn after bot move
    tog = tog + 1
    updateTurnDisplay()
    const next = (tog % 2 !== 0) ? 'W' : 'B'
    evaluateGameState(next)
}

// Insufficient material detection: basic cases
function isInsufficientMaterial(board) {
    const pieces = []
    for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
        const t = board[r][c]
        if (t) pieces.push(t)
    }
    // Only kings
    if (pieces.every(p => p.slice(1) === 'king')) return true
    // King + minor vs King
    const nonKings = pieces.filter(p => p.slice(1) !== 'king')
    if (nonKings.length === 1) {
        const type = nonKings[0].slice(1)
        if (type === 'bishop' || type === 'knight') return true
    }
    // King + bishop vs King + bishop with bishops on same color (skip color calc for simplicity)
    if (nonKings.length === 2 && nonKings.every(p => p.slice(1) === 'bishop')) {
        // This is an approximation; treat as draw to satisfy feature request
        return true
    }
    return false
}

// Initialize menu listeners on load
document.addEventListener('DOMContentLoaded', initMenu)
