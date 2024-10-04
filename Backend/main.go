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
	Start Point      `json:"start"`
	End   Point      `json:"end"`
	Grid  [][]string `json:"grid"`
}

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.POST("/find-path", func(c *gin.Context) {
		var req PathRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// log.Printf("Received grid: %v", req.Grid)

		path := findDFSPath(req.Start, req.End, req.Grid)
		c.JSON(http.StatusOK, gin.H{"path": path})
	})
	router.Run(":8080")
}

func findDFSPath(start, end Point, grid [][]string) []Point {
	// log.Printf("Received grid: %v", req.Grid)
	path := []Point{}
	visited := make(map[Point]bool)

	var dfs func(Point) bool
	dfs = func(p Point) bool {
		// Check if out of bounds, visited, or if the cell is an obstacle
		if p.X < 0 || p.Y < 0 || p.X >= len(grid) || p.Y >= len(grid[0]) || visited[p] || grid[p.X][p.Y] == "obstacle" {
			return false
		}

		visited[p] = true
		path = append(path, p)

		if p == end {
			return true
		}

		// possible directions to move in
		directions := []Point{
			{0, 1}, {1, 0}, {0, -1}, {-1, 0},
		}

		for _, dir := range directions {
			next := Point{p.X + dir.X, p.Y + dir.Y}
			if dfs(next) {
				return true
			}
		}

		path = path[:len(path)-1] // backtrack if no valid path
		return false
	}

	dfs(start)
	return path
}
