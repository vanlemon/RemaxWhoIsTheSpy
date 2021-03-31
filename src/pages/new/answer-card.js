import React, { useState } from "react";
import { View, Label, Image, Text } from "remax/wechat";
import { TodoContext } from '@/app'
import {Button, Popup,Tag, Icon} from 'anna-remax-ui';
import WxPostRequest from '../../hooks/wxPostRequest'


// var default_user_Info = {open_id:"#1",nick_name:"",avatar_url:none,state:"",word:"",role:"",number:null};
const userProductInfo = [
  {
    title: "答案：",  // + 房间ID 
    specialBottom: {
      imageSrc: "/images/all.png",
      description: "等待玩家重新开始游戏",
    },
  },
];


function MyCardAndPic(props) {
  const todo = React.useContext(TodoContext);
  var roomInfo = todo.roomInformation.roomInfo; 
  const flexWidthClass = "flex-width-1";
  var my_word = "";
  console.log(33333,"playing list:  ",roomInfo.player_list ,"todo: ", todo.globalData.userInfo.nickName)
  for(var i = 0;i<roomInfo.player_list.length;i++){  //循环LIST，实现浅拷贝
    var veh = roomInfo.player_list[i];
    if(veh.nick_name==todo.globalData.userInfo.nickName){
      my_word = veh.word;
      console.log("!!!找到了");
      break;
    }  
  }
 
  return ( 
    <View className={flexWidthClass}>

      <View>我的词：<Text className="white-text"> 【{my_word}】</Text></View>  
      <View>卧底词： <Text className="white-text">【{roomInfo.word["SpyWord"]}】</Text> </View> 
      <View>寻常词： <Text className="white-text">【{roomInfo.word["NormalWord"]}】</Text></View> 
      <View>空白词： <Text className="white-text">【空白】</Text></View> 
    </View>
    
  );
}

export default () => {
  
  return <View className="card rule-card">
        <View className="white-text">答案:</View>
          <MyCardAndPic/>
        </View>;
};
