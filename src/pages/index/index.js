import * as React from 'react';
import {
  View,
  Image,
  CheckboxGroup,
  Checkbox,
  Label,
  Input,
  Text,
  navigateTo,
  onLocalServiceResolveFail,
  hideLoading,

} from 'remax/wechat';
import clsx from 'clsx';
import useUserInfo from '../../hooks/useUserInfo';
import AddButton from '@/components/ShineButton';
import LoginButton from '@/components/LoginButton';
import LoginButton2 from '@/components/LoginButton2';
import { TodoContext } from '@/app';
import logo from '@/assets/logo.jpg';
import none from '@/assets/none.png';

import './index.css';
import {Button, Popup,Tag,Stepper,Icon} from 'anna-remax-ui';
// import { Swiper, SwiperSlide } from 'swiper/react';

import { usePageEvent } from 'remax/macro';
import WxPostRequest from '../../hooks/wxPostRequest';

const DefaultPostHeader = {
  "Content-Type": "application/x-www-form-urlencoded"
};
const FilePostHeader = {
    "Content-Type": "multipart/form-data"
};
const JsonPostHeader = {
    "Content-Type": "application/json"
};
const TextPostHeader = {
    "Content-Type": "text/xml"
};
const server = "https://coding8zz.com";    // http://something/user/wx_login
const WxLoginUrl = server + "/user/wx_login";
const UpdateUserInfoUrl = server + "/user/update_userInfo";
const CreateNewRoomUrl = server + "/room/new_room"; // http://something/user/room/new_room
const EnterRoomUrl = server + "/room/enter_room";
const ExitRoomUrl = server + "/room/exit_room";
const RefreshRoomUrl = server + "/room/refresh_room";
const ReadyGameUrl = server + "/game/ready_game";
const StartGameUrl = server + "/game/start_game";
const EndGameUrl = server + "/game/end_game";
const RestartGameUrl = server + "/game/restart_game";
const wxGetUserInfo = require('../../hooks/wxGetUserInfo');


