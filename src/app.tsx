import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
// 全局样式
import './app.scss';
import { login } from './utils/user';

function App(props) {
  // 启动即静默登录，拿到 token 供后续请求鉴权
  useEffect(() => {
    login().catch(() => {});
  }, []);

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  return props.children;
}

export default App;
