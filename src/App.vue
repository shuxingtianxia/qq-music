<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
import "./assets/reset.min.css";
import "./assets/basic.less";
// import "swiper/css/swiper.css";
export default {};
</script>

<style lang="less" scoped>
.video-enter-active {
  transition: 0.5s;
}
.video-enter {
  transform: translate(-100%);
}
.video-enter-to {
  transform: translateX(0);
}
.video-leave-active {
  transition: 0.5s;
}
.video-leave {
  opacity: 1;
}
.video-leave-to {
  opacity: 0;
}
.song-enter-active {
  transition: 0.5s;
}
.song-enter {
  opacity: 0;
}
.song-enter-to {
  opacity: 1;
}
.song-leave-active {
  transition: 0.5s;
}
.song-leave {
  transform: translateX(0);
}
.song-leave-to {
  transform: translateX(-100%);
}
</style>
