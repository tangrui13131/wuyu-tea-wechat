import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
// 全局样式
import './app.scss';
import { login } from './utils/user';

/**
 * 屏蔽「预期内的网络失败」红字。
 *
 * 本项目没启动后端时是刻意可用的（接口失败自动降级到 src/data 的离线数据），
 * 但 Taro 的 request / login 在小程序里失败时会以「未处理的 Promise 拒绝」冒到
 * 控制台，显示成一条刺眼的 `Error: timeout`，让人误以为小程序坏了。
 * 这里只把网络类拒绝降级成 console.info，其它异常照旧打红字，不吞真正的 bug。
 */
function installQuietNetworkHandler() {
  if (process.env.TARO_ENV !== 'weapp') return;
  const wxApi: any = typeof wx !== 'undefined' ? wx : null;
  if (!wxApi || typeof wxApi.onUnhandledRejection !== 'function') return;

  wxApi.onUnhandledRejection((res: any) => {
    const reason = res && res.reason;
    const text = String((reason && (reason.errMsg || reason.message)) || reason || '');
    const isNetworkNoise =
      /timeout|request:fail|login:fail|network|ERR_|Failed to fetch/i.test(text);
    if (isNetworkNoise) {
      console.info('[离线] 请求失败，已使用本地数据：', text);
      return;
    }
    console.error('[UnhandledRejection]', reason);
  });
}

installQuietNetworkHandler();

function App(props) {
  // 启动即静默登录，拿到 token 供后续请求鉴权；失败自动降级为本地身份
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
