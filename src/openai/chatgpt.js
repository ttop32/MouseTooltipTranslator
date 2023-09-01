


const apiPath = "https://streaming-worker.forefront.workers.dev/chat";
const forefrontToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yTzZ3UTFYd3dxVFdXUWUyQ1VYZHZ2bnNaY2UiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NoYXQuZm9yZWZyb250LmFpIiwiZXhwIjoxNjkzNTQ5MjUwLCJpYXQiOjE2OTM1NDkxOTAsImlzcyI6Imh0dHBzOi8vY2xlcmsuZm9yZWZyb250LmFpIiwibmJmIjoxNjkzNTQ5MTgwLCJzaWQiOiJzZXNzXzJVbWVNY0RiRkF3VEZ4STdSeFZOZ0NxdThKZyIsInN1YiI6InVzZXJfMlVtZU1XR2xDaW9pZjNGcXBrV1JtcENyazJJIn0.BJtNM1dytUHOc3s5NDQEtqMa6T3giJFxU98gVQiteqBDDWpLZfYEc_0ma-PLyW8xgDVvt9l2QZK_s-H_G2mQCVkSgE8xLBwKTFgDWuq745rhBxS4tybSuqNfbpAfMTT-yggdu6qL9dHa87ZRNn1C_4kpCDb9WfKASkKAQzX6tdMPmbA5-f_Xry3QTLfvzytINXRzp0Z1eCKFj1ZuXlBoBqm0P5UMveCkKSgIRSSEapawO7VjwjObqjiT9-PQ0HmXnuqnynH8nriHE_bh0BEI_Qu3GBdvhjtUvKpthmm7xTSzwMV4AOE-T9NQWFywtUJB9lS-M33W2qfcwnjODoJC_Q";

export default class chatgpt {

  static async fetchJson(url, options = {}) {
    return await fetch(url, options)
      .then((response) => response.json())
      .catch((err) => console.log(err));
  }

  static async fetchText(url, options = {}) {
    return await fetch(url, options)
      .then((response) => response.text())
      .catch((err) => console.log(err));
  }

  static async requestTranslateByPrompt(prompt) {
    const params = {
      "text": prompt,
      "action": "new",
      "id": "dav66vupo",
      "parentId": "5960a458-41e6-45e1-87bf-3cdbe2102c15",
      "workspaceId": "5960a458-41e6-45e1-87bf-3cdbe2102c15",
      "messagePersona": "default",
      "model": "gpt-3.5-turbo",
      "messages": [],
      "internetMode": "never",
      "hidden": false
    };

    return await this.fetchText(apiPath, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${forefrontToken}`,
        'Content-Type': "application/json",
      },
      body: JSON.stringify(params)
    });
  }

  static async wrapResponse(response) {
    const result = response.split('data: ').at(-1).slice(1, -3).replace(/\\n/g, ' • ').replace(/\\"/g, '');
    return result;
  }

  static async generatePrompt(text, fromLang, targetLang) {
    const prompt =
        `Act as an English tutor.\n` +
        `Give me 2 alternative translations that convey a similar sentiment about the above sentence in ranking from phrases that have words native speakers would use in everyday conversation to words native speakers would rarely use.\n` + 
        `Just give me the 2 translated ranked sentences. Don't give me any explanation about the translated sentence.\n` +
        `Source text: "${text}"\n`;

    return prompt;
  }

  static async translate(text, fromLang, targetLang) {
    try {
      var prompt = await this.generatePrompt(text, fromLang, targetLang);
      var response = await this.requestTranslateByPrompt(prompt);
      var translatedText = await this.wrapResponse(response);
  
      return {
        translatedText,
        transliteration: "",
        sourceLang: "en",
        targetLang: "en",
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }
}