import Cookies from "js-cookie";
// cookie保存的天数
import config from "@/config";
import store from "@/store";
import { forEach, hasOneOf } from "@/libs/tools";

export const TOKEN_KEY = "token";
let hostname = window.location.hostname + "";
export const DOMAIN = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/.test(hostname)
  ? hostname
  : hostname.slice(hostname.indexOf("."));

export const setToken = token => {
  if (!token) {
    Cookies.remove(TOKEN_KEY, { domain: DOMAIN });
    return false;
  }
  Cookies.set(TOKEN_KEY, token, {
    expires: config.cookieExpires || 1,
    domain: DOMAIN
  });
};

export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY, { domain: DOMAIN });
  if (token) return token;
  else return false;
};
export const hasChild = item => {
  return item.children && item.children.length !== 0;
};

const showThisMenuEle = (item, access) => {
  if (item.meta && item.meta.access && item.meta.access.length) {
    if (hasOneOf(item.meta.access, access)) return true;
    else return false;
  } else if (item.meta.code) {
    return store.getters["hasMenuPermission"](item.meta.code);
  } else return true;
};
/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @returns {Array}
 */
export const getMenuByRouter = (list, access) => {
  let res = [];
  forEach(list, item => {
    if (!item.meta || (item.meta && !item.meta.hideInMenu)) {
      let obj = {
        icon: (item.meta && item.meta.icon) || "",
        name: item.name,
        path: item.path,
        meta: item.meta
      };
      if (
        (hasChild(item) || (item.meta && item.meta.showAlways)) &&
        showThisMenuEle(item, access)
      ) {
        obj.children = getMenuByRouter(item.children, access);
      }
      if (item.meta && item.meta.href) obj.href = item.meta.href;
      if (showThisMenuEle(item, access)) res.push(obj);
    }
  });
  return res;
};

/**
 * @param {Array} routeMetched 当前路由metched
 * @returns {Array}
 */
export const getBreadCrumbList = routeMetched => {
  let res = routeMetched
    .filter(item => {
      return item.meta === undefined || !item.meta.hide;
    })
    .map(item => {
      let obj = {
        icon: (item.meta && item.meta.icon) || "",
        name: item.name,
        meta: item.meta
      };
      return obj;
    });
  res = res.filter(item => {
    return !item.meta.hideInMenu;
  });
  return [
    {
      name: "home",
      to: "/home"
    },
    ...res
  ];
};

export const showTitle = (item, vm) =>
  vm.$config.useI18n
    ? vm.$t(item.name)
    : (item.meta && item.meta.tagTitle) ||
      (item.meta && item.meta.title) ||
      item.name;

/**
 * @description 本地存储和获取标签导航列表
 */
export const setTagNavListInLocalstorage = list => {
  localStorage.sale_tagNaveList = JSON.stringify(list);
};
/**
 * @returns {Array} 其中的每个元素只包含路由原信息中的name, path, meta三项
 */
export const getTagNavListFromLocalstorage = () => {
  const list = localStorage.sale_tagNaveList;
  return list ? JSON.parse(list) : [];
};

/**
 * @param {Array} routers 路由列表数组
 * @description 用于找到路由列表中name为home的对象
 */
export const getHomeRoute = routers => {
  let i = -1;
  let len = routers.length;
  let homeRoute = {};
  while (++i < len) {
    let item = routers[i];
    if (item.children && item.children.length) {
      let res = getHomeRoute(item.children);
      if (res.name) return res;
    } else {
      if (item.name === "home") homeRoute = item;
    }
  }
  return homeRoute;
};

/**
 * @param {*} list 现有标签导航列表
 * @param {*} newRoute 新添加的路由原信息对象
 * @description 如果该newRoute已经存在则不再添加
 */
export const getNewTagList = (list, newRoute) => {
  const { name, path, meta } = newRoute;
  if (!list) return;
  let newList = [...list];
  let index = newList.findIndex(item => item.name === name);
  if (index >= 0) {
    newList[index].path = path;
    return newList;
  } else newList.push({ name, path, meta });
  return newList;
};

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
  if (route.meta && route.meta.access)
    return hasOneOf(access, route.meta.access);
  else return true;
};

