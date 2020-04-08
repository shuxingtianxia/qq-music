import Axios from "axios";
import baseURL from "_conf/url";
import config from "@/config";
// import Cookies from 'js-cookie'
// import { getToken, setToken } from '@/axios/util'

class httpRequest {
  constructor() {
    this.options = {
      methods: "",
      url: ""
    };
    // 存储请求队列
    this.queue = {};
  }
  // 销毁请求实例
  destroy(url) {
    delete this.queue[url];
    const queue = Object.keys(this.queue);
    return queue.length;
  }
  // 请求拦截
  interceptors(instance, url) {
    // 添加请求拦截器
    instance.interceptors.request.use(
      config => {
        // if (!config.url.includes("/users")) {
        //   config.headers["Authorization"] = getToken();
        // }
        // Spin.show()
        // 在发送请求之前做些什么
        return config;
      },
      error => {
        // 对请求错误做些什么
        return Promise.reject(error);
      }
    );
    // 添加响应拦截器
    instance.interceptors.response.use(
      res => {
        let { data } = res;
        const is = this.destroy(url);
        if (!is) {
          setTimeout(() => {
            // Spin.hide()
          }, 500);
        }
        if (res.status === 500 || res.status === 404 || res.status === 401) {
          if (
            data.code === 11000 ||
            data.code === "11000" ||
            data.code === "84251" ||
            data.code === 84251
          ) {
            // Cookies.remove("token");
            // setToken("");
            // localStorage.removeItem("sale_store");
            // localStorage.removeItem("sale_tagNaveList");
            // Modal.error({ title: data.message });
            localStorage.clear();
            window.location.href = config.domain[config.env] + "/";
          }
          return Promise.reject(res);
        }
        if (res.status !== 200) {
          return Promise.reject(res);
        }
        return Promise.resolve(res);
      },
      error => {
        console.log("服务内部错误");
        // 对响应错误做点什么
        return Promise.reject(error);
      }
    );
  }
  // 创建实例
  create() {
    let conf = {
      baseURL: baseURL,
      // timeout: 2000,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-URL-PATH": location.pathname
      },
      validateStatus: function(status) {
        // return status >= 200 && status < 300; // default
        return status >= 200;
      }
    };
    return Axios.create(conf);
  }
  // 合并请求实例
  mergeReqest() {
    //
  }
  // 请求实例
  request(options) {
    var instance = this.create();
    this.interceptors(instance, options.url);
    options = Object.assign({}, options);
    this.queue[options.url] = instance;
    return instance(options);
  }
}

export default httpRequest;
