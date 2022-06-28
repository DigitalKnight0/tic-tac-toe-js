const GameBoard = (function(){
    const board = ['', '', '', '', '', '', '', '', '']
    const combos = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]]

    function getBoard(){
        return board
    }

    function getSpotStatus(index){
        return board[index] === ''
    }

    function markBoard(marker, index){
        if(board[index] !== '') return
        board[index] = marker
    }

    function _matchPattern(fragment){
        if(fragment.length < 3) return false
        return fragment.every(entry => entry === fragment[0])
    }

    function checkWin(){
        let winState = false
        combos.forEach(combo => {
            let boardFragment = board.filter((entry, index) => entry !== '' && combo.includes(index))
            if(_matchPattern(boardFragment)){
                winState = true
            }
        })
        return winState
    }

    function checkDraw(){
        return board.every(entry => entry !== '')
    }

    function resetBoard(){
        board.fill('')
    }

    return{
        getBoard,
        markBoard,
        checkWin,
        checkDraw,
        resetBoard,
        getSpotStatus
    }
})()

const Player = (marker, name) => {
    let score = 0
    function addScore(){score++}
    function getScore(){return score}
    function resetScore(){score = 0}
    return {marker, name, addScore, getScore, resetScore}
}

const Bot = (mark, bname) => {
    const prototype = Player(mark, bname)
    
    function getRandomChoice(board){
        const emptySpots = board.map((entry, index) => index).filter(spot => board[spot] === '')
        const randomNumber = Math.floor(Math.random() * emptySpots.length)
        return emptySpots[randomNumber]
    }

    return Object.assign({}, prototype, {getRandomChoice})
}

const Game = (function(){
    const grid = document.querySelector('.grid');
    let p1
    let p2
    let currentPlayer
    let gameMode;

    (function(){
        grid.addEventListener('click', _handleCellClick)
    })()

    function _refreshGrid(board){
        grid.innerHTML = ''
        board.forEach((entry, index) => {
            const cell = document.createElement('div')
            cell.textContent = entry
            cell.setAttribute('data-index', index)
            grid.appendChild(cell)
        })
    }

    function _getMarker(){
        currentPlayer = currentPlayer === p1 ? p2 : p1
        if(gameMode === 'pvb') return p1.marker
        return currentPlayer.marker
    }

    function _makeBotMove(e){
        if(gameMode !== 'pvb') return
        const randomIndex = p2.getRandomChoice(GameBoard.getBoard())
        GameBoard.markBoard(p2.marker, randomIndex)
        if(GameBoard.checkWin()) _handleWin()
    }

    function _handleCellClick(e){
        if(!e.target.hasAttribute('data-index')) return
        const index = Number(e.target.getAttribute('data-index'))
        if(!GameBoard.getSpotStatus(index)) return
        const marker = _getMarker()
        GameBoard.markBoard(marker, index)
        _makeBotMove(e)
        _refreshGrid(GameBoard.getBoard())
        if(GameBoard.checkWin()) _handleWin()
        else if(GameBoard.checkDraw()) _handleDraw()
    }

    function _handleWin(){
        if(p1.getScore() < 4 && p2.getScore() < 4){
            _newRound()
            return
        }
        grid.removeEventListener('click', _handleCellClick)
        let winner = p1.getScore() > p2.getScore() ? p1 : p2
        document.querySelector('.winner').textContent = `${winner.name} has won the game!`
    }

    function _newRound(){
        if(currentPlayer) currentPlayer.addScore()
        document.querySelector('.p1').textContent = `${p1.name}'s Score: ${p1.getScore()}`
        document.querySelector('.p2').textContent = `${p2.name}'s Score: ${p2.getScore()}`
        GameBoard.resetBoard()
        _refreshGrid(GameBoard.getBoard())
        currentPlayer = p2
    }

    function _handleDraw(){
        GameBoard.resetBoard()
        _refreshGrid(GameBoard.getBoard())
        currentPlayer = p2
    }

    function initGame(p1Marker, p2Marker, gameType){
        if(gameType === 'pvp'){
            p1 = Player(p1Marker ,'Player 1')
            p2 = Player(p2Marker ,'Player 2')
        } else {
            p1 = Player(p1Marker ,'Human')
            p2 = Bot(p2Marker ,'Bot')
        }
        gameMode = gameType
        _newRound()
    }

    function resetGame(){
        p1.resetScore()
        p2.resetScore()
        _newRound()
    }

    return {
        initGame,
        resetGame
    }
})()

Game.initGame('X', 'O', 'pvp')



