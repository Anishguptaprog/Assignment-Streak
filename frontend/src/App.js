import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const arrLen = 20;
  const [grid, setGrid] = useState(
    Array.from({ length: arrLen }, () => Array(arrLen).fill(null))
  );
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  
  const [addingObstacle, setAddingObstacle] = useState(false);
  const toggleAddObstacle = () => {
    setAddingObstacle((prev) => !prev);
  };

  const handleClick = (row, col) => {
    if (addingObstacle) {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) => r.slice());
        newGrid[row][col] =
          newGrid[row][col] === "obstacle" ? null : "obstacle";
        return newGrid;
      });
    } else if (!start) {
      setStart([row, col]);
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) => r.slice());
        newGrid[row][col] = "start";
        return newGrid;
      });
    } else if (!end) {
      setEnd([row, col]);
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) => r.slice());
        newGrid[row][col] = "end";
        return newGrid;
      });
      findPath([row, col]);
    }
  };
  // Reset the grid
  const resetGrid = () => {
    setGrid(Array.from({ length: arrLen }, () => Array(arrLen).fill(null)));
    setStart(null);
    setEnd(null);
    setAddingObstacle(false);
  };
  // func to highlight path
  const highlightPath = (path) => {
    if (!Array.isArray(path)) {
      console.error("Invalid path format:", path);
      return;
    }

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.slice());

      path.forEach((point) => {
        // Check if point is an object with x, y properties and mark it as path which is to be highlighted
        if (typeof point === "object" && "x" in point && "y" in point) {
          const { x, y } = point;
          if (x >= 0 && x < arrLen && y >= 0 && y < arrLen) {
            newGrid[x][y] = "path";
          }
        } else {
          console.error("Invalid point in path:", point);
        }
      });

      return newGrid;
    });
  };
  // Function to send start, end and obstacle points to the backend and receive the path
  const findPath = async (endPoint) => {
    const requestData = {
      start: { x: start[0], y: start[1] },
      end: { x: endPoint[0], y: endPoint[1] },
      grid: grid.map((row) =>
        row.map((cell) => (cell === "obstacle" ? "obstacle" : null))
      ),
    };

    console.log("Sending request data:", requestData);
    console.log("Sending grid with obstacles:", requestData.grid);

    try {
      const response = await axios.post(
        "http://localhost:8080/find-path",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const receivedPath = response.data.path;
      if (Array.isArray(receivedPath)) {
        highlightPath(receivedPath);
      } else {
        console.error("Received an invalid path from backend:", receivedPath);
      }
    } catch (error) {
      console.error("Error fetching path:", error);
    }
  };

  return (
    <div className="grid-container">
      <h1 className="heading">StreakAI Assignment</h1>
      <div>
        <div className="grid">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${
                  start && start[0] === rowIndex && start[1] === colIndex
                    ? "start"
                    : end && end[0] === rowIndex && end[1] === colIndex
                    ? "end"
                    : cell === "path"
                    ? "path"
                    : cell === "obstacle"
                    ? "obstacle"
                    : ""
                }`}
                onClick={() => handleClick(rowIndex, colIndex)}
              ></div>
            ))
          )}
        </div>
        <button onClick={resetGrid}>Reset Grid</button>
        <button onClick={toggleAddObstacle}>
          {addingObstacle ? "Cancel Adding Obstacles" : "Add Obstacle"}
        </button>
      </div>
    </div>
  );
};

export default App;
