package main

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	locations "github.com/elonsoc/center/locations"
	"github.com/elonsoc/center/service"
)

// this represents a database of API keys issued
var APIKEYS = map[string]bool{
	"12345": true,
}

func CheckAuth(next http.Handler) http.Handler {
	// this middleware is a proof of concept, in reality you'd want to check the API key
	// against a database and validate that it's from a trusted source
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Checking auth")
		auth := r.Header.Get("Authorization")
		if auth == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		if !APIKEYS[auth] {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func initialize() chi.Router {
	// Create a new instance of the router
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	r.Use(CheckAuth)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("If you're seeing this, you're authenticated!"))
	})

	// initialize the services we'll be using
	Services := service.NewService()

	r.Mount("/locations", locations.NewLocationsRouter(&locations.LocationsRouter{Svcs: Services}).Router)

	return r
}

func main() {
	err := http.ListenAndServe(":1337", initialize())
	if err != nil {
		fmt.Println(err)
	}
}