/**
 * 权鉴
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
  const routePermissionJudge = list => {
    return list.some(item => {
      if (item.children && item.children.length) {
        return routePermissionJudge(item.children);
      } else if (item.name === name) {
        return hasAccess(access, item);
      }
    });
  };

  return routePermissionJudge(routes);
};

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
  const keyValueArr = url.split("?")[1].split("&");
  let paramObj = {};
  keyValueArr.forEach(item => {
    const keyValue = item.split("=");
    paramObj[keyValue[0]] = keyValue[1];
  });
  return paramObj;
};

/**
 * @param {Array} list 标签列表
 * @param {String} name 当前关闭的标签的name
 */
export const getNextName = (list, name) => {
  let res = "";
  if (list.length === 2) {
    res = "home";
  } else {
    if (list.findIndex(item => item.name === name) === list.length - 1)
      res = list[list.length - 2].name;
    else res = list[list.findIndex(item => item.name === name) + 1].name;
  }
  return res;
};
export const getNextPath = (list, name) => {
  let res = "";
  if (list.length === 2) {
    res = "/home";
  } else {
    if (list.findIndex(item => item.name === name) === list.length - 1)
      res = list[list.length - 2].path;
    else res = list[list.findIndex(item => item.name === name) + 1].path;
  }
  return res;
};
/**
 * @param {Number} times 回调函数需要执行的次数
 * @param {Function} callback 回调函数
 */
export const doCustomTimes = (times, callback) => {
  let i = -1;
  while (++i < times) {
    callback();
  }
};

/**
 * @param {Object} file 从上传组件得到的文件对象
 * @returns {Promise} resolve参数是解析后的二维数组
 * @description 从Csv文件中解析出表格，解析成二维数组
 */
export const getArrayFromFile = file => {
  let nameSplit = file.name.split(".");
  let format = nameSplit[nameSplit.length - 1];
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsText(file); // 以文本格式读取
    let arr = [];
    reader.onload = function(evt) {
      let data = evt.target.result; // 读到的数据
      let pasteData = data.trim();
      arr = pasteData
        .split(/[\n\u0085\u2028\u2029]|\r\n?/g)
        .map(row => {
          return row.split("\t");
        })
        .map(item => {
          return item[0].split(",");
        });
      if (format === "csv") resolve(arr);
      else reject(new Error("[Format Error]:你上传的不是Csv文件"));
    };
  });
};

/**
 * @param {Array} array 表格数据二维数组
 * @returns {Object} { columns, tableData }
 * @description 从二维数组中获取表头和表格数据，将第一行作为表头，用于在iView的表格中展示数据
 */
export const getTableDataFromArray = array => {
  let columns = [];
  let tableData = [];
  if (array.length > 1) {
    let titles = array.shift();
    columns = titles.map(item => {
      return {
        title: item,
        key: item
      };
    });
    tableData = array.map(item => {
      let res = {};
      item.forEach((col, i) => {
        res[titles[i]] = col;
      });
      return res;
    });
  }
  return {
    columns,
    tableData
  };
};

export const findNodeUpper = (ele, tag) => {
  if (ele.parentNode) {
    if (ele.parentNode.tagName === tag.toUpperCase()) {
      return ele.parentNode;
    } else {
      return findNodeUpper(ele.parentNode, tag);
    }
  }
};

export const findNodeDownward = (ele, tag) => {
  const tagName = tag.toUpperCase();
  if (ele.childNodes.length) {
    let i = -1;
    let len = ele.childNodes.length;
    while (++i < len) {
      let child = ele.childNodes[i];
      if (child.tagName === tagName) return child;
      else return findNodeDownward(child, tag);
    }
  }
};

export const showByAccess = (access, canViewAccess) => {
  return hasOneOf(canViewAccess, access);
};

// 防抖
export function debounce(func, wait, params) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait, params);
  };
}
// 清除搜索无效参数
export function clearInvaildData(data) {
  if (typeof data === "object") {
    Object.keys(data).forEach(key => {
      if (data[key] === "" || data[key] == null) {
        data[key] = undefined;
      } else if (typeof data[key] === "string") {
        data[key] = data[key].trim();
      }
    });
  } else {
    console.log("传的不是对象，别乱传啊");
  }
}

