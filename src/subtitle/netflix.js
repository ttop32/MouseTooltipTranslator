import BaseVideo from "./baseVideo";
import $ from "jquery";



// https://github.com/mikesteele/dual-captions/blob/b0ab92e4670100a27b76b2796995ad1be89f1672/site_integrations/netflix/index.js
// https://stackoverflow.com/questions/42105028/netflix-video-player-in-chrome-how-to-seek

export default class Netflix extends BaseVideo {
  static sitePattern = /^(https:\/\/)(www\.netflix\.com)/;
  static captionRequestPattern = /^(https:\/\/).*(nflxvideo\.net)\/\?o=1/;
  static baseUrl = "https://www.netflix.com";

  static playerSelector = "";
  static playerApiSelector = "";
  static captionContainerSelector = "";
  static captionWindowSelector = "";
  static captionBoxSelector = "";
  static sub={};

  static #injectScriptConstructor = (() => {
    console.log("Netflix inject script constructor");
    
    this.listenMessageFrameFromInject();
  })();

  static async handleUrlChange(url = window.location.href) {
    console.log("Netflix handle url change");
    this.pausedByExtension = false;
    this.callMethodFromInject("activateCaption", url);
    // this.activateCaption(url);
  }
  static async activateCaption(url) {
    // alert("Activating captions for URL: " + url);
    // console.log("Netflix activate caption");




        //        request track
        // parse
        // lang video id current
        

        // video audio and get lang
        // video lang to request audio
        // 
        // 
        // no tittle or only one title
        // current lang and off
        // target lang and off
        // current lang and source lang
        // current lang and target lang 


    console.log("before inject=======================inject")


    console.log(this.setting)
    
    console.log(this.setting["subtitleButtonToggle"])
    
    // skip if user caption off, is shorts skip
    if (
      this.setting["subtitleButtonToggle"] == "false" ||
      !this.isVideoUrl(url)
    ) {
      return;
    }
    console.log("before inject=======================inject2")

    await this.waitPlayerReady(); //wait player load
    // get video lang
    var lang= await this.guessVideoLang();

    // this.killInterceptDebounce(); // end caption intercept
    // await this.interceptCaption(); // start caption intercept
    this.requestTrack(lang,false); //turn on caption on specified lang
  
  }
  static async isVideoUrl(url) {    
    console.log(url)
    console.log(url.includes(`${this.baseUrl}/watch`))
    return url.includes(`${this.baseUrl}/watch`);
  }

  // static checkPlayerReady() {
  //   return this.getPlayer()?.readyState >= 3;
  // }
  static async waitPlayerReady() {
    await this.waitUntilForever(() => this.getPlayer());
    // var player=await this.getPlayer()
    // await this.waitUntilForever(() => player.getAudioTrack());

    
  }
  static setPlayerCaption(lang) {

    
    this.getPlayer().setTimedTextTrack(lang);
  }


  static async getPlayer() {
    

    
    var videoPlayer = window?.netflix?.appContext
      ?.state
      ?.playerApp
      ?.getAPI()
      .videoPlayer
    var playerSessionId = videoPlayer?.getAllPlayerSessionIds()
      .find(s => s.includes("watch"));
      console.log("videoPlayer")
    console.log(videoPlayer)
    console.log("playerSessionId")
    console.log(playerSessionId)
    var player = videoPlayer?.getVideoPlayerBySessionId(playerSessionId)
    console.log("player");
    console.log(player);
    
    return player
  }
  static turnOff(){
    // const player = this.getPlayer();
    player.setTimedTextTrack(offTrack);
  }


  static async getVideoId() {
    return this.getPlayer().getMovieId()
  }
  static async guessVideoLang(videoId) {
    var player=await this.getPlayer()
    await this.waitUntilForever(() => player.getAudioTrack());
    console.log(player)
    console.log(player.getAudioTrack())
    return await this.getPlayer()?.getAudioTrack()?.bcp47
  }
  static guessSubtitleLang(url, subtitle) {
    // return this.getPlayer().getTimedTextTrack().bcp47
  }

  static async interceptCaption() {
    if (this.interceptorLoaded) {
      return;
    }
    this.interceptorLoaded = true;
    this.interceptor.apply();
    this.interceptor.on("request", async ({ request, requestId }) => {
      try {


        
        
        

        if (this.captionRequestPattern.test(request.url)) {
          //get source lang sub
          var response = await this.requestSubtitle(request.url);
          var targetLang = this.setting["translateTarget"];
          // var sourceLang = this.guessSubtitleLang(request.url);

          var xml= await response.text()
          var sub1 = this.parseSubtitle(xml);
          var responseSub = sub1;
          


          if(sub1.lang != targetLang){
            var sub2 = await this.requestTrack(targetLang);
            var mergedSub = this.mergeSubtitles(sub1, sub2);
            responseSub = mergedSub;
            console.log("merged@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
            console.log(mergedSub)
          }
          
          var xmlRes=this.encodeMergedSubtitles(responseSub.xmlDoc, responseSub.subtitles);


          request.respondWith(
            new Response(xmlRes)
          );
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
  

  static async requestSubtitle(subUrl, lang, tlang, videoId) {
    var res = await fetch(subUrl);    
    return res;      
  }
  static async requestTrack(lang, resetSub=true) {

    console.log("request track");
    console.log(lang);
    
    
    var player= await this.getPlayer()

    console.log("requestTracksssssssssssssssssssss");
      
    console.log(player);
    
    var subList=player.getTimedTextTrackList()
    var prevSub=player.getTimedTextTrack()
    const selectedTimedTextTrack = subList
      .sort((a, b) => (a.trackType === 'ASSISTIVE' ? -1 : 1))
      .find((textTrack) => textTrack.bcp47 === lang);

    if (!selectedTimedTextTrack) {
      return null;
    }

    player.setTextTrack(selectedTimedTextTrack)    
    await this.waitUntilForever(() => this.sub?.[lang]);

    if(resetSub){
      player.setTextTrack(prevSub)
    }
    return this.sub[lang]

  }
  

  static parseSubtitle(sub) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sub, "text/xml");
    const subtitles = xmlDoc.getElementsByTagName("p");
    var lang = xmlDoc.documentElement.getAttribute("xml:lang");
    
    

    const parsedSubtitles = [];
    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i];
      const start = parseInt(subtitle.getAttribute("begin").replace("t", ""));
      const end = parseInt(subtitle.getAttribute("end").replace("t", ""));
      const text = subtitle.textContent;
      parsedSubtitles.push({ start, end, text, lang });
    }

    

    const div = xmlDoc.getElementsByTagName("div")[0];
    if (div) {
      div.parentNode.removeChild(div);
    }


    var parsedSubMeta= {
      xmlDoc,
      lang,
      subtitles: parsedSubtitles,
    }
    this.sub[parsedSubMeta.lang]=parsedSubMeta;

    console.log(sub)
    console.log(parsedSubMeta);
    return parsedSubMeta
  }

  static mergeSubtitles(sub1Meta, sub2Meta) {

    var mergedSub=[]
    var sub1=sub1Meta.subtitles;
    var sub2=sub2Meta.subtitles;

    // fix mismatch length between sub1 sub2
    for (let [i, sub1Line] of sub1.entries()) {
      var line1 = sub1Line
      var line2 = "";
      // get most overlapped sub
      sub2.forEach((line) => {
        line.overlap = Math.max(
          sub1Line.end - line.start,
          line.end - sub1Line.start
        );
      });
      mergedSub.push(line1)

      sub2.sort((a, b) => a.overlap - b.overlap);
      
      if (sub2.length && 0 < sub2[0].overlap) {
        line2 = sub2[0];
        // line1.text = line1.text+"\n" + line2.text;

        let line1Copy = { ...line1 }
        line1Copy.text=line2.text;
        mergedSub.push(line1Copy)
      }
    }
    
    return {
      xmlDoc: sub1Meta.xmlDoc,
      lang: sub1Meta.lang,
      subtitles: mergedSub,
    } 
  }


  static encodeMergedSubtitles(xmlDoc, mergedSubtitles) {
    const body = xmlDoc.getElementsByTagName("body")[0];
    let div = body.getElementsByTagName("div")[0];
    if (!div) {
      div = xmlDoc.createElement("div");
      body.appendChild(div);
    }

    
    mergedSubtitles.forEach(sub => {
      const p = xmlDoc.createElement("p");
      p.setAttribute("xml:id", `subtitle${mergedSubtitles.indexOf(sub) + 1}`);
      p.setAttribute("begin", `${sub.start}t`);
      p.setAttribute("end", `${sub.end}t`);
      p.setAttribute("region", "region0");

      const span = xmlDoc.createElement("span");
      span.setAttribute("style", "style1");
      span.textContent = sub.text;

      p.appendChild(span);
      div.appendChild(p);
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  }

  static encodeSubtitle(subtitles) {
    return subtitles;
  }    

}


    // class player-timedtext