export default () => {
  const [user, login] = useUserInfo();
  const todo = React.useContext(TodoContext);
  const [count, setCount] = React.useState(0); // 用来控制Popup的出现和消失
  const [room_password_create, setRoomPassword] = React.useState(''); // 玩家设置的密码，用来创建某房间
  const [player_nums, setPlayerNums] = React.useState(3); // roomSetting
  const [spy_num, setspy_num] = React.useState(1);             // roomSetting
  const [blank_num, setblank_num] = React.useState(0);           // roomSetting
  const [room_ID, inputRoomID] = React.useState();     // roomInfo
  const [room_password_user, inputRoomPassword] = React.useState(); // 玩家输入的密码，用来进入某房间
  const globalDatas = todo.globalData;
  const [option,setOption] = React.useState();

  usePageEvent('onShareAppMessage',(res)=>{
    console.log("转发！");
    if (res.from === 'button') { // 说明是通过邀请得到的
      return {
        title: '朋友邀请您玩谁是卧底！',
        path: 'pages/index/index?room_ID='+todo.roomInformation.roomId,
      }
      console.log(res.target)
    }else{ // 正常转发
      return {
        title: '朋友邀请您玩谁是卧底！',
        path: 'pages/index/index'
      }
    } 
  });

  usePageEvent('onHide', (option) => {
    console.log("-----on hide index---");
  });
 
  usePageEvent('onUnload', (option) => {
    console.log("-----on un load index---");
  });

  usePageEvent('onLoad', (res_option) => {
    console.log("============",res_option);
    setOption(res_option);
    console.log(res_option," = option被设置了！");
    
    if(globalDatas && globalDatas.userInfo){
      console.log("一进来就有缓存的用户记录了：",globalDatas.userInfo);
      if(res_option && res_option.room_ID){
        refreshGame_before_enter(res_option.room_ID, globalDatas.id);
      }else{
        console.log("没收邀请");
      }
    }else{

      // 1 首先获取用户UserInfo
      wxGetUserInfo.api.requestApi(1)
        .then(res_userInfo => {
          // 成功回调函数，已获取UserInfo信息(无后端交流)
          var temp_data = {};
          temp_data.userInfo = res_userInfo.userInfo;
          // 2 获取用户ID
          return new Promise((resolve, reject) => {
            wx.login({
              success (res) {
                // wx.hideLoading();
                if (res.code) {
                  //发起网络请求
                  let data = {code:res.code}; // 微信验证码
                  let successFunc = function (resp) {
                    console.log("2 ID: ",resp); // resp包括Data,Message,Success三部分
                    if(resp.Data!= null){
                      temp_data.id = resp.Data;
                      console.log("2 now temp_data: ",temp_data);
                      resolve(temp_data);
                    }
                  };
                  let requestFailFunc = function () {
                    wx.showToast({
                        title: '服务器维护中',
                        icon: 'none'
                    })
                  };
                  let responseFailFunc = function (message) {
                      wx.showToast({
                          title: message,
                          icon: 'none'
                      })
                  };
                  console.log("run onLoad CallBack");
                  WxPostRequest(WxLoginUrl, DefaultPostHeader, data, successFunc, requestFailFunc, responseFailFunc,false);
                }
              },
              fail: res=>{
                reject(res) //失败之后reject方法
              }
            })
          })
        })
        .then(res => {
          console.log("更新用户信息",res);
          todo.setGlobalData(res);
          // 接下来更新用户信息，传入后端
          let data = {
            tempId: res.id,
            userInfo: JSON.stringify(res.userInfo)
          };
          console.log("用户信息: ",data);
          let successFunc = function (resp) {
            // 新加入的这个已经成功传入了
            if(res_option && res_option.room_ID){ // 判断用户是不是被邀请来的，如果是，就直接进入房间
              wx.showToast({
                title: '您想进入房间'+res_option.room_ID,
                icon: 'none'
              });
              console.log(res.id," 正在尝试进入的房间 ",res_option.room_ID);
              inputRoomID(res_option.room_ID);
              let data = {
                id: res.id,
                userInfo: res.userInfo
              }; 
              todo.setGlobalData(data);
              refreshGame_before_enter(res_option.room_ID, res.id); // 涉及到如果房间id失效
            }else{  // 用户不是被邀请进来的
              refreshGame_before_enter(null, res.id); // 涉及到，如果房间id失效
            }
          };
          let requestFailFunc = function () {
            wx.showToast({
                title: '服务器维护中',
                icon: 'none'
            })
          };
          let responseFailFunc = function (message) {
              wx.showToast({
                  title: message,
                  icon: 'none'
              })
          };
          WxPostRequest(UpdateUserInfoUrl, DefaultPostHeader, data, successFunc, requestFailFunc, responseFailFunc,false);
        })
        .catch(res => {
        //失败回调函数
          // wx.hideLoading()
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        })
    }

  });

  
  // 进入房间前先refresh一下 
  function refreshGame_before_enter(res_roomid,res_userid){ 
    let data = {};                                           
    data.tempId = res_userid; // 用户ID
    console.log("refresh请求数据：",data);
    let successFunc = function (resp) {        // 若refresh成功返回数据：判断是否在某房间。
      console.log("refresh返回数据: ",resp);
      if(resp.Data!= null && resp.Data.roomInfo!=null){      // 属于某房间，直接跳转
        var new_data = {
          "roomId":res_roomid,
          "roomInfo":resp.Data.roomInfo
        };
        todo.setRoomInfo(new_data); 
        console.log("找到了属于的房间，正在进入");
        navigateTo({ url: '../new/index'});
      }else{                                                 // 不属于任何房间
        console.log("本身不在房间，需要enter进入");
        if(res_roomid){                                           // 但是有邀请链接，直接进入房间
          enterRoom(res_roomid,res_userid); 
        }else{
          console.log("本人refresh后发现不属于任何房间，且没受邀请"); // 没有邀请链接，无操作
        }
      }
    };
    let requestFailFunc = function () {
      wx.showToast({
        title: '服务器维护中',
        icon: 'none'
      })
    };
    let responseFailFunc = function (message) { // refresh失败，说明肯定不在某房间
      wx.showToast({
        title: '房间ID失效了',
        icon: 'none'
      })
      console.log(message);
      console.log("enter前的refresh失败");
      if(res_roomid){                               // 若被邀请，也直接进入某房间
        console.log("但是被邀请了，refresh false也要尝试进入房间啊");
        enterRoom(res_roomid,res_userid);  
      }      
    };
    WxPostRequest(RefreshRoomUrl, DefaultPostHeader, data, successFunc, requestFailFunc, responseFailFunc,false);
  }


  function min(a, b){
    return a<b?a:b;
  }


  // 判断用户是不是在房间里，refresh如果不返回null，则跳转，否则创建房间
  function refreshGame_before_create(res_userid,res_roomSetting){ 
    let data = {};
    data.tempId = res_userid;
    wx.showLoading({
      title: '更新房间信息中',
    });
    console.log("refresh请求数据：",data);
    let successFunc = function (resp) {              // refresh成功
      console.log("refresh返回数据: ",resp);
      if(resp.Data!= null  && resp.Data.roomInfo!=null){ // 发现可以收到房间的info，直接跳转
        var new_data = {
          "roomId":todo.roomInformation.roomId,
          "roomInfo":resp.Data.roomInfo
        };
        todo.setRoomInfo(new_data); 
        navigateTo({ url: '../new/index'});
      }else{                                            // 收不到房间info,说明用户没在房间里面, 则正常create房间
        console.log("create发现用户没在房间，则调用create");
        createNewRoom(res_roomSetting);
      }
      wx.hideLoading();
    };
    let requestFailFunc = function () {
      wx.showToast({
        title: '服务器维护中',
        icon: 'none'
      })
    };
    let responseFailFunc = function (message) {     // refresh失败，但依然创建房间
      wx.showToast({
        title: '房间ID失效',
        icon: 'none'
      })
      console.log("create前的refresh失败");
      console.log("refresh false也要创建房间啊");
      console.log(message);
      createNewRoom(res_roomSetting);                   // 直接创造房间
    };
    WxPostRequest(RefreshRoomUrl, DefaultPostHeader, data, successFunc, requestFailFunc, responseFailFunc,false);
  }


  // 输入房间设置信息，得到创建的房间ID, 然后再enterRoom进入该房间
  function createNewRoom(roomSetting){
    let data = {};
    data.tempId = globalDatas.id; // 用户ID
    data.roomSetting = JSON.stringify(roomSetting);
    console.log("create room申请数据： ",data);
    // 构建请求，得到roomID, 用roomID进入新房间
    let successFunc = function (resp) {
      console.log("create room返回数据: ",resp);
      // 构建房间返回的数据，更新todo.roomInfo
      if(resp.Data!= null && resp.Data.roomId!=null){
        todo.setRoomInfo(resp.Data); 
        navigateTo({ url: '../new/index' }); 
      }
    };
    let requestFailFunc = function () {
      wx.showToast({
        title: '服务器维护中',
        icon: 'none'
      })
    };
    let responseFailFunc = function (message) {
      wx.showToast({
        title: '房间人数配置错误',
        icon: 'none'
      })
      console.log(message);
      console.log("create 失败了");
    };
    WxPostRequest(CreateNewRoomUrl, DefaultPostHeader, data, successFunc, requestFailFunc, responseFailFunc,false);
  }


  // 向API输入要加入房间的ID，得到房间roomInfo
  function enterRoom(id_of_room,userid){
    let data = {};
    data.tempId = userid; // 用户ID
    data.roomId = id_of_room;
    console.log("enter room 申请数据: ",data);
    let successFunc = function (resp) {
      console.log("enter room返回数据: ",resp);
      if(resp.Data!= null){ // 进入房间成功，并更新房间信息
        resp.Data.roomId = id_of_room;
        todo.setRoomInfo(resp.Data); 
        console.log("这时候跳转界面",resp.Data);
        navigateTo({ url: '../new/index'});
      }else{ // 没有返回数据，就不进入房间
        // navigateTo({ url: '../new/index'}); 
        console.log("enter room没返回数据！！！！");
      }
    };
    let requestFailFunc = function () {
      wx.showToast({
        title: 'enterRoom服务器维护中',
        icon: 'none'
      })
    };
    let responseFailFunc = function (message) {
      wx.showToast({
        title: message,
        icon: 'none'
      })
    };
    WxPostRequest(EnterRoomUrl, DefaultPostHeader, data, successFunc, requestFailFunc, responseFailFunc);
  }


  // 创建房间按钮的响应
  const handleCreate = () => {
    console.log("点击了handle Create!")
    setCount(1);    // 用来控制popup的变量
    var temp_roomSetting = todo.roomSetting;
    console.log(111,"total num is ",player_nums)
    temp_roomSetting.spy_num = spy_num;
    temp_roomSetting.blank_num = blank_num;
    temp_roomSetting.total_num = player_nums;
    refreshGame_before_create(globalDatas.id,temp_roomSetting);
  }


  // 返回房间按钮的响应（检测出在游戏中才出现的Popup）
  const handleIn = () =>{
    wx.showToast({
      title: '您正在游戏中,正在为您返回该房间',
      icon: 'none'
    })
    navigateTo({ url: '../new/index'});  // 直接返回房间
  }

  // 测试输出按钮
  const ajaxTry = () =>{
    var data = {};
    console.log("app globalData: ",globalDatas);
    console.log("room information: ",todo.roomInformation);
  }


  return (
    <View className="top-yellow-background">
      <View className="user">
        {/* <Button type="primary" plain color="black"  onTap={ajaxTry}>ajax</Button> */}
        <LoginButton login={login} >
        {/* <LoginButton> */}
          <Image className="avatar" src={user? user.avatarUrl : logo} />
        </LoginButton>
        <View className="nickname">
          {user ? user.nickName + " here" : <LoginButton2 login={login} >登录</LoginButton2>} 
        </View>
      </View>
            
      <View className="todo-footer">
        {user && globalDatas.userInfo && <AddButton text="创建房间" onClick={() => setCount(2)} />}
        <Popup
            open={todo.onGame}
            curve = "ease"
            onClose={() => {}}> 
          <View 
            style={{
              height: "400rpx",
              width:"600rpx",
              padding: "10rpx 25rpx",
              backgroundColor: "#323239",
            }}>
            <View>
              <Text className="InGame-white-text">检测出您还在房间里 </Text>
            </View>  
            <Text className="InGame-small-white-text">若想退出，请先返回房间，再点击离开按钮</Text>
            <View className="normal_stepper">
              <AddButton text="返回房间" onClick={handleIn} />
            </View>
          </View>
        </Popup>

        <Popup
            open={count==2}
            curve = "ease"
            onClose={() => {setCount(1)}}>         
          <View 
            style={{
              height: "600rpx",
              width:"500rpx",
              padding: "10rpx 25rpx",
              backgroundColor: "#323239",
            }}>
            <View className="title">
              <Text className="InGame-big-text"> 创建房间</Text>
            </View>
            
            <View className="normal_stepper">
              <Text className="InGame-text">房间人数: </Text>
              <Stepper size="big" bgColor="yellow" color="black" value={player_nums} min={3} onChange={val => setPlayerNums(parseInt(val))}/> 
            </View>      
            <View className="normal_stepper">
              <Text className="InGame-small-text">卧底个数: </Text>
              <Stepper  size="small" bgColor="yellow" color="black"  value={spy_num} min={1} max={min(3,player_nums/2)} onChange={val =>setspy_num(parseInt(val))}/>
            </View>
            <View className="normal_stepper">
              <Text className="InGame-small-text">白板个数: </Text>
              <Stepper size="small" bgColor="yellow" color="black"  value={blank_num} min={0} max={1} onChange={val => setblank_num(parseInt(val))}/>
            </View>
            <View className="normal_stepper">
              <Button Plain="primary" size ="large" plain="true" color="black"  onTap={handleCreate}>创建房间！</Button> 
            </View>
          </View>
        </Popup>
      </View>


      <View className="bottom">
        <swiper indicator-dots="true" circular="true" autoplay="true" width="100%" interval="2000" duration="500" current="0">
          <swiper-item>
              <Image mode="scaleToFill" src="https://coding8zz.com/wx_images/popup_1.jpeg" mode="widthFix"></Image>
          </swiper-item>
          <swiper-item>
              <Image mode="scaleToFill" src="https://coding8zz.com/wx_images/popup_2.jpeg" width="100%"></Image>
          </swiper-item>
          <swiper-item>
              <Image mode="scaleToFill" src="https://coding8zz.com/wx_images/popup_3.jpeg" width="100%"></Image>
          </swiper-item>
        </swiper>      
      </View>
    </View>
    
  );
};
