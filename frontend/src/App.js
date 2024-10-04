import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: 20 }, () => Array(20).fill(null)) // 20x20 grid initialized to null
  );
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  // const handleClick = (row, col) => {
  //   console.log(`Cell clicked: Row ${row}, Col ${col}`);

  //   // Setting start and end points
  //   if (!start) {
  //     console.log("Setting start point");
  //     setStart([row, col]);
  //   } else if (!end) {
  //     console.log("Setting end point");
  //     setEnd([row, col]);
  //     findPath([row, col]);  // Call the backend to find the path
  //   }
  // };
  const [addingObstacle, setAddingObstacle] = useState(false); // New state for obstacle mode

const toggleAddObstacle = () => {
  setAddingObstacle((prev) => !prev); // Toggle the obstacle mode
};

// In your return statement, add the button


const handleClick = (row, col) => {
  console.log(`Cell clicked: Row ${row}, Col ${col}`);

  if (addingObstacle) {
    // Add obstacle if in obstacle-adding mode
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.slice());
      newGrid[row][col] = newGrid[row][col] === "obstacle" ? null : "obstacle"; // Toggle obstacle
      return newGrid;
    });
  } else if (!start) {
    // Set start point
    console.log("Setting start point");
    setStart([row, col]);
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.slice());
      newGrid[row][col] = "start";  // Mark start point
      return newGrid;
    });
  } else if (!end) {
    // Set end point
    console.log("Setting end point");
    setEnd([row, col]);
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.slice());
      newGrid[row][col] = "end";  // Mark end point
      return newGrid;
    });
    findPath([row, col]);  // Call the backend to find the path
  }
 else {
      // Toggle obstacle placement
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) => r.slice());
        newGrid[row][col] = newGrid[row][col] === "obstacle" ? null : "obstacle";  // Toggle obstacle
        return newGrid;
      });
    }
  };
  
  const resetGrid = () => {
    setGrid(Array.from({ length: 20 }, () => Array(20).fill(null))); // Reset the grid
    setStart(null);  // Clear start point
    setEnd(null);    // Clear end point
    setAddingObstacle(false);  // Reset obstacle mode
  };
  
  // In your return statement, update the button
  
  
  // Function to highlight the DFS path
  const highlightPath = (path) => {
    // Ensure that path is an array of objects with x, y properties
    if (!Array.isArray(path)) {
      console.error("Invalid path format:", path);
      return;
    }
  
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.slice());
  
      path.forEach((point) => {
        // Check if point is an object with x, y properties
        if (typeof point === 'object' && 'x' in point && 'y' in point) {
          const { x, y } = point;
          if (x >= 0 && x < 20 && y >= 0 && y < 20) {
            newGrid[x][y] = "path";  // Mark the cell as part of the path
          }
        } else {
          console.error("Invalid point in path:", point);
        }
      });
  
      return newGrid;
    });
  };
  
  
  // Function to send start and end points to the backend and receive the path
  const findPath = async (endPoint) => {
    const requestData = {
      start: { x: start[0], y: start[1] },
      end: { x: endPoint[0], y: endPoint[1] },
      grid: grid.map(row => row.map(cell => (cell === "obstacle" ? "obstacle" : null))) // send the grid state
    };
  
    console.log("Sending request data:", requestData);
  
    try {
      const response = await axios.post("http://localhost:8080/find-path", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
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
  
  // const findPath = async (endPoint) => {
  //   const requestData = {
  //     start: { x: start[0], y: start[1] },
  //     end: { x: endPoint[0], y: endPoint[1] },
  //   };
  
  //   console.log("Sending request data:", requestData);
  
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:8080/find-path",
  //       requestData,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  
  //     const receivedPath = response.data.path;
  //     if (Array.isArray(receivedPath)) {
  //       highlightPath(receivedPath);  // Pass the path to the highlight function
  //     } else {
  //       console.error("Invalid path received:", receivedPath);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching path:", error.message);
  //   }
  // };
  


  // return (
  //   <div>
  //     <div className="grid">
  //       {grid.map((row, rowIndex) =>
  //         row.map((cell, colIndex) => (
  //           <div
  //             key={`${rowIndex}-${colIndex}`}
  //             className={`cell ${
  //               start && start[0] === rowIndex && start[1] === colIndex
  //                 ? "start"
  //                 : end && end[0] === rowIndex && end[1] === colIndex
  //                 ? "end"
  //                 : cell === "path"  // Highlight cells that belong to the path
  //                 ? "path"
  //                 : ""
  //             }`}
  //             onClick={() => handleClick(rowIndex, colIndex)}
  //           ></div>
  //         ))
  //       )}
  //     </div>
  //     <button onClick={() => setGrid(Array.from({ length: 20 }, () => Array(20).fill(null)))}>Reset Grid</button>
  //   </div>
  // );
  return (
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
                  : cell === "obstacle"  // Highlight obstacles
                  ? "obstacle"
                  : ""
              }`}
              onClick={() => handleClick(rowIndex, colIndex)}
            ></div>
          ))
        )}
      </div>
      {/* <button onClick={() => setGrid(Array.from({ length: 20 }, () => Array(20).fill(null)))}>Reset Grid</button> */}
      <button onClick={resetGrid}>Reset Grid</button>
      <button onClick={toggleAddObstacle}>
  {addingObstacle ? "Cancel Adding Obstacles" : "Add Obstacle"}
</button>
    </div>
  );
  
};

export default App;
