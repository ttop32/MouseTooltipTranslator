<template>
  <popupWindow>
    <div>
      <!-- about top nav bar====================================== -->
      <v-img
        height="200"
        src="/floating-maple-leaf.jpg"
        class="text-white"
        cover
      >
        <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
          <template v-slot:prepend>
            <v-btn dark icon class="mr-4" @click="$router.go(-1)">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </template>
        </v-toolbar>
        <v-spacer></v-spacer>
        <v-card-title class="text-white text-wrap">
          <div class="text-h4 pl-12 pt-12">Mouse Tooltip Translator</div>
        </v-card-title>
      </v-img>

      <!-- about page contents list====================================== -->
      <v-list>
        <v-list-item
          v-for="(aboutPageItem, key) in aboutPageList"
          :key="key"
          :title="aboutPageItem.name"
          :subtitle="aboutPageItem.sub_name"
          @click="openUrl(aboutPageItem.url, aboutPageItem.isPanelOpen)"
        >
          <template v-slot:prepend>
            <v-avatar :color="aboutPageItem.color">
              <v-icon size="25" color="white">{{ aboutPageItem.icon }}</v-icon>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </popupWindow>
</template>
<script>
import browser from "webextension-polyfill";
// import * as util from "/src/util";

var reviewUrlJson = {
  nnodgmifnfgkolmakhcfkkbbjjcobhbl:
    "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl", //edge web store id
  hmigninkgibhdckiaphhmbgcghochdjc:
    "https://chromewebstore.google.com/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews", //chrome web store id
  firefox:
    "https://addons.mozilla.org/en-US/firefox/addon/mouse-tooltip-translator-pdf/reviews/",
  default:
    "https://chromewebstore.google.com/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
};

export default {
  name: "AboutView",
  data() {
    return {
      aboutPageList: {
        howToUse: {
          name: browser.i18n.getMessage("How_to_use"),
          sub_name: browser.i18n.getMessage("Check_how_to_use_this_extension"),
          url: "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use",
          icon: "mdi-help-box",
          color: "green",
        },
        pdfViewer: {
          name: browser.i18n.getMessage("PDF_Viewer"),
          sub_name: browser.i18n.getMessage("Translate_local_PDF_file"),
          url:
            browser.runtime.getURL("/pdfjs/web/viewer.html") +
            "?file=/pdf_demo.pdf",
          icon: "mdi-file-pdf-box",
          color: "red",
        },
        epub: {
          name: browser.i18n.getMessage("Ebook_Reader"),
          sub_name: browser.i18n.getMessage("Translate_local_ebook_file"),
          url: browser.runtime.getURL("/foliate-js/reader.html"),
          icon: "mdi-book-open-blank-variant",
          color: "orange",
        },
        voicePanel: {
          name: browser.i18n.getMessage("Voice_Panel"),
          sub_name: browser.i18n.getMessage("Translate_Voice"),
          url: "/popup.html#/speech",
          icon: "mdi-microphone-message",
          color: "cyan",
          isPanelOpen: true,
        },
        reviewPage: {
          name: browser.i18n.getMessage("Review_Page"),
          sub_name: browser.i18n.getMessage("Comment_on_this_extension"),
          url: this.getReviewUrl(),
          icon: "mdi-message-draw",
          color: "primary",
        },
        sourceCode: {
          name: browser.i18n.getMessage("Source_code"),
          sub_name: browser.i18n.getMessage("Check_source_code_in_github"),
          url: "https://github.com/ttop32/MouseTooltipTranslator",
          icon: "mdi-github",
          color: "black",
        },
        privacyPolicy: {
          name: browser.i18n.getMessage("Privacy_Policy"),
          sub_name: browser.i18n.getMessage("User_privacy_policy"),
          url: "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/privacy_policy.md",
          icon: "mdi-shield-account",
          color: "error",
        },
        buyMeCoffee: {
          name: browser.i18n.getMessage("Support_this_extension"),
          sub_name: browser.i18n.getMessage(
            "Feed_a_coffee_to_the_extension_devs"
          ),
          url: "https://buymeacoffee.com/ttop324",
          icon: "mdi-coffee-to-go",
          color: "brown",
        },
      },
    };
  },
  methods: {
    openUrl(url, isPanelOpen = false) {
      if (!isPanelOpen) {
        window.open(url);
      } else {
        this.openUrlAsPanel(url);
      }
    },
    getReviewUrl() {
      const extId = browser.runtime.id;
      if (extId in reviewUrlJson) {
        return reviewUrlJson[extId];
      }
      if (this.isFirefox()) {
        return reviewUrlJson["firefox"];
      }
      return reviewUrlJson["default"];
    },
    isFirefox() {
      return typeof InstallTrigger !== "undefined";
    },
    async openUrlAsPanel(url) {
      var url = browser.runtime.getURL(url);
      await this.removePreviousTab(url);
      this.openPanel(url);
    },
    async removePreviousTab(url) {
      var urlParsed = new URL(url);
      var urlWithoutParam = urlParsed.origin + urlParsed.pathname;
      var tabs = await browser.tabs.query({ url: urlWithoutParam });

      for (const tab of tabs) {
        if (url == tab.url) {
          await browser.tabs.remove(tab.id);
        }
      }
    },
    openPanel(url) {
      var width = Math.round(screen.width * 0.5);
      var height = Math.round(screen.height * 0.15);
      var left = Math.round(screen.width / 2 - width / 2);
      var top = Math.round(screen.height / 2 - height / 2);
      browser.windows.create({
        url,
        type: "panel",
        width,
        height,
        left,
        top,
      });
    },
  },
};
</script>
<style></style>
