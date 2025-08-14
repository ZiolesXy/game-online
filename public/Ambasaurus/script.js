const musicToggle = document.getElementById('music-toggle');
    const container = document.getElementById('container');
    const warningMessage = document.getElementById('warning-message');
    const bgMusic = document.getElementById('bg-music');
    const playAgainBtn = document.getElementById('play-again');
    const mainMenuBtn = document.getElementById('main-menu');
    const pauseBtn = document.getElementById('pause');

    let gamePaused = false;
    let interval = null;
    let score = 0;
    let highscore = parseInt(localStorage.getItem('highscore')) || 0;
    const playerScore = document.getElementById("score");
    const highscoreDisplay = document.getElementById('highscore');

    highscoreDisplay.textContent = `Highscore: ${highscore}`;

    function handleOrientationChange() {
      if (window.innerWidth > window.innerHeight) {
        container.style.display = 'block';
        warningMessage.style.display = 'none';
        musicToggle.style.display = 'block';
        playAgainBtn.style.display = 'none';
        mainMenuBtn.style.display = 'none';
        pauseBtn.style.display = 'block';
      } else {
        container.style.display = 'none';
        warningMessage.style.display = 'block';
        playAgainBtn.style.display = 'none';
        musicToggle.style.display = 'none';
        mainMenuBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
      }
    }

    handleOrientationChange();

    window.addEventListener('resize', handleOrientationChange);

    musicToggle.addEventListener('click', function () {
      if (bgMusic.paused) {
        bgMusic.play();
      } else {
        bgMusic.pause();
      }
    });

    mainMenuBtn.addEventListener('click', function () {
      window.location.href = "index.html";
    });

    playAgainBtn.addEventListener('click', function () {
      location.reload();
    });

    function pauseGame() {
      if (!gamePaused) {
        clearInterval(interval);
        gamePaused = true;
        pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; // Change icon to "play" when paused
      } else {
        interval = setInterval(jumlahScore, 100);
        gamePaused = false;
        pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; // Change icon to "pause" when resumed
      }
    }

    document.addEventListener('keydown', function (event) {
      if (event.code === 'Space' && !gamePaused) {
        jump();
      }
    });

    let char = document.getElementById("dino");
    const cactus = document.getElementById("cactus");

    document.addEventListener('click', function () {
      if (!gamePaused) {
        jump();
      }
    });

    document.addEventListener('touchstart', function () {
      if (!gamePaused) {
        jump();
      }
    });

    let jumlahScore = () => {
      if (!gamePaused) {
        score++;
        playerScore.innerHTML = `Score : ${score}`;
        if (score > highscore) {
          highscore = score;
          localStorage.setItem('highscore', highscore);
          highscoreDisplay.textContent = `Highscore: ${highscore}`;
        }
      }
    };

    function jump() {
      if (!gamePaused && char.classList != "animate") {
        char.classList.add("animate");
        setTimeout(function () {
          char.classList.remove('animate')
        }, 500);
        let score = 0;
        interval = setInterval(jumlahScore, 100);
      }
    };

    // Tambahkan variabel global untuk menyimpan jumlah nyawa
    let lives = 4;
    const livesDisplay = document.getElementById('lives');

    const ifHitCactus = setInterval(function () {
      if (!gamePaused) {
        const charTop = parseInt(window.getComputedStyle(char).getPropertyValue("top"));
        const cactusLeft = parseInt(window.getComputedStyle(cactus).getPropertyValue("left"));

        if (cactusLeft < 185 && cactusLeft > 0 && charTop >= 100) {
          cactus.style.animation = "none";
          cactus.style.display = "none";

          // Kurangi jumlah nyawa
          lives--;
          livesDisplay.textContent = `Lives: ${lives}`;

          // Reset cactus position and animation
          setTimeout(() => {
            cactus.style.left = "850px";
            cactus.style.animation = "cactus 1s infinite linear";
            cactus.style.display = "block";
          }, 100);

          // Kurangi skor sebesar 10% saat nyawa digunakan
          score -= Math.ceil(score * 0.1);
          playerScore.textContent = `Score : ${score}`;

          // Jika nyawa habis, tampilkan pesan game over
          if (lives <= 0) {
            clearInterval(interval);
            document.getElementById('container').innerHTML += `<div id="game-over-message">Ambasaurus kamu nabrak kaktus.<br>Final Score: ${score}</div>`;
            document.getElementById('dino').style.display = 'none';
            playAgainBtn.style.display = 'block';
            mainMenuBtn.style.display = 'block';
            pauseBtn.style.display = 'none';
          }
        }
      }
    }, 10);
