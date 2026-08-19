package main

import (
	"log"
	"os"
	"torch/src/endpoints"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.Default())

	router.GET("/status/java/:ip", endpoints.FetchJavaHandler)
	router.GET("/status/bedrock/:ip", endpoints.FetchBedrockHandler)
	router.GET("/status/auto/:ip", endpoints.AutoStatusHandler)
	router.GET("/diagnostics/:ip", endpoints.DiagnosticsHandler)
	router.GET("/srv/:host", endpoints.SrvHandler)
	router.GET("/icon/:ip", endpoints.IconHandler)
	router.GET("/ping", endpoints.PingHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
