package main

import (
	"net/http"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
)

type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type PathRequest struct {
	Start Point `json:"start"`
	End   Point `json:"end"`
}

func main() {
	router := gin.Default()

	// Explicit CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Allow the frontend's origin
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// router.POST("/find-path", func(c *gin.Context) {
	// 	var req PathRequest
	// 	if err := c.ShouldBindJSON(&req); err != nil {
	// 		c.JSON(400, gin.H{"error": err.Error()})
	// 		return
	// 	}
	// 	path := findDFSPath(req.Start, req.End)
	// 	c.JSON(200, gin.H{"path": path})
	// })
	router.POST("/find-path", func(c *gin.Context) {
		var req PathRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		grid := make([][]string, 20)
		for i := range grid {
			grid[i] = make([]string, 20)
		}
		path := findDFSPath(req.Start, req.End, grid) // Pass the grid to the DFS function
		c.JSON(http.StatusOK, gin.H{"path": path})
	})

	router.Run(":8080")
}

// Depth-First Search (DFS) algorithm to find a path
// func findDFSPath(start, end Point) []Point {
// 	grid := make([][]bool, 20)
// 	for i := range grid {
// 		grid[i] = make([]bool, 20)
// 	}

// 	path := []Point{}
// 	visited := make(map[Point]bool)

// 	var dfs func(Point) bool
// 	dfs = func(p Point) bool {
// 		if p.X < 0 || p.Y < 0 || p.X >= 20 || p.Y >= 20 || visited[p] {
// 			return false
// 		}

// 		visited[p] = true
// 		path = append(path, p)

// 		if p == end {
// 			return true
// 		}

// 		directions := []Point{
// 			{0, 1}, {1, 0}, {0, -1}, {-1, 0},
// 		}

// 		for _, dir := range directions {
// 			next := Point{p.X + dir.X, p.Y + dir.Y}
// 			if dfs(next) {
// 				return true
// 			}
// 		}

// 		path = path[:len(path)-1]
// 		return false
// 	}

//		dfs(start)
//		return path
//	}
func findDFSPath(start, end Point, grid [][]string) []Point {
	path := []Point{}
	visited := make(map[Point]bool)

	var dfs func(Point) bool
	dfs = func(p Point) bool {
		if p.X < 0 || p.Y < 0 || p.X >= 20 || p.Y >= 20 || visited[p] || grid[p.X][p.Y] == "obstacle" {
			return false
		}

		visited[p] = true
		path = append(path, p)

		if p == end {
			return true
		}

		directions := []Point{
			{0, 1}, {1, 0}, {0, -1}, {-1, 0},
		}

		for _, dir := range directions {
			next := Point{p.X + dir.X, p.Y + dir.Y}
			if dfs(next) {
				return true
			}
		}

		path = path[:len(path)-1]
		return false
	}

	dfs(start)
	return path
}
