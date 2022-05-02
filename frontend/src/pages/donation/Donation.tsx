import styled from "styled-components";
import Layout from "components/Layout";
import banner from "../../../public/가로긴사진.png";
import { createSearchParams, useNavigate, useParams } from "react-router-dom";
import { MouseEventHandler, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { useRecoilValue } from "recoil";
import { userInfoAtom } from "atoms";

interface IDonation {
  nickname: string;
  amount: number;
  message: string;
}

function Donation() {
  const navigate = useNavigate();
  // const { displayName, platform } = useParams();
  // console.log(displayName, platform);
  const userInfo = useRecoilValue(userInfoAtom);
  const { walletAddress } = useParams();
  console.log(walletAddress);
  const [nickName, setNickName] = useState("");
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const params = {
    amount: amount.toString(),
    nickName,
    message,
    walletAddress: walletAddress!.toString(),
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IDonation>({ mode: "onBlur" });

  const handleAmount = (e: any) => {
    e.preventDefault();
    setAmount(e.target.value);
  };
  const onClick = () => {
    // navigate({
    //   pathname: "/payment",
    //   search: `?amount=${amount}&nickName=${nickName}&message=${message}`,
    // });
    navigate({
      pathname: "/payment",
      search: `?${createSearchParams(params)}`,
    });
    // alert("도네이션을 진행하겠습니다");
  };
  console.log(nickName, amount, message, walletAddress);

  const getSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet")); // devnet 연결
    const publicKey = new PublicKey(userInfo.walletAddress);

    // 지갑 잔액 가져오기
    const lamports = await connection.getBalance(publicKey).catch((err) => {
      console.error(`Error: ${err}`);
    });

    if (lamports) {
      // 잔액이 0이 아닐 때
      const sol = lamports / LAMPORTS_PER_SOL; // 0.000000001 단위로 처리
      console.log(sol);
      return sol;
    } else {
      // 잔액이 0일 때
      return lamports;
    }
  };

  useEffect(() => {
    const getAsyncSol = async () => {
      const sol = await getSol();
      if (sol < amount) {
        alert("현재 잔액보다 높은 금액을 설정하셨습니다. SOL을 충전해주세요.");
        setAmount(0);
      }
    };
    getAsyncSol();
  }, [amount]);
  return (
    <Layout>
      <Container>
        <DonationWrapper>
          <CreatorWrapper>
            <CreatorName>To. 메인메타님</CreatorName>
            <CreatorImage />
            <CreatorContent>❤메인메타 사랑해요❤</CreatorContent>
          </CreatorWrapper>
        </DonationWrapper>
        <DonationForm>
          <DonatorWrapper>
            <DonatorName>후원닉네임</DonatorName>
            <Input
              {...register("nickname", {
                required: "필수 입력정보입니다.",
                pattern: {
                  value: /^[가-힣a-zA-Z0-9]{2,15}$/,
                  message:
                    "2~15자의 한글, 영문 대 소문자, 숫자만 사용 가능합니다.",
                },
                onChange: (e) => {
                  setNickName(e.target.value);
                },
              })}
              placeholder="후원닉네임을 입력해주세요."
            />
          </DonatorWrapper>
          <DonatorWrapper>
            <DonatePrice>후원금액</DonatePrice>
            <Input
              {...register("amount", {
                required: "필수 입력정보입니다.",
                pattern: {
                  value: /^[0-9]*$/,
                  message: "숫자만 입력 가능합니다.",
                },
                onChange: (e) => {
                  setAmount(e.target.value);
                },
              })}
              value={`${amount} SOL`}
              style={{ display: "flex", justifyContent: "space-between" }}
              placeholder="후원금액을 입력해주세요."
            />
          </DonatorWrapper>
          <PriceButtonWrapper>
            <DonatePriceButton value="0.01" onClick={handleAmount}>
              0.01
            </DonatePriceButton>
            <DonatePriceButton value="0.05" onClick={handleAmount}>
              0.05
            </DonatePriceButton>
            <DonatePriceButton value="0.1" onClick={handleAmount}>
              0.1
            </DonatePriceButton>
            <DonatePriceButton value="0.5" onClick={handleAmount}>
              0.5
            </DonatePriceButton>
            <DonatePriceButton value="1" onClick={handleAmount}>
              1
            </DonatePriceButton>
            <DonatePriceButton value="5" onClick={handleAmount}>
              5
            </DonatePriceButton>
            <DonatePriceButton value="10" onClick={handleAmount}>
              10
            </DonatePriceButton>
            <DonatePriceButton
              style={{ marginRight: "0px" }}
              value="20"
              onClick={handleAmount}
            >
              20
            </DonatePriceButton>
          </PriceButtonWrapper>
          <DonatorWrapper>
            <DonateMessage>후원메시지</DonateMessage>
            <MessageTextarea
              {...register("message", {
                required: "필수 입력정보입니다.",
                onChange: (e) => {
                  setMessage(e.target.value);
                },
              })}
              placeholder="후원메시지를 작성해주세요."
            />
          </DonatorWrapper>
        </DonationForm>
        <DonationWrapper>
          <DonatorWrapper>
            <TotalPrice>Total</TotalPrice>
            <TotalUSDC>{amount} SOL</TotalUSDC>
          </DonatorWrapper>
        </DonationWrapper>
        <DonationWrapper>
          <ButtonWrapper>
            <DonateButton onClick={onClick}>Donate</DonateButton>
            {/* <DonateButton onClick={Donate}>Donate</DonateButton> */}
          </ButtonWrapper>
        </DonationWrapper>
      </Container>
    </Layout>
  );
}

const Container = styled.div`
  margin-top: 32px;
`;

const DonationWrapper = styled.div`
  margin-bottom: 32px;
`;

const DonationForm = styled.form`
  margin-bottom: 32px;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
`;

const CreatorWrapper = styled.div``;
const CreatorName = styled.div`
  font-size: 32px;
  font-weight: bold;
`;
const CreatorContent = styled.div`
  font-size: 20px;
`;
const CreatorImage = styled.img.attrs({
  src: `${process.env.PUBLIC_URL}/헤이.png`,
})`
  width: 100%;
  height: auto;
`;

const DonatorWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;
const PriceButtonWrapper = styled.div`
  display: flex;
  justify-content: right;
  margin-bottom: 32px;
`;

const DonatePriceButton = styled.button`
  width: 80px;
  height: 30px;
  color: #ffffff;
  background-color: ${(props) => props.theme.ownColor};
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-right: 8px;
`;

const DonatorName = styled.div``;
const Input = styled.input`
  width: 80%;
  height: 40px;
  border-radius: 4px;
  /* border-width: 1px; */
  /* border-color: whitesmoke; */
  border: 1px solid ${(props) => props.theme.borderColor};
  font-size: 16px;
  color: ${(props) => props.theme.subTextColor};
  background-color: ${(props) => props.theme.boxColor};
  /* font-weight: bold; */
`;
const DonatePrice = styled.div``;
const DonateMessage = styled.div``;
const MessageTextarea = styled.textarea`
  width: 80%;
  height: 100px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.borderColor};
  font-size: 16px;
  color: ${(props) => props.theme.subTextColor};
  background-color: ${(props) => props.theme.boxColor};
`;

const TotalPrice = styled.div``;
const TotalUSDC = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
const DonateButton = styled.button`
  width: 30%;
  height: 40px;
  color: #ffffff;
  background-color: ${(props) => props.theme.ownColor};
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;

export default Donation;
