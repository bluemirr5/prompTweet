package main

import (
	"encoding/json"
	"net/http"
)

func putTweet(w http.ResponseWriter, r *http.Request) {
	addedTweetSet := new(tweetSet)
	var bodyString string
	var n int = 1
	for n != 0 {
		buf := make([]byte, 1024)
		n, _ = r.Body.Read(buf)
		bodyString = bodyString + byteToString(buf)
	}
	json.Unmarshal([]byte(bodyString), addedTweetSet)
	tweetSetList = append(tweetSetList, addedTweetSet)
	for _, wsFrontTarget := range wsFrontTargetList {
		wsFrontTarget.Write([]byte(bodyString))
	}
	w.Write([]byte("ok"))
}

func getTweet(w http.ResponseWriter, r *http.Request) {
	if len(tweetSetList) > 0 {
		tweetList, _ := json.Marshal(tweetSetList)
		w.Write(tweetList)
	} else {
		return
	}
}

func byteToString(c []byte) string {
	n := -1
	for i, b := range c {
		if b == 0 {
			break
		}
		n = i
	}
	return string(c[:n+1])
}
