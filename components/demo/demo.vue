
<template>
  <div>
    <nav-bar name="居左首页" bg-color="bg-gradual-blue"></nav-bar>

    <nav-bar bg-color="bg-blue margin-top" freebar>
      <div slot="freebar">
        <div class="content text-bold" :style="conTop">居中首页</div>
      </div>
    </nav-bar>

    <nav-bar bg-color="bg-black margin-top" freebar>
      <div slot="freebar">
        <div class="action" @tap="close">
          <text class="cuIcon-close"></text>关闭
        </div>
        <div class="content" :style="conTop">带按钮的首页</div>
      </div>
    </nav-bar>

    <nav-bar bg-color="bg-cyan margin-top search" freebar>
      <div slot="freebar">
        <div class="search-form radius">
          <text class="cuIcon-search"></text>
          <input type="text" placeholder="带搜索框的顶部操作栏" confirm-type="search">
        </div>
      </div>
    </nav-bar>

    <nav-bar
      name="图片背景首页"
      bg-color="margin-top text-black text-blod"
      bg-img="https://static.veer.com/veer/static/resources/keyword/2018-05-30/a207217f05aa426f821547508320178b.jpg"
      noneBg
    ></nav-bar>

    <nav-bar
      bg-color="margin-top"
      bg-img="https://goss1.veer.com/creative/vcg/veer/612/veer-148024919.jpg"
      noneBg
      freebar
    >
      <div slot="freebar">
        <div class="content" :style="conTop">图片背景首页</div>
      </div>
    </nav-bar>

    <nav-bar name="顶部操作栏" bg-color="bg-gradual-blue margin-top"></nav-bar>

    <nav-bar bg-color="bg-gradual-red margin-tb" leftMore>
      <text slot="leftMore">
        <text class="cuIcon-homefill"></text>
      </text>
      <div slot="moreCon">
        <div class="content" :style="conTop">顶部操作栏</div>
      </div>
    </nav-bar>

    <nav-bar name="顶部操作栏" bg-color="bg-gradual-purple margin-tb" leftMore>
      <text slot="leftMore">
        <text class="cuIcon-homefill"></text>
      </text>
      <div slot="moreCon">
        <wuc-tab
          :tab-list="tabNav"
          :tabCur.sync="TabCur"
          tab-class="text-center text-white"
          select-class="text-yellow text-xl"
        ></wuc-tab>
      </div>
    </nav-bar>

    <nav-bar bg-color="bg-white margin-top" color="text-cyan">
      <div slot="leftMore">
        <div class="flex-center" style="margin-left:60upx;width:60vw;">
          <div
            class="cu-btn"
            :class="timeType === 1 ? 'text-white bg-cyan' : 'text-grey line-cyan'"
            @tap.stop="orderTime(1)"
          >这是tab0</div>
          <div
            class="cu-btn block"
            :class="timeType === 2 ? 'text-white bg-cyan' : 'text-grey line-cyan'"
            @tap.stop="orderTime(2)"
          >这是tab1</div>
        </div>
      </div>
    </nav-bar>
  </div>
</template>

<script>
import NavBar from "./../nav-bar/nav-bar.vue";
import WucTab from "./../wuc-tab/wuc-tab.vue";
import { obj2style } from "./utils/index.js";
export default {
  data() {
    return {
      TabCur: 0,
      timeType: 2,
      tabNav: [{ name: "tab0" }, { name: "tab1" }, { name: "tab2" }]
    };
  },

  components: { NavBar, WucTab },

  computed: {
    conTop() {
      let style = {};
      // #ifdef MP-WEIXIN
      const systemInfo = uni.getSystemInfoSync();
      style["top"] = systemInfo.statusBarHeight + "px";
      // #endif
      // #ifdef H5
      style["top"] = 20 + "px";
      // #endif
      return obj2style(style);
    }
  },

  methods: {
    tabSelect(index) {
      this.TabCur = index;
    },
    close() {
      uni.showToast({
        title: "点击了关闭",
        mask: true,
        duration: 2000
      });
    },
    orderTime(e) {
      this.timeType = e;
    }
  },

  onReady() {}
};
</script>
<style>
@import "./styles/main.scss";
@import "./styles/base.scss";
@import "./styles/icon.scss";
</style>
