function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
		var ctx2 = canvas.getContext('2d');
    var circle = new Path2D();

    circle.arc(100, 50, 20, 0, 2 * Math.PI);
		ctx.fillStyle = "green";
		ctx.fill(circle);
		
		
		var angle = (Math.PI * 2)/12;
		var angleCounter = 0;
		
		var timer = window.setInterval(function () {
			angleCounter = angleCounter + angle;
			var cheese = drawCircle(100, 50, 2, angleCounter, 20);
			var color = "blue";
			if (angleCounter > 180) {
			color = "pink";
			}
			ctx.fillStyle = color;
			ctx.fill(cheese);
			}, 500);
		
  }
}

function drawCircle(cx,cy,width, angle,originRadius) {
		var dot = new Path2D();
		var x = cx + originRadius * Math.cos(angle);
    var y = cy + originRadius * Math.sin(angle)
		dot.arc(x, y, width, 0, 2 * Math.PI);
		return dot;
}
