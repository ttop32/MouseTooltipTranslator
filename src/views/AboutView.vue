<template>
  <popupWindow>
    <!-- about page ====================================== -->
    <div>
      <!-- about page img====================================== -->
      <v-img
        height="200"
        src="/floating-maple-leaf.jpg"
        cover
        class="text-white"
      >
        <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
          <template v-slot:prepend>
            <!-- <v-btn icon="$menu"></v-btn> -->
            <v-btn dark icon class="mr-4" @click="openMain">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </template>
        </v-toolbar>
        <!-- <v-card-title>Top 10 Australian beaches</v-card-title> -->
        <v-spacer></v-spacer>
        <v-card-title class="white--text">
          <div class="text-h4 pl-12 pt-12">
            Mouse Tooltip<br />
            Translator
          </div>
        </v-card-title>
      </v-img>

      <!-- about page contents list====================================== -->
      <v-list>
        <v-list-item
          v-for="(aboutPageItem, key) in aboutPageList"
          :key="key"
          @click="openUrl(aboutPageItem.url)"
          :title="aboutPageItem.name"
          :subtitle="aboutPageItem.sub_name"
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
import * as util from "/src/util";

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
        twitter: {
          name: browser.i18n.getMessage("Twitter"),
          sub_name: browser.i18n.getMessage("Retweet_twitter_post"),
          url: "https://twitter.com/MouseTooltip",
          icon: "mdi-twitter",
          color: "cyan",
        },
        reviewPage: {
          name: browser.i18n.getMessage("Review_Page"),
          sub_name: browser.i18n.getMessage("Comment_on_this_extension"),
          url: util.getReviewUrl(),
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
      },
    };
  },
  methods: {
    openUrl(newURL) {
      window.open(newURL);
    },
    openMain() {
      this.$router.go(-1);
    },
  },
};
</script>
<style></style>
