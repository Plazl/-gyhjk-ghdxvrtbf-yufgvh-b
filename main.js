function generateWhiteNoise(size, whiteLevel = .5) {
	return new Array(size).fill(0)
		.map(() => Math.random() >= whiteLevel ? BLACK : WHITE);
}
const noise_matrix = new Array(MATRIX_DIMENSIONS.height).fill(0).map(() => {
		return generateWhiteNoise(MATRIX_DIMENSIONS.width, WHITE_LEVEL);
});

function cellularAutomaton(matrix) {
  const tmpMatrix = copyMatrix(matrix);
  tmpMatrix.forEach((row, rowIndex) => {
    row.forEach((pixel, pixelIndex) => {
      tmpMatrix[rowIndex][pixelIndex] = calculatePixelValueByNeighbors(rowIndex, pixelIndex, matrix);
    });
  });

  return tmpMatrix;
}

function calculatePixelValueByNeighbors(rowIndex, pixelIndex, matrix) {
	let sum = 0;
	for (let y = -1; y < 2; y++) {
		for (let x = -1; x < 2; x++) {
			if (!matrix[rowIndex + y] || !matrix[rowIndex + y][pixelIndex + x]) {
				sum -= 1;
			} else {
				sum += 1;
			}
		}
	}
	return sum > 0 ? WHITE : BLACK;
}
const matrices = {
  last: null,
  current: null
};

matrices.current = new Array(MATRIX_DIMENSIONS.height).fill(0)
			.map(() => {
				return generateWhiteNoise(MATRIX_DIMENSIONS.width, WHITE_LEVEL);
			});

while (areMatricesDifferent(matrices.current, matrices.last) || someCounter > someLimit) {
  matrices.last = matrices.current;
  matrices.current = cellularAutomaton(matrices.last);
}
function draw(matrix) {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
	ctx.beginPath();
	matrix.forEach((pixelsRow, rowIndex) => {
		const y = rowIndex * PIXEL_RATIO;
		pixelsRow.forEach((pixel, pixelIndex) => {
			const x = pixelIndex * PIXEL_RATIO;
			ctx.fillStyle = COLORS[pixel];
			ctx.fillRect(x, y, PIXEL_RATIO, PIXEL_RATIO);
		});
	});
	ctx.closePath();
}
function generateBackgroundPaths(matrix) {
  const wallsPath = new Path2D();
  const roadsPath = new Path2D();
  const mazePaths = {
    wallsPath,
    roadsPath,
  };

  matrix.forEach((pixelsRow, rowIndex) => {
    const y = rowIndex * PIXEL_RATIO;
    pixelsRow.forEach((pixel, pixelIndex) => {
      const x = pixelIndex * PIXEL_RATIO;
      const currPath = pixel === BLACK ? roadsPath : wallsPath;
      currPath.rect(x, y, PIXEL_RATIO, PIXEL_RATIO);
    });
  });

  return mazePaths;
}
function drawBackground(mazePaths) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
  ctx.fillStyle = COLORS[BLACK];
  ctx.fill(mazePaths.roadsPath);

  ctx.fillStyle = COLORS[WHITE];
  ctx.fill(mazePaths.wallsPath);

  return mazePaths;
}

function generateBackground() {
  const matrices = {
    last: null,
    current: null,
  };

  matrices.current = new Array(MATRIX_DIMENSIONS.height)
    .fill(0)
    .map(() => {
    return generateWhiteNoise(MATRIX_DIMENSIONS.width, WHITE_LEVEL);
  });

  let count = 0;
  const ITERATIONS_LIMIT = 100;
  while (
    areMatricesDifferent(matrices.current, matrices.last) ||
    count > ITERATIONS_LIMIT
  ) {
    matrices.last = matrices.current;
    matrices.current = cellularAutomaton(matrices.last);
  }

  const backgroundPaths = generateBackgroundPaths(matrices.current);
  return drawBackground(backgroundPaths);
}
function start(canvas, radius = 10) {
  const mazesPaths = generateBackground();
  const { x, y } = findAStartingPoint(mazesPaths.wallsPath, radius);
  renderPlayer(canvas, {currX: x, currY: y, playerRadius: radius}, mazesPaths.wallsPath);
}

function renderPlayer(canvas, {currX, currY, playerRadius}, wallsPath) {
  let radius = playerRadius, x = currX, y = currY;
  if (spaceClicked) {
    radius = 2;
  }
  const ctx = canvas.getContext("2d");
  if (clickedKey) {
    if (clickedKey.includes('Down') || clickedKey.includes('Up')) {
      y = currY + KEYBOARD_KEYS[clickedKey] * PIXEL_RATIO / 2;
    } else {
      x = currX + KEYBOARD_KEYS[clickedKey] * PIXEL_RATIO / 2;
    }
  }

  if (y - radius < 0 || y + radius >= CANVAS_HEIGHT || x - radius < 0 || x + radius >= CANVAS_WIDTH || isCircleInPath({radius, x, y}, wallsPath)) {
    x = currX;
    y = currY;
  } else {
    const playerPath = new Path2D();
    playerPath.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "blue";
    ctx.fill(playerPath);
  }

  requestAnimationFrame(() => renderPlayer(canvas, {currX: x, currY: y, playerRadius}, wallsPath));
}
function isCircleInPath(circleData, path) {
  const ctx = document.createElement("canvas").getContext("2d");
  const radius = circleData.radius;
  for (
    let x = circleData.x - radius;
    x <= circleData.x + 2 * radius;
    x += radius
  ) {
    for (
      let y = circleData.y - radius;
      y <= circleData.y + 2 * radius;
      y += radius
    ) {
      if (ctx.isPointInPath(path, x, y)) return true;
    }
  }
  return false;
}
