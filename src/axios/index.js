const domain = {
  // TODO
  local: "http://192.168.8.88:8099",
  dev: "http://192.168.3.150:8880",
  test: "http://192.168.3.165:8881",
  test_k8s: "http://172.16.10.41:30000",
  prod: "http://10.100.1.1",
  domain_prod: "http://center.estonerp.com:81"
};
export default {
  /**
   * @description token在Cookie中存储的天数，默认1天
   */
  cookieExpires: 1,
  /**
   * @description 是否使用国际化，默认为false
   *              如果不使用，则需要在路由中给需要在菜单中展示的路由设置meta: {title: 'xxx'}
   *              用来在菜单中显示文字
   */
  useI18n: false,
  wishService: "publish",
  otherPublishService: "sale-publish-no", // shopee amazon joom 清仓sku
  ebayService: "sale-publish-ebay",
  joomService: "sale-publish-joom",
  shopeeService: "sale-publish-shopee",
  smtService: "sale-publish-smt",
  lazadaService: "sale-publish-lazada",
  domain,
  //   env: Object.keys(domain).find(key => domain[key].includes(window.location.hostname)) || 'local'
  env: (function() {
    let hostname = window.location.hostname;
    if (/^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/.test(hostname)) {
      return (
        Object.keys(domain).find(key =>
          domain[key].includes(window.location.hostname)
        ) || "local"
      );
    } else if (hostname.indexOf("estonerp") !== -1) {
      return "domain_prod";
    } else if (hostname.indexOf("localhost" !== -1)) {
      return "local";
    }
  })()
};
