// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // Circle's position
let circleRadius = 50; // Circle's radius (100 width/height)
let isDragging = false; // Flag to track if the circle is being dragged
let previousX, previousY; // Previous position of the circle
let currentColor = null; // Current color of the trajectory

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Initialize circle position at the center of the canvas
  circleX = width / 2;
  circleY = height / 2;

  // Initialize previous position
  previousX = circleX;
  previousY = circleY;

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // Draw the circle
  fill(0, 0, 255, 150); // Semi-transparent blue
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    isDragging = false; // Reset dragging flag
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255); // Magenta for left hand
          } else {
            fill(255, 255, 0); // Yellow for right hand
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // Check if both index finger (keypoint 8) and thumb (keypoint 4) touch the circle
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        if (dIndex < circleRadius && dThumb < circleRadius) {
          // Move the circle to the midpoint between index finger and thumb
          circleX = (indexFinger.x + thumb.x) / 2;
          circleY = (indexFinger.y + thumb.y) / 2;

          // Set dragging flag to true and update trajectory color
          isDragging = true;
          currentColor = hand.handedness == "Left" ? color(0, 255, 0) : color(255, 0, 0); // Green for left, red for right
        }

        // Draw lines connecting keypoints in groups
        drawLines(hand.keypoints, 0, 4);  // Connect keypoints 0 to 4
        drawLines(hand.keypoints, 5, 8);  // Connect keypoints 5 to 8
        drawLines(hand.keypoints, 9, 12); // Connect keypoints 9 to 12
        drawLines(hand.keypoints, 13, 16); // Connect keypoints 13 to 16
        drawLines(hand.keypoints, 17, 20); // Connect keypoints 17 to 20
      }
    }
  }

  // Draw the trajectory if the circle is being dragged
  if (isDragging) {
    stroke(currentColor); // Set the trajectory color
    strokeWeight(10); // Set the trajectory thickness
    line(previousX, previousY, circleX, circleY);
    previousX = circleX;
    previousY = circleY;
  } else {
    // Update previous position to current position when not dragging
    previousX = circleX;
    previousY = circleY;
  }
}

// Helper function to draw lines between keypoints
function drawLines(keypoints, startIdx, endIdx) {
  stroke(0, 255, 0); // Set line color
  strokeWeight(2);   // Set line thickness
  for (let i = startIdx; i < endIdx; i++) {
    let kp1 = keypoints[i];
    let kp2 = keypoints[i + 1];
    line(kp1.x, kp1.y, kp2.x, kp2.y);
  }
}
