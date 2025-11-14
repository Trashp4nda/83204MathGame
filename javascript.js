(() => {
  // Elements
  const questionEl = document.getElementById('question');
  const answersEl = document.getElementById('answers');
  const timeLeftEl = document.getElementById('timeLeft');
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const endPanel = document.getElementById('endPanel');
  const endText = document.getElementById('endText');
  // Removed: opLabel, highScoreEl, progressEl, roundsDoneEl, modeSel, livesEl, resetHigh, roundCapSel

  // Game state - simplified
  let state = {
    timeLeft: 60,
    timerId: null,
    running: false,
    score: 0,
    currentAnswer: null,
    totalTime: 60,
    // Setting game mode to a fixed 'mixed' since controls are removed
    mode: 'mixed'
  };

  // Utility: random integer inclusive
  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min }

  // Generate a beginner-friendly question (small numbers)
  function generateQuestion(){
    let op;
    const arr = ['add','sub','mul','div'];
    op = arr[rand(0,arr.length-1)]; // Always mixed mode

    let a,b,question,answer;
    if (op === 'add') {
      a = rand(1,12); b = rand(1,12);
      answer = a + b;
      question = `${a} + ${b}`;
    } else if (op === 'sub') {
      a = rand(1,20); b = rand(1, Math.min(a,10));
      if (b > a) [a,b] = [b,a];
      answer = a - b;
      question = `${a} - ${b}`;
    } else if (op === 'mul') {
      a = rand(1,10); b = rand(1,10);
      answer = a * b;
      question = `${a} × ${b}`;
    } else { // div
      b = rand(1,10);
      const q = rand(1,10);
      a = b * q;
      answer = q;
      question = `${a} ÷ ${b}`;
    }

    state.currentAnswer = answer;
    questionEl.textContent = question;
    // Removed: opLabel.textContent
    generateChoices(answer);
  }

  // Generate 4 choices
  function generateChoices(correct){
    const choices = new Set();
    choices.add(correct);

    while (choices.size < 4) {
      let delta = rand(-3,3);
      if (delta === 0) delta = (Math.random() > 0.5 ? 1 : -1);
      let cand = correct + delta;

      if (cand < 0) cand = Math.abs(cand) + rand(1,2);
      if (choices.has(cand)) cand = correct + rand(4,7);
      if (cand === correct) cand = correct + rand(4,7);
      choices.add(cand);
    }

    // shuffle
    const arr = Array.from(choices);
    for (let i = arr.length -1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }

    // render buttons
    answersEl.innerHTML = '';
    arr.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'ans-btn';
      btn.textContent = val;
      btn.setAttribute('data-value', String(val));
      btn.addEventListener('click', answerClicked);
      answersEl.appendChild(btn);
    });
  }

  // When an answer button is clicked
  function answerClicked(e){
    if (!state.running) return;
    const btn = e.currentTarget;
    const val = Number(btn.getAttribute('data-value'));
    // temporarily disable all buttons
    Array.from(answersEl.querySelectorAll('button')).forEach(b => b.disabled = true);

    if (val === state.currentAnswer) {
      // correct
      btn.classList.add('correct');
      state.score += 1;
      scoreEl.textContent = state.score;
    } else {
      // wrong (no lives system in this simplified version)
      btn.classList.add('wrong');
      // highlight the correct button
      const correctBtn = Array.from(answersEl.querySelectorAll('button')).find(b => Number(b.getAttribute('data-value')) === state.currentAnswer);
      if (correctBtn) correctBtn.classList.add('correct');
    }

    // small pause then next question
    setTimeout(() => {
      // clear styles and re-enable
      Array.from(answersEl.querySelectorAll('button')).forEach(b => { b.className = 'ans-btn'; b.disabled = false; });
      if (!state.running) return;
      generateQuestion();
    }, 400);
  }

  function startTimer(){
    clearInterval(state.timerId);
    state.timeLeft = state.totalTime;
    timeLeftEl.textContent = state.timeLeft;
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      timeLeftEl.textContent = state.timeLeft;
      if (state.timeLeft <= 0) {
        clearInterval(state.timerId);
        endGame();
      }
    }, 1000);
  }

  function stopTimer(){
    clearInterval(state.timerId);
    state.timerId = null;
  }

  function startGame(){
    // reset state
    stopTimer();
    state.running = true;
    state.score = 0;
    state.timeLeft = state.totalTime;
    scoreEl.textContent = '0';
    endPanel.style.display = 'none';
    answersEl.style.opacity = 1; // make sure answers are visible
    // start timer and generate first question
    startTimer();
    generateQuestion();
  }

  function endGame(){
    state.running = false;
    stopTimer();
    // disable answer buttons
    Array.from(answersEl.querySelectorAll('button')).forEach(b => { b.disabled = true; });
    answersEl.style.opacity = 0.3; // fade out the answers
    endPanel.style.display = 'block';
    endText.innerHTML = `<strong>TIME'S UP!</strong><br>Final Score: <strong>${state.score}</strong>`;
  }

  // Controls
  startBtn.addEventListener('click', () => {
    startGame();
  });

  // initial UI
  // Pre-generate and show a question but don't start the timer until Start pressed
  generateQuestion();
})();