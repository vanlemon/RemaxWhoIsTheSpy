var md5 = require('../md5.js');
var salt = "something";
const server = "https://coding8zz.com";                
const WxLoginUrl = server + "/user/wx_login";
const UpdateUserInfoUrl = server + "/user/update_userInfo";
export default function WxPostRequest(url, header, data ,successFunc, requestFailFunc, responseFailFunc,refresh) {

    if(!refresh){console.log("***",url,":***");}
    let reqDataJsonString = JSON.stringify(data);
    let temp_data = {
        "data": reqDataJsonString,
        "sign": md5.hexMD5(salt + reqDataJsonString + salt), 
    }
    console.log(url,"请求的数据：",temp_data," is request data in hook/wxPostRequest");
    wx.request({
        url: url,
        header: header,
        // data: data,
        data: temp_data,
        method: 'POST',
        success: function (res) {
            //if(!refresh){
                console.log(url,"请求返回的值: ",res);
            //}
            if (res.data.Success) {
                console.log(url + ": success");
                if (successFunc) {
                    successFunc(res.data)
                }
            } else {
                console.log(url + ": response fail, msg: " + res.data.Message);
                if (responseFailFunc) {
                    responseFailFunc(res.data.Message)
                }
            }
        },
        fail: function () {
            console.log("失败的请求的数据：",temp_data," is request data in hook/wxPostRequest");
            console.log(url + ": request fail in hook/wxPostRequest");
            if (requestFailFunc) {
                requestFailFunc()
            }
        }
    })
    // return WxPostRequest;
}
