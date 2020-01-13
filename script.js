// css class for different card image
const CARD_TECHS = [
  'html5',
  'css3',
  'js',
  'sass',
  'nodejs',
  'react',
  'linkedin',
  'heroku',
  'github',
  'aws'
];

// only list out some of the properties,
// add more when needed
const game = {
  score: 0,
  level: 1,
  timer: 60,
  timerDisplay: null,
  scoreDisplay: null,
  levelDisplay: null,
  timerInterval: null,
  startButton: null,
  board: null,
  gameOver: true,
  lockBoard: false,
  firstCard: null,
  secondCard: null,
  hasCardFlipped: false,
  matchedCards: 0,
  totalCards: 0

  // and much more
};

setGame();

/*******************************************
/     game process
/******************************************/

// 1. register any element in your game object
function setGame() {
  game.levelDisplay = document.querySelector('.game-stats__level--value');
  game.scoreDisplay = document.querySelector('.game-stats__score--value');
  game.timerDisplay = document.querySelector('.game-timer__bar');
  game.board = document.querySelector('.game-board');
  game.startButton = document.querySelector('.game-stats__button');

  bindStartButton();
}

// 3. initialize game to start 
function startGame() {
  game.score = 0;
  game.level = 1;
  game.scoreDisplay.innerText = game.score;
  game.levelDisplay.innerText = game.level;
  game.startButton.innerText = "End Game";
  game.timerInterval = null;
  game.matchedCards = 0;
  game.gameOver = false;
  resetBoard();
  startTimer(); //3.1
  generateCards(); //3.2
  bindCardClick();//3.3
}

//3.1. start timer interval
function startTimer() {
  // to clear any other timer intervals before the timer start working in case more than one timer interval are working at the same time on the game borad (Best Practice)
  if (game.timerInterval) {
    stopTimer();
  }
  game.timer = 60;
  updateTimerDisplay();

  game.timerInterval = setInterval(() => {
    game.timer--;
    updateTimerDisplay();
    //special case: when the interval get reduced to 0, game is over
    if (game.timer === 0) {
      updateTimerDisplay();
      handleGameOver();
    }
  }, 1000);
}

//3.2 generate cards in random
function generateCards() {
  //clear the board first: remove all child elements from a DOM node
  while (game.board.firstChild) {
    game.board.removeChild(game.board.firstChild);
  }
    //add a css grid layout to game-board element 
    const columns = game.level * 2;
    game.board.style['grid-template-columns'] = `repeat(${columns}, 1fr)`;
  
    //create card elements
    game.totalCards = columns ** 2;
    let totalCards = game.totalCards;
    const cards = [...game.board.childNodes];
    // console.log(cards);

    for (let i = 0; i < totalCards / 2; i++) { 
      const tech = CARD_TECHS[i % CARD_TECHS.length];
      const node = document.createElement('div');
      node.classList.add('card', tech);

      const cardFront = document.createElement('div');
      node.appendChild(cardFront);
      cardFront.classList.add('card__face', 'card__face--front');
      const cardBack = document.createElement('div');
      node.appendChild(cardBack);
      cardBack.classList.add('card__face', 'card__face--back');
      
      // game.board.appendChild(node);
      // game.board.appendChild(node.cloneNode(true));
      cards.push(node);
      cards.push(node.cloneNode(true));
    }
    // console.log(cards);

    //shuffle cards
    while(totalCards) {
      const randomNum = Math.floor(Math.random() * totalCards--);
      const randomCard  = cards[totalCards];
      cards[totalCards] = cards[randomNum];
      cards[randomNum] = randomCard;
    }
    // console.log(cards);

    // generate cards in random
    cards.forEach(card => {
      game.board.appendChild(card);
    })
    // console.log(cards);
}

