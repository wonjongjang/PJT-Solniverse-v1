/**
 * Services Logics related to Digital Assets(item)
 * Service/Repository 레이어의 함수를 호출해야합니다.
 *
 * @format
 */

const {
  BAD_REQUEST_RESPONSE,
  SUCCESS_RESPONSE,
  NOT_FOUND_RESPONSE,
  CONFLICT_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  BaseResponse,
} = require("../common/base.response");
const UserRepository = require("./user.repository");
const userRepository = new UserRepository();
const { web3 } = require("../../config/web3.connection");
const nacl = require("tweetnacl");
const base58 = require("bs58");
const jwtUtil = require("../common/jwt-util");
const { default: axios } = require("axios");
const platforms = require("../../config/platforms");

/**
 * 재활용 response들
 */
const badRequestResponse = new BaseResponse(BAD_REQUEST_RESPONSE);
const notFoundResponse = new BaseResponse(NOT_FOUND_RESPONSE);
const conflictResponse = new BaseResponse(CONFLICT_RESPONSE);

const message =
  "Sign this message for authenticating with your wallet. Nonce: ";
class AuthService {
  /**
   * Signature 받아 address를 얻어내고 인증을 생성한다.
   * @param {string} nonce
   * @param {string} signature
   * @param {string} walletAddress
   * @returns response
   */
  async verifyAddressBySignature(signature, walletAddress) {
    const user = await userRepository
      .getUserByWalletAddress(walletAddress)
      .then((user) => {
        if (user) return user;
      });
    if (!user) {
      return badRequestResponse;
    }
    const messageBytes = new TextEncoder().encode(message + user.nonce);
    const publicKeyBytes = base58.decode(walletAddress);
    const signatureBytes = base58.decode(signature);

    const result = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );

    if (!result) {
      return badRequestResponse;
    }

