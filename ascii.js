let cols, rows;
let size = 15; // Size of each character cell
let t = 0;
const chars = "         tobjav ";

function setup() {
  createCanvas(400, 400);
  // Calculate how many characters fit on the screen
  cols = floor(width / size);
  rows = floor(height / size);
  textFont('DM');
  textSize(size);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(25, 26, 27); // Black background
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Normalize coordinates (-1 to 1)
      let nx = x / cols - 0.5;
      let ny = y / rows - 0.5;
      
      // Abstract math for the "Plasma" effect
      let v = Math.sin(nx * 5 + t);
      v += Math.sin(10 * (nx * Math.sin(t / 2) + ny * Math.cos(t / 3)) + t);
      let dist = Math.sqrt(nx * nx + ny * ny);
      v += Math.sin(dist * 10 - t);
      
      // Map the math value to a character index
      let charIdx = floor(map(v, -3, 3, 0, chars.length - 1));
      charIdx = constrain(charIdx, 0, chars.length - 1);
      
      // Dynamic RGB Coloring
      let r = 255 - Math.floor(Math.sin(v + t)*2)*64;
      let g = 255 - Math.floor(Math.sin(v + t)*2)*0;
      let b = 255 - Math.floor(Math.sin(v + t)*2)*231;
      
      fill(r, g, b);
      text(chars[charIdx], x * size + size/2, y * size + size/2);
    }
  }
  
  t += 0.01; // Speed of the animation
}