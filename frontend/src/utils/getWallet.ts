import { getProvider } from "./getProvider";

// 지갑연결해서 해당 리턴값 반환

export const getWallet = async () => {
  const provider = getProvider();

  // provider가 undefined면 팬텀지갑 공식홈페이지로 이동
  if (provider) {
    console.log(provider);
    const response = await provider.connect();
    console.log(response);
    try {
      const data = await (
        await fetch(
          `${
            process.env.REACT_APP_BASE_URL
          }/auth/connect/${response.publicKey.toString()}`,
          {
            method: "GET",
          }
        )
      ).json();
      console.log("get", data);
      return data;
    } catch (error) {
      const data = await (
        await fetch(
          `${
            process.env.REACT_APP_BASE_URL
          }/auth/connect/${response.publicKey.toString()}`,
          {
            method: "POST",
          }
        )
      ).json();
      console.log("post", data);
      return data;
    }
  }
};
