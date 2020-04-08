import axios from "@/axios/api.request";

console.log(axios);
// 获取账户列表下拉框
export const getAccountList = reqBody => {
  return axios.request({
    url: "/sale/saleaccount",
    data: {
      args: JSON.stringify(reqBody),
      method: "accountNumberList"
    },
    method: "post"
  });
};
