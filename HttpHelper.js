import Config from "../Config.js"
import Utils from "../Utils.js"
import SecurityConfig from './SecurityConfig.js'
import CommonParamHelper from "./CommonParamHelper.js"
import XXTEA from './xxtea2.js';
import Logger from "../Logger.js"
import HttpErrorHelper from "./HttpErrorHelper.js"

/**
 * 网络请求工具类。返回seqId，防止重复请求
 */
export default class HttpHelper {
  static _randXXKey = null;

  /**外部调用接口 */
  static sendRequest(request, callback) {
    let relativeUrl = request.getURL() || "";
    let param = request.getParam && request.getParam() || {};
    let method = request.method && request.method() || 'POST';
    let dataType = 'json';
    let sign = request.getSign && request.getSign();
    let timeout = request.getTimeOut() || 30000;
    const number = 16;
    let randNumerStr = this.randomString(number);
    //Logger.log('randNumerStr ='+ randNumerStr);
    let url = '';
    let data = '';

    //loading
    if (request.isShowLoading()) {
      let loadingContent = request.getLoadingContent();
      getApp().showLoading(loadingContent);
    }

    let pp = Promise.all([this.jointUrl(relativeUrl, randNumerStr), this.jointData(request, param, randNumerStr, sign)]);
    pp.then(vals => {
      url = vals[0];
      // Logger.log(url)
      data = vals[1];

      //取消操作
      if (request.isCancel()) {
        Logger.log(request.getRequestName() + 'is    cancel  before');
        if (request.getShowLoading()) {
          getApp().hideLoading();
        }
        return;
      }

      //发起请求
      this.sendHttpRequest(request, url, method, dataType, data, timeout).then(res => {
        //取消操作
        if (request.isCancel()) {
          Logger.log(request.getRequestName() + 'is   cancel  later');
          if (request.getShowLoading()) {
            getApp().hideLoading();
          }
          return;
        }

        //处理header
        if (request.isHandHeader()) {
          // 处理请求返回的 header
          if (res['headers'] && typeof (request.handleHeader) == 'function') {
            request.handleHeader(res['headers']);
          }
        }

        //请求结果
        Logger.log("request reslut " + request.getRequestName() + ':' + JSON.stringify(res));
        let data = res.data;

        let error = HttpErrorHelper.handleAliPayNetWorkError(res);//{code:XXX, message:XXXXX}
        Logger.log('error :' + JSON.stringify(error));

        //错误toast
        if (request.getShowNetWorKErrorTost() && error.code == 0) { //添加错误提示文案

          if (request.getShowLoading()) {
            getApp().hideLoading();
          }
          my.showToast({
            content: request.getShowNetWorKErrorTost(),
          });
        }
        // 原始的请求头，里面拿 Cookie 的 sessionId 判断
        let originHeader = undefined;
        if (request.needSaveHeader()) {
          originHeader = request.fetchBeforeHeader && request.fetchBeforeHeader();
        }
        // 处理 code 14，清除本地缓存，踢登录态  TODO
        //NetworkHelper.clearLocalStorageWithNotLoginCode(data, originHeader);
        callback(data, error);
      });
    });
  }

  /**REA加密*/
  static onEncrypt(content) {
    return new Promise((resolve, reject) => {
      let publickey = SecurityConfig.getPublickKey();
      my.rsa({
        action: 'encrypt',
        text: content,
        //设置公钥
        key: publickey,
        success: (result) => {
          //Logger.log('encrypt = '+ result.text);
          resolve(result.text);
        },
        fail: (e) => {
          let content = e.errorMessage || e.error;
          reject(content);
        },
      });
    });
  }


  /**拼接业务参数 */
  static fentchParams(params) {
    let output = '';
    for (let key in params) {
      if (output != '') {
        output += '&';
      }
      output += (key + '=' + params[key]);
    }
    return output;
  }

  /***拼接url(RSA) */
  static jointUrl(relativeUrl, randNumerStr) {
    return new Promise((resolve, reject) => {
      this.onEncrypt(randNumerStr).then(encryptString => {
        let url = relativeUrl + '?xck=' + encodeURIComponent(encryptString) + '&ent=3';
        resolve(url);
      });
    });
  }

