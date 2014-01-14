package main

import (
	"code.google.com/p/go.net/websocket"
	"net/http"
)

var wsFrontTargetList []*websocket.Conn
var expireChannel chan int
var tweetSetList []*tweetSet

const (
	MAX_TWEET_NUM  = 100
	PAGE_TWEET_NUM = 10
)

type tweetSet struct {
	RandomId      string
	RandomIconNum string
	TweetMessage  string
}

func main() {
	expireChannel = make(chan int)
	http.Handle("/ws", websocket.Handler(addWsServer))
	http.HandleFunc("/putTweet", putTweet)
	http.HandleFunc("/getTweet", getTweet)
	http.Handle("/image/", http.StripPrefix("/image/", http.FileServer(http.Dir("./views/img/"))))
	http.ListenAndServe(":9090", nil)
	exFlag := <-expireChannel
	if exFlag == 1 || exFlag == 2 {
		//
	}
}

func addWsServer(ws *websocket.Conn) {
	wsFrontTargetList = append(wsFrontTargetList, ws)

	exFlag := <-expireChannel
	if exFlag == 1 || exFlag == 2 {
		//
	}
}