/**
 * @description json 转 form data
 */
export const jsonToFormData = (obj, form = new FormData(), namespace = "") => {
  let fd = form;
  let formKey;
  // 数组
  if (Array.isArray(obj)) {
    obj.map((item, index) => {
      if (typeof item === "object" && !(item instanceof File)) {
        jsonToFormData(item, fd, namespace + "[" + index + "]");
      } else {
        // 若是数组则在关键字后面加上[]
        // console.log(item, index)
        fd.append(namespace + "[" + index + "]", item);
      }
    });
  } else {
    for (var property in obj) {
      if (
        // eslint-disable-next-line no-prototype-builtins
        obj.hasOwnProperty(property) &&
        obj[property] !== null &&
        obj[property] !== "" &&
        obj[property] !== undefined
      ) {
        if (namespace) {
          // 若是对象，则这样
          // formKey = namespace + '[' + property + ']';
          formKey = namespace + "." + property;
        } else {
          formKey = property;
        }
        if (
          typeof obj[property] === "object" &&
          !(obj[property] instanceof File)
        ) {
          // 此处将formKey递归下去很重要，因为数据结构会出现嵌套的情况
          jsonToFormData(obj[property], fd, formKey);
        } else {
          fd.append(formKey, obj[property]);
        }
      }
    }
  }
  return fd;
};

/**
 ** 加法函数，用来得到精确的加法结果
 ** 0.1 + 0.2 = 0.30000000000000004
 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 ** 调用：accAdd(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
export const accAdd = (arg1, arg2) => {
  var r1, r2, m, c;
  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    var cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", "")) * cm;
    } else {
      arg1 = Number(arg1.toString().replace(".", "")) * cm;
      arg2 = Number(arg2.toString().replace(".", ""));
    }
  } else {
    arg1 = Number(arg1.toString().replace(".", ""));
    arg2 = Number(arg2.toString().replace(".", ""));
  }
  return (arg1 + arg2) / m;
};

//给Number类型增加一个add方法，调用起来更加方便。
// Number.prototype.add = function (arg) {
//   return accAdd(arg, this);
// };

/**
 ** 减法函数，用来得到精确的减法结果
 ** 1.5 - 1.2 = 0.30000000000000004
 ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
 ** 调用：accSub(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
export const accSub = (arg1, arg2) => {
  var r1, r2, m, n;
  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
  n = r1 >= r2 ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
};

// 给Number类型增加一个mul方法，调用起来更加方便。
// Number.prototype.sub = function (arg) {
//   return accMul(arg, this);
// };

/**
 ** 乘法函数，用来得到精确的乘法结果
 ** 19.9 * 100 = 1989.9999999999998
 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 ** 调用：accMul(arg1,arg2)
 ** 返回值：arg1乘以 arg2的精确结果
 **/
export const accMul = (arg1, arg2) => {
  var m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length;
  } catch (e) {
    console.log(e);
  }
  try {
    m += s2.split(".")[1].length;
  } catch (e) {
    console.log(e);
  }
  return (
    (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
    Math.pow(10, m)
  );
};

// 给Number类型增加一个mul方法，调用起来更加方便。
// Number.prototype.mul = function (arg) {
//   return accMul(arg, this);
// };

/**
 ** 除法函数，用来得到精确的除法结果
 ** 0.3 / 0.1 = 2.9999999999999996
 ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
 ** 调用：accDiv(arg1,arg2)
 ** 返回值：arg1除以arg2的精确结果
 **/
export const accDiv = (arg1, arg2) => {
  var t1 = 0,
    t2 = 0,
    r1,
    r2;
  try {
    t1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    console.log(e);
  }
  try {
    t2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    console.log(e);
  }
  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return (r1 / r2) * Math.pow(10, t2 - t1);
};

//给Number类型增加一个div方法，调用起来更加方便。
// Number.prototype.div = function (arg) {
//   return accDiv(this, arg);
// };
