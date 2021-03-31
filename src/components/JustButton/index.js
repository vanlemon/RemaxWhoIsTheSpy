import * as React from 'react';
import { Button, Text } from 'remax/wechat';
import './index.css';

const JustButton = ({ onClick, text }) => {
  return (
    <Button className="add1-button" hoverClassName="none" onClick={onClick}>
      <Text className="add1-icon"></Text>
      <Text>{text}</Text>
    </Button>
  );
};

export default JustButton;


