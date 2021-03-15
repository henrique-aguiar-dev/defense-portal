const onLoadGlobal = () => {
	//Global variables----------------------------------
	//Html elements
	const gameScreen = document.querySelector('.game-screen');
	const portal = document.querySelector('.portal');
	const btnStart = document.querySelector('#btn-ini');
	const arrowLeft = document.querySelector('#esq');
	const arrowRight = document.querySelector('#dir');
	const btnPause = document.querySelector('#pause');
	const arrows = document.querySelectorAll('.panel i');

	//Intervals
	let portalIntervalRight;
	let portalIntervalLeft;
	let targetsInterval;
	let watchInterval;
	let pauseInterval;

	//flags
	let paused = false;
	let gameOn = false;
	let gameEnd = false;

	//counters
	let pts = 0;
	let imp = 0;
	let countAster = 0;
	//-----------------------------------------------------

	//Classes----------------------------------------------
	class Target {
		constructor(div, speed) {
			this.target = div;
			this.target.className = 'target animate';
			this.maxLeft = this.target.parentElement.offsetWidth - 100;
			this.maxTop = this.target.parentElement.offsetHeight;
			this.randomLeftPos = Math.floor(Math.random() * (this.maxLeft - 5) + 5);
			this.target.style.left = this.randomLeftPos + 'px';
			this.speed = speed;
			this.explosion = this.target.parentElement.appendChild(document.createElement('div'));
			this.explosion.className = 'impact';
			this.explosion.style.left = this.randomLeftPos + 10 + 'px'
		}

		_animateTarget() {
			this.target.animate([{ top: this.target.offsetTop + 'px' }, { top: this.maxTop + 'px' }], this.speed);
		}

		_missedTarget() {
			this.target.className = 'target burned';
			setTimeout(() => {
				this.target.remove();
				this.explosion.style.display = 'block';
			}, 200);
			setTimeout(() => this.explosion.remove(), 400);
			return
		}

		_getTargetPosition() {
			return this.target.getBoundingClientRect();
		}
	}
	//-------------------------------------------------------


	//Main functions-----------------------------------------
	const updatePanel = (pts, imp) => {
		const avoided = document.querySelector('#avoided');
		const impacts = document.querySelector('#impacts');
		avoided.innerHTML = pts;
		impacts.innerHTML = imp;
	}
	updatePanel(pts, imp);

	const showResult = (pts, imp, perc) => {
		let result;

		if (perc < 70) {
			result = document.querySelector('.bad')
		} else {
			result = document.querySelector('.good');
		}

		let finalPts = result.querySelector('.final-pts');
		let finalImp = result.querySelector('.final-imp');
		let showPerc = result.querySelector('.perc');

		result.style.display = 'block';
		finalPts.innerHTML = pts;
		finalImp.innerHTML = imp;
		showPerc.innerHTML = perc + '%';
	}

	const removeTargets = () => {
		let targetExists1 = document.querySelector('.target');

		if (targetExists1) {
			targetExists1.remove();
			countAster--;
		} else return false;
	}

	const pauseGame = () => {
		const textPause = document.querySelector('.paused');

		if (!paused) {
			paused = true;
			//clearInterval(targetsInterval);
			clearInterval(portalIntervalRight);
			clearInterval(portalIntervalLeft);
			clearInterval(watchInterval);
			removeTargets();

			pauseInterval = setInterval(() => {
				textPause.style.display = 'block';
				setTimeout(() => textPause.style.display = 'none', 500)
			}, 1000)

		} else return false;
	}

	const endGame = numAsteroids => {
		clearInterval(targetsInterval);
		clearInterval(portalIntervalRight);
		clearInterval(portalIntervalLeft);
		clearInterval(watchInterval);
		removeTargets();

		let perc = Math.floor((pts / numAsteroids) * 100);
		showResult(pts, imp, perc);

		gameEnd = true;
	}

	const watchTarget = target => {
		let targetBottom = target._getTargetPosition().bottom;
		let targetLeft = target._getTargetPosition().left;
		let targetRight = target._getTargetPosition().right;
		let portalTop = portal.getBoundingClientRect().top - 7;
		let portalLeft = portal.getBoundingClientRect().left - 20;
		let portalRight = portal.getBoundingClientRect().right + 20;

		if (targetBottom > portalTop + 50) {
			target._missedTarget();
			imp++;
			clearInterval(watchInterval);
			updatePanel(pts, imp);
			return;
		}

		if (targetBottom >= portalTop && targetBottom <= portalTop + 50 &&
			targetLeft >= portalLeft && targetRight <= portalRight) {
			pts++;
			target.target.remove();
			clearInterval(watchInterval);
			updatePanel(pts, imp);
			return;
		}
	}

	const createTargets = speed => {
		const div = gameScreen.appendChild(document.createElement('div'));
		target = new Target(div, speed);//speed = 2000 ms
		target._animateTarget();
		watchInterval = setInterval(() => watchTarget(target), 100);
	}

	const runGame = () => {
		let speed = 1600;
		if (window.innerWidth > 900) speed = 2000;
		if (window.innerWidth < 400) speed = 1400;
		let numAsteroids = Math.floor(Math.random() * (71 - 50) + 50);
		gameOn = true;
		paused = false;

		targetsInterval = setInterval(() => {
			if (!paused && gameOn && countAster <= numAsteroids) {
				createTargets(speed);
				countAster++;
				if (countAster > numAsteroids) endGame(numAsteroids);
			} else return false;
		}, speed); //speed = 2000 ms
	}

	//Hide / show arrows on mobile
	const toggleArrowsOnMob = display => {
		if (navigator.maxTouchPoints !== 0) {
			arrows.forEach(thisArrow => thisArrow.style.display = display);
		} else return false;
	}

	const newGame = () => {
		if (gameOn) {
			gameOn = false;
			const alert = document.querySelector('.alert');
			alert.style.display = 'block';

			toggleArrowsOnMob('none')

			document.querySelector('#yes').addEventListener('click', () => location.reload());
			document.querySelector('#no').addEventListener('click', () => {
				toggleArrowsOnMob('block');
				alert.style.display = 'none';
				gameOn = true;
			})
		}
	}//-------------------------------------------------


	//Portal animations------------------
	const animRight = () => {
		if (portal.offsetLeft <= gameScreen.offsetWidth - portal.offsetWidth - 5) {
			portal.style.left = portal.offsetLeft + 5 + 'px';
		} else {
			clearInterval(portalIntervalRight);
			return;
		}
	}

	const animLeft = () => {
		if (portal.offsetLeft > 5) {
			portal.style.left = portal.offsetLeft - 5 + 'px';
		} else {
			clearInterval(portalIntervalLeft);
			return;
		}
	}//-----------------------------


	//Events listeners-----------------
	arrowRight.addEventListener('mousedown', () => {
		if (!paused && gameOn && !gameEnd) {
			portalIntervalRight = setInterval(() => animRight(), 0)
		} else return;
	});

	arrowLeft.addEventListener('mousedown', () => {
		if (!paused && gameOn && !gameEnd) {
			portalIntervalLeft = setInterval(() => animLeft(), 0)
		} else return;
	});

	arrowRight.addEventListener('mouseup', () => {
		clearInterval(portalIntervalRight);
		clearInterval(portalIntervalLeft);
	});
	arrowLeft.addEventListener('mouseup', () => {
		clearInterval(portalIntervalRight);
		clearInterval(portalIntervalLeft);
	});

	//Mobile touch events - avoidind simultaneous click glitch
	if (navigator.maxTouchPoints !== 0) {
		let timeClick1;
		let timeClick2;
		arrowRight.addEventListener('touchstart', e => {
			timeClick1 = e.timeStamp; //capturing time click
			clearInterval(portalIntervalRight);
			clearInterval(portalIntervalLeft);
			//if time click are close: preventDefault
			if (Math.abs(timeClick1 - timeClick2) < 300) return;
			if (!paused && gameOn && !gameEnd) {
				portalIntervalRight = setInterval(() => animRight(), 0)
			} else return;
		});

		arrowLeft.addEventListener('touchstart', e => {
			timeClick2 = e.timeStamp;//capturing time click
			clearInterval(portalIntervalRight);
			clearInterval(portalIntervalLeft);
			//if time click are close: preventDefault
			if (Math.abs(timeClick1 - timeClick2) < 300) return;
			if (!paused && gameOn && !gameEnd) {
				portalIntervalLeft = setInterval(() => animLeft(), 0)
			} else return;
		});

		arrowRight.addEventListener('touchend', () => {
			clearInterval(portalIntervalRight);
			clearInterval(portalIntervalLeft);
		});
		arrowLeft.addEventListener('touchend', () => {
			clearInterval(portalIntervalRight);
			clearInterval(portalIntervalLeft);
		});
	}

	btnStart.addEventListener('click', e => {
		const startScreen = document.querySelector('.start-screen');
		startScreen.style.display = 'none';

		toggleArrowsOnMob('block');
		clearInterval(pauseInterval);

		if (!gameOn) {
			runGame();
		} else if (gameEnd || gameOn && !paused) {
			newGame();
		} else if (paused) {
			paused = false;
		} else e.preventDefault();
	})

	btnPause.addEventListener('click', e => {
		if (gameOn && !gameEnd) {
			pauseGame();
		} else {
			e.preventDefault();
		}
	});

	window.addEventListener('orientationchange', () => {
		gameOn && !gameEnd ? pauseGame() : location.reload();
	})//-----------------------------------
}

onLoadGlobal();
