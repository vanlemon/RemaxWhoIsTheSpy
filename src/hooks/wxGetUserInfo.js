// 使用promise封装request
const api = {
  requestApi(num) {
    console.log(num);
    return new Promise(function (resolve, reject) {
        wx.getSetting({
            success: res => {   
                wx.hideLoading();
                console.log("WxGetUserInfo| res of getSetting: ",res);
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: res => {
                            
                            resolve(res);  // 将res信息作为正常回调         
                        }
                    })
                }else{
                    wx.hideLoading();
                }
            },
            fail: res=>{
                reject(res) //失败之后reject方法
                wx.hideLoading()
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        });
    })
  }
}

//导出我们封装好的方法
module.exports = {
  api: api
}