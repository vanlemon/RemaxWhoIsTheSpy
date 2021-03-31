import React, { useState } from "react";
import { View, Label, Image, Text } from "remax/wechat";
import { TodoContext } from '@/app'
import {Button, Popup,Tag} from 'anna-remax-ui';
import logo from '@/assets/logo.jpg';

export default () => {
    const todo = React.useContext(TodoContext);
    var roomInfo = todo.roomInformation.roomInfo; // 用户信息需要实时更新的
    var tmp_images = roomInfo.player_list; // 得到用户nickName, avatar信息等
    const myPicImage = tmp_images.map((date) => { // 循环找到该用户对应的word信息
        if (date.open_id == todo.globalData.id || date.nick_name == todo.globalData.userInfo.nickName){
        // if (date.open_id == "000003"){
          return (
          <View key={date.open_id}>
            <View>{date.word}</View>
          </View>    
          );
      }
    }); 
    return(
        <View className="card rule-card">
            <View className="white-text">你的词:</View>
            <View className="special-bottom">
              {myPicImage}
            </View>
        </View>
    ); 
};