    let response = new BaseResponse(SUCCESS_RESPONSE);
    //액세스 토큰 발급
    response.responseBody.accessToken = jwtUtil.sign(user);
    //완료됐으니 nonce 업데이트
    await userRepository.updateNonceByWalletAddress(walletAddress);
    return response;
  }

  /**
   * WalletAddress를 받아 User를 생성한다.
   * @param {string} walletAddress
   * @returns response
   */
  async createUserByWalletAddress(walletAddress) {
    try {
      const publicKey = new web3.PublicKey(walletAddress);
      if (!(await web3.PublicKey.isOnCurve(publicKey))) {
        return badRequestResponse;
      }
    } catch (error) {
      return badRequestResponse;
    }
    return await userRepository
      .createUserByWalletAddress(walletAddress)
      .then((user) => {
        let res = new BaseResponse(SUCCESS_RESPONSE);
        res.responseBody.user = {
          walletAddress: user.wallet_address,
          createdAt: user.createdAt,
        };
        return res;
      })
      .catch((err) => {
        switch (err.code) {
          case 11000:
            return conflictResponse;
          default:
            return badRequestResponse;
        }
      });
  }

  /**
   * WalletAddress와 refreshToken을 받아 Access token 반환.
   * @param {string} walletAddress
   * @param {string} refreshToken
   * @returns
   */
  async refreshAccessToken(walletAddress, refreshToken) {
    let res;
    if (await jwtUtil.refreshVerify(refreshToken, walletAddress)) {
      //user 가져오기.
      const user = await userRepository.getUserByWalletAddress(walletAddress);
      res = new BaseResponse(SUCCESS_RESPONSE);
      //user로 access token 발행
      res.responseBody.accessToken = jwtUtil.sign(user);
      return res;
    }
    res = new BaseResponse(UNAUTHORIZED_RESPONSE);
    res.responseBody.message = "jwt expired";
    return res;
  }

  /**
   * WalletAddress를 받아 user를 반환한다.
   * @param {string} walletAddress
   * @returns response
   */
  async getUserByWalletAddress(walletAddress) {
    return await userRepository
      .getUserByWalletAddress(walletAddress)
      .then((user) => {
        if (!user) return notFoundResponse;
        let res = new BaseResponse(SUCCESS_RESPONSE);
        res.responseBody.user = {
          wallet_address: user.wallet_address,
          createdAt: user.createdAt,
        };
        /**
         * @TODO 플랫폼 list collection으로 기능 추가 필요.
         * subdocument로 변경시 다시 또 변경 필요.
         */
        for (let platform of platforms) {
          if (user[platform]) {
            res.responseBody.user[platform] = {
              id: user[platform].id,
              displayName: user[platform].display_name,
              profileImageUrl: user[platform].profile_image_url,
            };
          }
        }
        return res;
      })
      .catch(() => {
        return badRequestResponse;
      });
  }

  /**
   * WalletAddress를 받아 nonce를 반환한다.
   * @param {string} walletAddress
   * @returns response
   */
  async getSignMessageByWalletAddress(walletAddress) {
    return await userRepository
      .getUserByWalletAddress(walletAddress)
      .then((user) => {
        if (!user) return notFoundResponse;
        let res = new BaseResponse(SUCCESS_RESPONSE);
        res.responseBody.signMessage = message + user.nonce;
        return res;
      })
      .catch(() => {
        return badRequestResponse;
      });
  }

  /**
   * WalletAddress와 code를 받아 access token을 발급받는다
   * access token을 통해 twitch api를 호출하여 프로필 정보를 받아온다
   * 이 모든 내용을 db에 저장한다
   * @param {string} walletAddress
   * @param {string} code
   * @returns response
   */
  async insertUserInfo(walletAddress, code) {
    /**
     * AuthCode를 받아 Twitch에서 Access Token을 발급받습니다.
     *
     * @param {string} authCode
     * @returns AxiosPromise
     */
    const getAccessTokenByAuthCode = (authCode) => {
      return axios({
        url: "https://id.twitch.tv/oauth2/token",
        method: "post",
        data:
          `client_id=${process.env.TWITCH_CLIENT_ID}` +
          `&client_secret=${process.env.TWITCH_CLIENT_SECRET}` +
          "&code=" +
          authCode +
          "&grant_type=authorization_code" +
          `&redirect_uri=${process.env.SERVER_URL}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    };

    /**
     * AccessToken를 받아 Twitch에서 해당 코드의 User정보를 받아온다.
     *
     * @param {string} accessToken
     * @returns AxiosPromise
     */
    const getTwitchUserByAccessToken = (accessToken) => {
      return axios({
        url: "https://api.twitch.tv/helix/users",
        method: "get",
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    };

    const twitchInfo = {
      id: "",
      display_name: "",
      profile_image_url: "",
      oauth: {
        access_token: "",
        refresh_token: "",
      },
    };

    // 토큰 받아와서 트위치 프로필 정보까지 받아오기
    return await getAccessTokenByAuthCode(code)
      .then((res) => {
        twitchInfo.oauth.access_token = res.data.access_token;
        twitchInfo.oauth.refresh_token = res.data.refresh_token;

        // Access Token으로 Twitch 유저 정보 가져오기
        return getTwitchUserByAccessToken(twitchInfo.oauth.access_token)
          .then((res) => {
            twitchInfo.id = res.data.data[0].login;
            twitchInfo.display_name = res.data.data[0].display_name;
            twitchInfo.profile_image_url = res.data.data[0].profile_image_url;

            //유저에 가져온 정보 삽입
            return userRepository
              .updateTwitchInfoByWalletAddress(walletAddress, twitchInfo)
              .then(() => {
                // 우리 백엔드 유저 정보 반환
                return this.getUserByWalletAddress(walletAddress);
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        //log를 보고 싶거나 기록하고 싶으면 여기만 기록하면 됨.
        return badRequestResponse;
      });
  }
}

module.exports = AuthService;
