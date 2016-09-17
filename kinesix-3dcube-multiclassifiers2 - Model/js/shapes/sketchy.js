
var hungarian;

  function randomShapeMatch(shape1, shape2) {
    return Math.random();
  }

  // shape1 and shape2 should be stringified JSON data from Raphael SketchPad
  function shapeContextMatch(shape1, shape2) {
		var pointsPerShape = 25, // constant... 25 is pretty fast... 50 is probably best
        points1, points2,

        // 0.125 gives a bin out to points 2x the average
        distanceBinSmallest = 0.125, distanceBinCount = 5,
        distanceMatrix1, distanceTotal1, distanceMean1, distanceBins1,
        distanceMatrix2, distanceTotal2, distanceMean2, distanceBins2,

        angleBinCount = 12,
        angleMatrix1, angleBins1,
        angleMatrix2, angleBins2,

        costMatrix,
        distanceBinNumber1, angleBinNumber1,
        distanceBinNumber2, angleBinNumber2,
        ksum, compare,
        i, j, k,
        result;

    // Scatter points around each of the paths.  The algorithm
    // will only be using these points (as feature descriptors),
    // not the shapes.
    points1 = scatterPoints(shape1, pointsPerShape);
    points2 = scatterPoints(shape2, pointsPerShape);

    // Create a square 2D array and initialize it with 0s in the diagonal
    distanceMatrix1 = [];
    distanceMatrix2 = [];
    for(i=0; i<pointsPerShape; i++) {
      distanceMatrix1[i] = [];
      distanceMatrix1[i][i] = 0;
      distanceMatrix2[i] = [];
      distanceMatrix2[i][i] = 0;
    }

    // Go through the upper triangle of the matrix, computing the distance, mirroring to the lower
    distanceTotal1 = 0;
    distanceTotal2 = 0;
    for(i=0; i<pointsPerShape-1; i++) {
      for(j=i+1; j<pointsPerShape; j++) {
        distanceMatrix1[i][j] = distanceMatrix1[j][i] = euclideanDistance(points1[i].x, points1[i].y, points1[j].x, points1[j].y);
        distanceMatrix2[i][j] = distanceMatrix2[j][i] = euclideanDistance(points2[i].x, points2[i].y, points2[j].x, points2[j].y);
        distanceTotal1 += distanceMatrix1[i][j];
        distanceTotal2 += distanceMatrix2[i][j];
      }
    }
    distanceTotal1 *= 2; // 0s were already summed in, we just need to double it since we only went through the upper triangle
    distanceTotal2 *= 2;
    distanceMean1 = distanceTotal1/Math.pow(pointsPerShape,2);
    distanceMean2 = distanceTotal2/Math.pow(pointsPerShape,2);

    // Normalize by the mean distance.  This achieves scale invariance.
    // Translation invariance is inherent to the fact that distance
    // measurements are made relative to each point.
    for(i=0; i<pointsPerShape; i++) {
      for(j=0; j<pointsPerShape; j++) {
        distanceMatrix1[i][j] /= distanceMean1;
        distanceMatrix2[i][j] /= distanceMean2;
      }
    }

    // Initialize the distance bins with all 0s
    distanceBins1 = [];
    distanceBins2 = [];
    for(i=0; i<pointsPerShape; i++) {
      distanceBins1[i] = [];
      distanceBins2[i] = [];
      for(j=0; j<pointsPerShape; j++) {
        distanceBins1[i][j] = 0;
        distanceBins2[i][j] = 0;
      }
    }

    // Double the acceptable radius each iteration, increasing the bin number
    // each time a point is still in the running.  0 means the point was not in
    // any bins (and will not be counted), 1 means it was in the outer, and
    // distanceBinCount (e.g. 5) means it is in the closest bin (including the
    // same point).
    for(k=0; k<distanceBinCount; k++) {
      for(i=0; i<pointsPerShape; i++) {
        for(j=i+1; j<pointsPerShape; j++) {
          if(distanceMatrix1[i][j] < distanceBinSmallest) {
            distanceBins1[i][j]++;
            distanceBins1[j][i]++;
          }
          if(distanceMatrix2[i][j] < distanceBinSmallest) {
            distanceBins2[i][j]++;
            distanceBins2[j][i]++;
          }
        }
      }
      distanceBinSmallest *= 2;
    }

    // Angles //

    // Create a square 2D array and initialize it with 0s in the diagonal
    angleMatrix1 = [];
    angleMatrix2 = [];
    for(i=0; i<pointsPerShape; i++) {
      angleMatrix1[i] = [];
      angleMatrix2[i] = [];
      angleMatrix1[i][i] = 0;
      angleMatrix2[i][i] = 0;
    }

    // Compute the angle matrix, much like the distance matrix
    for(i=0; i<pointsPerShape-1; i++) {
      for(j=i+1; j<pointsPerShape; j++) {
        // Adding 2pi and modding by 2pi changes the -pi to pi range to a 0 to 2pi range
        angleMatrix1[i][j] = (Math.atan2(points1[j].y - points1[i].y, points1[j].x - points1[i].x) + 2*Math.PI) % (2*Math.PI);
        angleMatrix2[i][j] = (Math.atan2(points2[j].y - points2[i].y, points2[j].x - points2[i].x) + 2*Math.PI) % (2*Math.PI);

        // The matrix is somewhat mirrored over the diagonal, but angles must be flipped around
        angleMatrix1[j][i] = (angleMatrix1[i][j] + Math.PI) % (2*Math.PI);
        angleMatrix2[j][i] = (angleMatrix2[i][j] + Math.PI) % (2*Math.PI);
      }
    }

    // Initialize the angle bins
    angleBins1 = [];
    angleBins2 = [];
    for(i=0; i<pointsPerShape; i++) {
      angleBins1[i] = [];
      angleBins2[i] = [];
    }

    // Compute the angle bins
    // TODO: save efficiency by automatically calculating mirror by adding angleBinCount/2 then modding by angleBinCount?
    for(i=0; i<pointsPerShape; i++) {
      for(j=0; j<pointsPerShape; j++) {
        angleBins1[i][j] = 1+Math.floor(angleMatrix1[i][j]/(2*Math.PI/angleBinCount));
        angleBins2[i][j] = 1+Math.floor(angleMatrix2[i][j]/(2*Math.PI/angleBinCount));
      }
    }

    // Cost Matrix //
    // Compute the cost matrix.  This skips the combined histogram for the sake
    // of efficiency.  TODO: make more efficient by only calculating upper triangle
    costMatrix = [];
    for(i=0; i<pointsPerShape; i++) {
      costMatrix[i] = [];
      for(j=0; j<pointsPerShape; j++) {
        // Go through all K bins.
        ksum = 0;
        for(logr=1; logr<=distanceBinCount; logr++) {
          for(theta=1; theta<=angleBinCount; theta++) {
            // calculate hik and hjk
            hik = shapeContextHistogram(i, logr, theta, distanceBins1, angleBins1);
            hjk = shapeContextHistogram(j, logr, theta, distanceBins2, angleBins2);
            compare = (hik + hjk === 0) ? 0 : (Math.pow(hik-hjk,2) / (hik + hjk));
            ksum += compare;
          }
        }
        costMatrix[i][j] = 1/2 * ksum;
      }
    }

    // Normalize total cost by the number of points per shape.
    result = hungarian(costMatrix, false, true) / pointsPerShape;

    // Convert total error to a percentage
    // Modify the constant below (originally 0.175) to modify how sensitive
    // this function is to error.  Higher numbers make it more forgiving.
    // Note: this is Gaussian function.
    result = Math.exp(-((result*result)/0.175));

    return result;
  }
  
   hungarian = (function() {
    // Expose just the hgAlgorithm method
    // Usage: hungarian(matrix, [isProfitMatrix=false], [returnSum=false])
    return hgAlgorithm;

    // isProfitMatrix is optional, but if it exists and is the value
    // true, the costs will be treated as profits
    // returnSum is also optional, but will
    // sum up the chosen costs/profits and return that instead
    // of the assignment matrix.
    function hgAlgorithm(matrix, isProfitMatrix, returnSum) {
      var cost, maxWeight, i, j,
          mask = [], // the mask array: [matrix.length] x [matrix[0].length]
          rowCover = [], // the row covering vector: [matrix.length]
          colCover = [], // the column covering vector: [matrix[0].length]
          zero_RC = [0,0], // position of last zero from Step 4: [2]
          path = [], // [matrix.length * matrix[0].length + 2] x [2]
          step = 1,
          done = false,
          // Number.MAX_VALUE causes overflow on profits.
          // Should be larger or smaller than all matrix values. (i.e. -1 or 999999)
          forbiddenValue = -1, 
          assignments = [], // [min(matrix.length, matrix[0].length)] x [2]
          assignmentsSeen;

      // Create the cost matrix, so we can work without modifying the
      // original input.
      cost = copyOf(matrix);

      // If it's a rectangular matrix, pad it with a forbidden value (MAX_VALUE).
      // Whether they are chosen first or last (profit or cost, respectively)
      // should not matter, as we will not include assignments out of range anyway.
      makeSquare(cost, forbiddenValue);

      if(isProfitMatrix === true) {
        maxWeight = findLargest(cost);
        for(i=0; i<cost.length; i++) {
          for(j=0; j<cost[i].length; j++) {
            cost[i][j] = maxWeight - cost[i][j];
          }
        }
      }

      // Initialize the 1D arrays with zeros
      for(i=0; i<cost.length; i++) {
        rowCover[i] = 0;
      }
      for(j=0; j<cost[0].length; j++) {
        colCover[j] = 0;
      }

      // Initialize the inside arrays to make 2D arrays
      // Fill with zeros
      for(i=0; i<cost.length; i++) {
        mask[i] = [];
        for(j=0; j<cost[0].length; j++) {
          mask[i][j] = 0;
        }
      }
      for(i=0; i<Math.min(matrix.length, matrix[0].length); i++) {
        assignments[i] = [0,0];
      }
      for(i=0; i<(cost.length * cost[0].length + 2); i++) {
        path[i] = [];
      }

      // Matrix execution loop
      while(!done) {
        switch(step) {
          case 1:
            step = hg_step1(step, cost);
            break;
          case 2:
            step = hg_step2(step, cost, mask, rowCover, colCover);
            break;
          case 3:
            step = hg_step3(step, mask, colCover);
            break;
          case 4:
            step = hg_step4(step, cost, mask, rowCover, colCover, zero_RC);
            break;
          case 5:
            step = hg_step5(step, mask, rowCover, colCover, zero_RC, path);
            break;
          case 6:
            step = hg_step6(step, cost, rowCover, colCover);
            break;
          case 7:
            done = true;
            break;
        }
      }

      // In an input matrix taller than it is wide, the first assignment
      // column will have to skip some numbers, so the index will not
      // always match the first column.
      assignmentsSeen = 0;
      for(i=0; i<mask.length; i++) {
        for(j=0; j<mask[i].length; j++) {
          if(i < matrix.length && j < matrix[0].length && mask[i][j] === 1) {
            assignments[assignmentsSeen][0] = i;
            assignments[assignmentsSeen][1] = j;
            assignmentsSeen++;
          }
        }
      }

      if(returnSum === true) {
          // If you want to return the min or max sum instead of the assignment
          // array, set the returnSum argument (or use this
          // code on the return value outside of this function):
        var sum = 0;
        for(i=0; i<assignments.length; i++) {
          sum = sum + matrix[assignments[i][0]][assignments[i][1]];
        }
        return sum;
      } else {
        return assignments;
      }
    }

    function hg_step1(step, cost) {
      // For each row of the cost matrix, find the smallest element and
      // subtract it from every other element in its row.

      var minVal, i, j;

      for(i=0; i<cost.length; i++) {
        minVal = cost[i][0];
        for(j=0; j<cost[i].length; j++) {
          if(minVal > cost[i][j]) {
            minVal = cost[i][j];
          }
        }
        for(j=0; j<cost[i].length; j++) {
          cost[i][j] -= minVal;
        }
      }

      step = 2;
      return step;
    }

    function hg_step2(step, cost, mask, rowCover, colCover) {
      // Marks uncovered zeros as starred and covers their row and column.

      var i, j;

      for(i=0; i<cost.length; i++) {
        for(j=0; j<cost[i].length; j++) {
          if(cost[i][j] === 0 && colCover[j] === 0 && rowCover[i] === 0) {
            mask[i][j] = 1;
            colCover[j] = 1;
            rowCover[i] = 1;
          }
        }
      }

      // Reset cover vectors
      clearCovers(rowCover, colCover);

      step = 3;
      return step;
    }

    function hg_step3(step, mask, colCover) {
      // Cover columns of starred zeros.  Check if all columns are covered.

      var i, j, count;

      // Cover columns of starred zeros
      for(i=0; i<mask.length; i++) {
        for(j=0; j<mask[i].length; j++) {
          if(mask[i][j] === 1) {
            colCover[j] = 1;
          }
        }
      }

      // Check if all columns are covered
      count = 0;
      for(j=0; j<colCover.length; j++) {
        count += colCover[j];
      }

      // Should be cost.length, but okay, because mask has same dimensions
      if(count >= mask.length) {
        step = 7;
      } else {
        step = 4;
      }

      return step;
    }

    function hg_step4(step, cost, mask, rowCover, colCover, zero_RC) {
      // Find an uncovered zero in cost and prime it (if none, go to Step 6).
      // Check for star in same row: if yes, cover the row and uncover the
      // star's column.  Repeat until no uncovered zeros are left and go to
      // Step 6.  If not, save location of primed zero and go to Step 5.

      var row_col = [0,0], // size: 2, holds row and column of uncovered zero
          done = false,
          j, starInRow;

      while(!done) {
        row_col = findUncoveredZero(row_col, cost, rowCover, colCover);
        if(row_col[0] === -1) {
          done = true;
          step = 6;
        } else {
          // Prime the found uncovered zero
          mask[row_col[0]][row_col[1]] = 2;

          starInRow = false;
          for(j=0; j<mask[row_col[0]].length; j++) {
            // If there is a star in the same row...
            if(mask[row_col[0]][j] === 1) {
              starInRow = true;
              // Remember its column
              row_col[1] = j;
            }
          }

          if(starInRow) {
            rowCover[row_col[0]] = 1; // Cover the star's row
            colCover[row_col[1]] = 0; // Uncover its column
          } else {
            zero_RC[0] = row_col[0]; // Save row of primed zero
            zero_RC[1] = row_col[1]; // Save column of primed zero
            done = true;
            step = 5;
          }
        }
      }

      return step;
    }

    // Auxiliary function for hg_step4
    function findUncoveredZero(row_col, cost, rowCover, colCover) {
      var i, j, done;

      row_col[0] = -1; // Just a check value.  Not a real index.
      row_col[1] = 0;

      i = 0;
      done = false;

      while(!done) {
        j = 0;
        while(j < cost[i].length) {
          if(cost[i][j] === 0 && rowCover[i] === 0 && colCover[j] === 0) {
            row_col[0] = i;
            row_col[1] = j;
            done = true;
          }
          j = j+1;
        }
        i++;
        if(i >= cost.length) {
          done = true;
        }
      }

      return row_col;
    }

    function hg_step5(step, mask, rowCover, colCover, zero_RC, path) {
      // Construct series of alternating primes and stars.  Start with prime
      // from step 4.  Take star in the same column.  Next, take prime in the
      // same row as the star.  Finish at a prime with no star in its column.
      // Unstar all stars and star the primes of the series.  Erase any other
      // primes.  Reset covers.  Go to Step 3.

      var count, done, r, c;

      count = 0; // Counts rows of the path matrix
      path[count][0] = zero_RC[0]; // Row of last prime
      path[count][1] = zero_RC[1]; // Column of last prime

      done = false;
      while(!done) {
        r = findStarInCol(mask, path[count][1]);
        if(r >= 0) {
          count = count+1;
          path[count][0] = r; // Row of starred zero
          path[count][1] = path[count-1][1]; // Column of starred zero
        } else {
          done = true;
        }

        if(!done) {
          c = findPrimeInRow(mask, path[count][0]);
          count = count+1;
          path[count][0] = path[count-1][0]; // Row of primed zero
          path[count][1] = c;
        }
      }

      convertPath(mask, path, count);
      clearCovers(rowCover, colCover);
      erasePrimes(mask);

      step = 3;
      return step;
    }

    // Auxiliary function for hg_step5
    function findStarInCol(mask, col) {
      var r, i;

      // Again, this is a check value
      r = -1;
      for(i=0; i<mask.length; i++) {
        if(mask[i][col] === 1) {
          r = i;
        }
      }

      return r;
    }

    // Auxiliary function for hg_step5
    function findPrimeInRow(mask, row) {
      var c, j;

      c = -1;
      for(j=0; j<mask[row].length; j++) {
        if(mask[row][j] === 2) {
          c = j;
        }
      }

      return c;
    }

    // Auxiliary function for hg_step5
    function convertPath(mask, path, count) {
      var i;

      for(i=0; i<=count; i++) {
        if (mask[path[i][0]][path[i][1]] === 1) {
          mask[path[i][0]][path[i][1]] = 0;
        } else {
          mask[path[i][0]][path[i][1]] = 1;
        }
      }
    }

    // Auxiliary function for hg_step5
    function erasePrimes(mask) {
      var i, j;

      for(i=0; i<mask.length; i++) {
        for(j=0; j<mask[i].length; j++) {
          if(mask[i][j] === 2) {
            mask[i][j] = 0;
          }
        }
      }
    }

    // Auxiliary function for hg_step5 (and others)
    function clearCovers(rowCover, colCover) {
      var i, j;

      for(i=0; i<rowCover.length; i++) {
        rowCover[i] = 0;
      }
      for(j=0; j<colCover.length; j++) {
        colCover[j] = 0;
      }
    }

    function hg_step6(step, cost, rowCover, colCover) {
      // Find smallest uncovered value in cost: a.) Add it to every element of
      // uncovered rows, b.) Subtract it from every element of uncovered
      // columns.  Go to Step 4.

      var minVal, i, j;

      minVal = findSmallest(cost, rowCover, colCover);

      for(i=0; i<rowCover.length; i++) {
        for(j=0; j<colCover.length; j++) {
          if(rowCover[i] === 1) {
            cost[i][j] += minVal;
          }
          if(colCover[j] === 0) {
            cost[i][j] -= minVal;
          }
        }
      }

      step = 4;
      return step;
    }

    // Auxiliary function for hg_step6
    function findSmallest(cost, rowCover, colCover) {
      var minVal, i, j;

      // There cannot be a larger cost than this
      minVal = Number.MAX_VALUE;
      // Now, find the smallest uncovered value
      for(i=0; i<cost.length; i++) {
        for(j=0; j<cost[i].length; j++) {
          if(rowCover[i] === 0 && colCover[j] === 0 && minVal > cost[i][j]) {
            minVal = cost[i][j];
          }
        }
      }

      return minVal;
    }

    // Takes in a 2D array and finds the largest element
    // This is used in the Hungarian algorithm if the user chooses "max"
    // (indicating their matrix values represent profit) so that cost values
    // are subtracted from the largest value.
    function findLargest(matrix) {
      var i, j, largest = Number.MIN_VALUE;
      for(i=0; i<matrix.length; i++) {
        for(j=0; j<matrix[i].length; j++) {
          if(matrix[i][j] > largest) {
            largest = matrix[i][j];
          }
        }
      }
      return largest;
    }

    // Copies all elements of a 2D array to a new array
    function copyOf(original) {
      var i, j,
      copy = [];

      for(i=0; i<original.length; i++) {
        copy[i] = [];
        for(j=0; j<original[i].length; j++) {
          copy[i][j] = original[i][j];
        }
      }

      return copy;
    }

    // Makes a rectangular matrix square by padding it with some value
    // This modifies the matrix argument directly instead of returning a copy
    function makeSquare(matrix, padValue) {
      var rows = matrix.length,
      cols = matrix[0].length,
      i, j;

      if(rows === cols) {
        // The matrix is already square.
        return;
      } else if(rows > cols) {
        // Pad on some extra columns on the right.
        for(i=0; i<rows; i++) {
          for(j=cols; j<rows; j++) {
            matrix[i][j] = padValue;
          }
        }
      } else if(rows < cols) {
        // Pad on some extra rows at the bottom.
        for(i=rows; i<cols; i++) {
          matrix[i] = [];
          for(j=0; j<cols; j++) {
            matrix[i][j] = padValue;
          }
        }
      }
      // None of the above cases may execute if there is a problem with the input matrix.
    }

  })();

  // Sums up the number of points (relative to point pointIndex) in a particular
  // bin, defined by distanceBinNumber and angleBinNumber.  The pair
  // (distanceBinNumber, angleBinNumber) defines what is typically called
  // k, the polar bin.  This replaces the space requirement of a
  // 2D/k-bin histogram for each point.
  function shapeContextHistogram(pointIndex, distanceBinNumber, angleBinNumber, distanceBins, angleBins) {
    var i, accumulator=0, numberOfPoints=distanceBins.length;
    for(i=0; i<numberOfPoints; i++) {
      if(i!==pointIndex &&
         distanceBins[pointIndex][i]===distanceBinNumber &&
         angleBins[pointIndex][i]===angleBinNumber) {
        accumulator++;
      }
    }
    // Normalize by numberOfPoints (technically should be by numberOfPoints-1?)
    // Shouldn't make a difference
    return accumulator/numberOfPoints;
  }

  // Compute the Euclidean distance (as a crow flies) between two points.
  // Shortest distance between two pixels
  function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
  }

  // Compute the city block distance (or Manhattan distance) between two points.
  // Shortest 4-connected path between two pixels
  function cityBlockDistance(x1, y1, x2, y2) {
    return Math.abs(x1-x2) + Math.abs(y1-y2);
  }

  // Compute the chessboard distance between two points.
   function chessboardDistance(x1, y1, x2, y2) {
    return Math.max(Math.abs(x1-x2), Math.abs(y1-y2));
  }

  // Compute the length of a path.
  // Given an array of points in {x: Number, y: Number} format, calculate
  // the sum of the distances between consecutive points.  The distance
  // function must be specified.
  // TODO: Currently, there is no error checking (e.g. a valid callback).
  //       Either add it or make private.
   function computeLength(path, distanceFunction) {
    var distance, i;

    distance = 0;
    for(i=0; i<path.length-1; i++) {
      distance += distanceFunction(path[i].x, path[i].y, path[i+1].x, path[i+1].y);
    }
    return distance;
  }

  // Accepts an array of point arrays (multiple paths) and distributes a
  // specified number of points accross them, using the
  // distributePointsAcrossPath method.  This returns numberOfPoints point
  // objects in a single array, thus, path information is intentionally lost.
  function scatterPoints(paths, numberOfPoints) {
    var pointsNotAssigned = numberOfPoints,
        result = [],
        pathLength, lengthNotCovered, numberOfPointsForPath, path, point, i;

    // Compute the length of all paths
    lengthNotCovered = 0;
    for(i=0; i<paths.length; i++) {
      lengthNotCovered += computeLength(paths[i], euclideanDistance);
    }

    // Scatter points
    for(i=0; i<paths.length; i++) {
      path = paths[i];

      // Determine how many points this path will get, based on distance
      // The last path automatically gets any remaining points just in case
      // there is imprecision in the calculations
      pathLength = computeLength(path, euclideanDistance);
      numberOfPointsForPath = Math.round((pathLength / lengthNotCovered) * pointsNotAssigned);
      if(i === paths.length-1) {
        path = distributePointsAcrossPath(path, pointsNotAssigned);
        pointsNotAssigned = 0;
        lengthNotCovered = 0;
      } else {
        path = distributePointsAcrossPath(path, numberOfPointsForPath);
        pointsNotAssigned -= numberOfPointsForPath;
        lengthNotCovered -= pathLength;
      }

      // Put the points into the result array, disregarding separate paths
      for(j=0; j<path.length; j++) {
        point = path[j];
        result.push({x:point.x, y:point.y}); // copy of the point, not reference
      }
    }

    return result;
  }

  // Old version of algorithm that selects points from the original list of
  // points at a fixed interval... [1,1,1,2,3,4,7,8,9]  <--- select 5 points
  //                                ^   ^   ^   ^   ^
  // This is not ideal because points tend to get bunched up.  Use
  // the below, uncommented implementation instead.

  // Sketchy.distributePointsAcrossPath = function(path, numberOfPoints) {
  //   var result, pathIndexDelta, point, i,
  //       currPathIndex=0;

  //   if(numberOfPoints <= 0) {
  //     return [];
  //   }
  //   if(numberOfPoints === 1) {
  //     point = path[Math.floor((path.length-1)/2)]; // reference to original
  //     return [{x:point.x, y:point.y}]; // return a copy
  //   }

  //   pathIndexDelta = path.length/(numberOfPoints-1);

  //   // If numberOfPoints >= 2, we will manually add the first and last points
  //   // Add the first
  //   point = path[0];
  //   result = [{x:point.x, y:point.y}];

  //   for(i=1; i<numberOfPoints-1; i++) {
  //     currPathIndex += pathIndexDelta;
  //     point = path[Math.round(currPathIndex)];
  //     result.push({x:point.x, y:point.y}); // TODO: an error occurs (point is undefined) here when a short paths are drawn and shapeContextMatch is called
  //   }

  //   // Add the last
  //   point = path[path.length-1];
  //   result.push({x:point.x, y:point.y});

  //   return result;
  // }

  // Turn an array of points into another array representing the same
  // shape, but with only n points, uniformly distributed along the path
  // from the start point to the end point.  Path should be in
  // array-of-points format.
  function distributePointsAcrossPath(path, numberOfPoints) {
    var pathLength, delta, i, distanceCovered, distanceToNextPoint, angleToNextPoint,
        nextPathIndex = 1,
        currX = path[0].x,
        currY = path[0].y,
        result = [{x: currX, y: currY}]; // Manually add the first point

    pathLength = computeLength(path,euclideanDistance);
    delta = pathLength/numberOfPoints;

    for(i=1; i<(numberOfPoints-1); i++) {
      distanceCovered = 0;
      do {
        distanceToNextPoint = euclideanDistance(currX, currY,
                                path[nextPathIndex].x, path[nextPathIndex].y);

        // Determine whether to jump to the next point or only move partially
        // Last move will occur in >= case (yes, it could happen in if or else)
        if(distanceToNextPoint <= delta-distanceCovered) {
          // Simply move to the next point
          currX = path[nextPathIndex].x;
          currY = path[nextPathIndex].y;
          nextPathIndex++;
          distanceCovered += distanceToNextPoint;
        } else {
          // Move partially
          angleToNextPoint = Math.atan2(path[nextPathIndex].y - currY,
                                        path[nextPathIndex].x - currX);
          currX = currX + Math.cos(angleToNextPoint) * (delta-distanceCovered);
          currY = currY + Math.sin(angleToNextPoint) * (delta-distanceCovered);
          distanceCovered = delta;
        }
      } while(distanceCovered < delta);
      // TODO: discretize currX and currY before pushing?
      result.push({x: currX, y: currY});
    }
    // Manually add on the last point
    result.push(path[path.length-1]);
    return result;
  }