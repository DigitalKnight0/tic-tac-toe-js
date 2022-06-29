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

const Player = (name, marker) => {
    let score = 0
    function addScore(){score++}
    function getScore(){return score}
    function resetScore(){score = 0}
    return {name, marker, addScore, getScore, resetScore}
}

const Bot = (bname, mark) => {
    const prototype = Player(bname, mark)
    
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

    function _refreshGrid(board){
        grid.innerHTML = ''
        board.forEach((entry, index) => {
            const cell = document.createElement('div')
            cell.textContent = entry
            cell.setAttribute('data-index', index)
            grid.appendChild(cell)
        })
    }

    function _makePlayerMove(index){
        GameBoard.markBoard(currentPlayer.marker, index)
        if(GameBoard.checkWin()){
            _handleWin()
            return true
        }
        currentPlayer = currentPlayer === p1 ? p2 : p1
    }

    function _makeBotMove(){
        if(gameMode !== 'pvb') return
        const randomIndex = currentPlayer.getRandomChoice(GameBoard.getBoard())
        GameBoard.markBoard(currentPlayer.marker, randomIndex)
        if(GameBoard.checkWin()){
            _handleWin()
            return
        }
        currentPlayer = currentPlayer === p1 ? p2 : p1
    }

    function _handleCellClick(e){
        if(!e.target.hasAttribute('data-index')) return
        const index = Number(e.target.getAttribute('data-index'))
        if(!GameBoard.getSpotStatus(index)) return 
        if(_makePlayerMove(index)) return
        _makeBotMove()
        _refreshGrid(GameBoard.getBoard())
        if(GameBoard.checkDraw()) _handleDraw()
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
        currentPlayer = p1
        if(p1.name === 'Bot') _makeBotMove()
        _refreshGrid(GameBoard.getBoard())
    }

    function _handleDraw(){
        GameBoard.resetBoard()
        _refreshGrid(GameBoard.getBoard())
        currentPlayer = p1
    }

    function initGame(player1, player2, gameType){
        grid.addEventListener('click', _handleCellClick)
        document.querySelector('.winner').textContent = "Let's Play"
        p1 = player1
        p2 = player2
        gameMode = gameType
        _newRound()
    }

    function resetGame(){
        p1.resetScore()
        p2.resetScore()
        currentPlayer = null
        initGame(p1, p2, gameMode)
    }

    return {
        initGame,
        resetGame
    }
})()

const Display = (function(){
    const startBtn = document.querySelector('.start')
    const pvpBtn = document.querySelector('.pvp')
    const pvbBtn = document.querySelector('.pvb')
    const iconXBtn = document.querySelector('.x')
    const iconOBtn = document.querySelector('.o')
    const resetBtn = document.querySelector('.reset')
    const returnBtn = document.querySelector('.return')
    let gameType

    function _addListeners(){
        startBtn.addEventListener('click', _openModeMenu)
        pvpBtn.addEventListener('click', _openIconMenu)
        pvbBtn.addEventListener('click', _openIconMenu)
        iconXBtn.addEventListener('click', _startGame)
        iconOBtn.addEventListener('click', _startGame)
        resetBtn.addEventListener('click', Game.resetGame)
        returnBtn.addEventListener('click', _returnToMain)
    }

    function _openModeMenu(){
        document.querySelector('.intro').classList.add('hidden')
        document.querySelector('.mode-select').classList.remove('hidden')
    }

    function _openIconMenu(e){
        document.querySelector('.mode-select').classList.add('hidden')
        document.querySelector('.icon-select').classList.remove('hidden')
        gameType = e.target.classList[0]
    }

    function _startGame(e){
        let player1
        let player2
        document.querySelector('.icon-select').classList.add('hidden')
        document.querySelector('.main').classList.remove('hidden')
        if(e.target.textContent === 'X'){
            player1 = Player('Player 1', 'X')
            player2 = gameType === 'pvp' ? Player('Player 2', 'O') : Bot('Computer', 'O')
        } else{
            player2 = Player('Player 1', 'O')
            player1 = gameType === 'pvp' ? Player('Player 2', 'X') : Bot('Bot', 'X')
        }
        Game.initGame(player1, player2, gameType)
    }

    function _returnToMain(){
        document.querySelector('.main').classList.add('hidden')
        document.querySelector('.intro').classList.remove('hidden')
    };

    (function(){
        _addListeners()
    })()
})()