// 3.3.1 handle different cardflip situations when card is clicked
function handleCardFlip() {
  //special case1: can not flip cards when game is over or tempararily lock the board as a punishment of non-matching.
  if (game.gameOver || game.lockBoard) return;
  //special case2: the card clicked just is the first clicked card, ie click the first card twice -> the card flip back(back to front), reset the board
  if (this === game.firstCard) {
    this.classList.remove('card--flipped');
    resetBoard();
    return;
  }
  // if the above two special cases do not exist, so add card--flipped class to the clicked card's classlist to make it get flipped, then check whether there is a card flipped on board (case 3 and case 4)
  this.classList.add('card--flipped');
  // case3: if there is no card which has been flipped on the boarc, that means the card you just clicked and flipped is the first card.
  if (!game.hasCardFlipped) {
    game.firstCard = this;
    game.hasCardFlipped = true;
    return;
  }
  //case 4: if there has been a card flipped on the board, that means the card you clicked and flipped is not the first card. Instead, it should be the second card and could get maching check with the first card.
  game.secondCard = this;
  checkMatching();
}

// 3.3.2 checking whether the second card matches the first one
function checkMatching() {
  // case1: if matches, update the score and the total number of matched cards
  if (game.firstCard.classList[1] === game.secondCard.classList[1]) {
    updateScore();
    game.matchedCards += 2;
    unBindCardClick();
    // case2: if matches and the matched cards number reaches the total cards number, that means this level has been finished so go to next level.
    if (game.matchedCards === game.totalCards) {
      clearInterval(game.timerInterval);
      setTimeout(() => nextLevel(), 1500);
    }
  //case 3: if not match, go to flip the cards back to their front face
  } else {
    unflipCards();
  }
}

//3.3.3 if not matched, unflip the two cards.
// (PS:here MUST setTimeout() for card unflipping, otherwise, fliping and then unflipping would be executed too quickly to see so that the second card looks like not been flipped at all but actually it just be fliped and then unfliped in a flash)
function unflipCards() {
  game.lockBoard = true;
  setTimeout(() => {
  game.firstCard.classList.remove('card--flipped');
  game.secondCard.classList.remove('card--flipped');
  resetBoard();
  }, 1000)
}

// 3.3.4 when this level is finished, go to next level or handle game over if this is level 3
function nextLevel() {
  //special case1 : if this is last level(here is level 3), handle game over
  if (game.level === 3) {
    handleGameOver();
    return;
  }
  //special case2 : to stop the game getting into next level if click the "End Game" button during the setTimeout of nextlevel
  if (game.gameOver) return;
  
  //get into next level and all start over again
  game.level++;
  game.levelDisplay.innerText = game.level;
  game.timerInterval = null;
  game.matchedCards = 0;
  game.totalCards = 0;
  resetBoard();
  
  startTimer();
  generateCards();
  bindCardClick();
}


// 3.1.2 when game is over, clear interval, alert the score and startbutton's text change to "Start Game"
function handleGameOver() {
  game.gameOver = true;
  alert("Congratulations, your score is " + game.score);
  game.startButton.innerText = "Start Game";
  stopTimer();
}

//for code cleanliness
function resetBoard() {
  [game.firstCard, game.secondCard] = [null, null];
  [game.lockBoard, game.hasCardFlipped] = [false, false];
}
//for code cleanliness
function stopTimer() {
  clearInterval(game.timerInterval);
  timerInterval = null;
}

/*******************************************
/     UI update
/******************************************/

//3.3.2 when the cards match, update higer score 
function updateScore() {
  let updatedScore = game.level**2 * game.timer;
  game.score += updatedScore; 
  game.scoreDisplay.innerText = game.score;
}

// 3.1.1 update timer's text and the width of the timer bar
function updateTimerDisplay() {
 
  game.timerDisplay.innerText = game.timer;
  game.timerDisplay.style.width = `${game.timer * 100 /60}%`; // width : game.timer = 100 : 60
}

/*******************************************
/     bindings
/******************************************/
// 2. bind startButton event handler
function bindStartButton() {
  game.startButton.addEventListener('click', () => {
    //special case: click the end game button to stop in the middel of a game; 
    // else, start the game.
    // game.startButton.innerText === "End Game" ? handleGameOver() : startGame();
    !game.gameOver ?  handleGameOver() : startGame();

  });
}

//3.3.2 unbind the two matched cards' event handler
function unBindCardClick() {
  game.firstCard.removeEventListener('click', handleCardFlip);
  game.secondCard.removeEventListener('click', handleCardFlip);
  resetBoard();
}

//3.3 bind each card click event handler
function bindCardClick() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('click', handleCardFlip);
  })
}