  /**拼接data (XXTEA) */
  static jointData(request, param, randNumerStr, sign) {
    return new Promise((resolve, reject) => {
      this.getCommparams().then((commparam) => {
        let totoalParams = Object.assign(commparam, param);
        let signStr = null;
        if (Array.isArray(sign)) {
          signStr = this.joinSignStr(sign, totoalParams);
          signStr = signStr.toUpperCase();
        }
        if (signStr && signStr.length) {
          totoalParams['sign'] = signStr;
        }

        //处理需要encode参数
        if (request && request.needEncodeParams && request.needEncodeParams()) {
          let needEncodeParams = request.needEncodeParams();
          if (needEncodeParams.length) {
            needEncodeParams.map(key => {
              if (totoalParams[key]) {
                totoalParams[key] = encodeURIComponent(totoalParams[key]);
              }
            });
          }
        }

        let output = this.fentchParams(totoalParams);//生成业务参数
        // Logger.log('totoalParams 2222 '+ JSON.stringify(output));
        let XXTEAString = XXTEA.xxtea_encrypt(output, randNumerStr);
        let data = XXTEAString;
        resolve(data);
      })
    });
  }

  static joinSignStr(sign, param) {
    //添加sign签名
    //Logger.log(sign);
    if (Array.isArray(sign) && param) {
      let signStr = '';
      let signKey = SecurityConfig.getSignkey();
      sign.map(item => {
        signStr += (param[item] || "");
      });
      signStr += ('@' + signKey);
      let md5Str = md5(signStr);
      return md5Str;
    }
  }

  /** 获取公共参数 */
  static getCommparams() {
    return new Promise((resolve, reject) => {
      CommonParamHelper.getCommparams(commparam => {
        resolve(commparam);
      })
    }
    );
  }

  /**发送网络请求 */
  static sendHttpRequest(request, relativeUrl, method, dataType, param, timeout) {

    return new Promise((resolve, reject) => {
      let key = SecurityConfig.getHeaderkey();

      //relativeUrl = relativeUrl + "&key=" + key + "&s=rsx";

      Logger.log("request url is  " + relativeUrl);

      let headers = {
        //key : key,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      // 保存 header 
      if (request.needSaveHeader()) {
        request.saveBeforeHeader(headers);
      }


      my.httpRequest({
        url: relativeUrl,
        headers: headers,
        method: method,
        data: {
          'in': param,
        },
        dataType: dataType,
        timeout: timeout,
        success: function(res) {
          resolve(res);
        },
        fail: function(res) {
          resolve(res);
        },
      });
    });
  }

  /**生成随机字符串*/
  static randomString(len) {
    　　len = len || 32;
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    　　var $chars = SecurityConfig.getRandomKey();
    　　var maxPos = $chars.length;
    　　var pwd = '';
    　　for (let i = 0; i < len; i++) {
      　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return pwd;
  }

  static testEn(inStr) {
      this._randXXKey =  "qazwsxedcrfvtgby";
      let outString = XXTEA.xxtea_encrypt(inStr, this._randXXKey);
      return outString;
  }
  // 公交2期使用x
  static decryptResponseData(inStr) {

    this._randXXKey =  "qazwsxedcrfvtgby";
    if (!this._randXXKey) {
      console.log("HttpHelper : invalid key !");
      return null;
    }
    // console.log("http inStr :", inStr, this._randXXKey);

    let outString = XXTEA.xxtea_decrypt(inStr, this._randXXKey);
    return outString;
  }

  static getEncryptParams() {
      const number = 16;
      // let randNumerStr = this.randomString(number);
      let randNumerStr =  "qazwsxedcrfvtgby";

      this._randXXKey = randNumerStr;
      // console.log("http :", randNumerStr);
      return new Promise((resolve, reject) => {
          this.onEncrypt(randNumerStr).then(encryptString => {
              let finalStr = "";
              if (encryptString) {
                console.log("aaaa: encryptString:", encryptString);
                finalStr =  encodeURIComponent(encryptString);
              }
              resolve(finalStr);
          });
      });
  }

}