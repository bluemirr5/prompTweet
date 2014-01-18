package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

const layout = "2006-01-02 PM 3:04"

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
	addedTweetSet.RegisterDate = time.Now().Format(layout)
	if len(tweetSetList) >= MAX_TWEET_NUM {
		tweetSetList = tweetSetList[1:]
	}
	tweetSetList = append(tweetSetList, addedTweetSet)
	for _, wsFrontTarget := range wsFrontTargetList {
		data, _ := json.Marshal(addedTweetSet)
		wsFrontTarget.Write(data)
	}
	w.Write([]byte("ok"))
}

func getTweet(w http.ResponseWriter, r *http.Request) {
	channel := r.FormValue("channel")
	retTweetList := getTargetTweet(channel)
	if len(retTweetList) > 0 {
		if len(retTweetList) > 10 {
			tweetList, _ := json.Marshal(retTweetList[len(retTweetList)-10 : len(retTweetList)])
			w.Write(tweetList)
		} else {
			tweetList, _ := json.Marshal(retTweetList)
			w.Write(tweetList)
		}
	} else {
		return
	}
}

func getTargetTweet(channel string) []*tweetSet {
	var retTweetList []*tweetSet
	for _, tweet := range tweetSetList {
		message := tweet.TweetMessage
		firstStr := subStr(message, 0, 1)
		etcStr := subStr(message, 1, len(message)-1)
		parsedMessage := strings.Split(etcStr, "#")
		if firstStr == "#" {
			if len(parsedMessage) == 2 && parsedMessage[0] == channel {
				retTweetList = append(retTweetList, tweet)
			}
		} else {
			retTweetList = append(retTweetList, tweet)
		}
	}
	return retTweetList
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

func subStr(s string, pos, length int) string {
	runes := []rune(s)
	l := pos + length
	if l > len(runes) {
		l = len(runes)
	}
	return string(runes[pos:l])
}
