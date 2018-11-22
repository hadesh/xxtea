import Config from "../Config.js"

class SecurityConfig {
    /**RSA 公钥 */
    static getPublickKey(){
      let RSAPulickKey = {
          test: 'xxx',
          public: 'xxx',
          pre: 'xxx',
      };

      return RSAPulickKey[Config.HTTP_ENVIRONMENT];
    }

    /**sign key (公交2期暂未用到)*/
    static getSignkey(){
       return 'OMkgnHJShEVaC5owe9BKFnzoq5PfKVAQ';
    }

    /**随机数 */
    static getRandomKey(){
        return 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    }
 
    /**开放平台鉴权 (公交2期暂未用到)*/
    static getHeaderkey(){
      let Headerkey = {
         test:'xxx',
         public:'xxx',
         pre:'xxx'
      }
      return Headerkey[Config.HTTP_ENVIRONMENT];
    }

};
export  default SecurityConfig;