import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import BasicSection, { Title } from "./Tag/BasicSection";

export const Intro = () => {
  return (
    <Wrapper data-aos="fade-up" data-aos-duration="2000" id="shortIntro">
      <BasicSection
        size={200}
        introTitle="SOLNIVERSE"
        introContent="SOLNIVERSE는 SOL(Solana)와 UNIVERSE 의 합성어입니다."
        imageUrl="/favicon.ico"
        title="Solana 블록체인으로"
        title2="국가 간의 장벽과 수수료를 내려놓은"
        title3="새로운"
        title4="인터넷 방송 후원 플랫폼"
      >
        <p>
          저희 솔니버스(SOLNIVERSE)는 Solana 블록체인 네트워크와 Universe가
          합쳐져 세상 모든 곳에서 손쉽게 사용할 수 있는 블록체인 결제 시스템을
          의미합니다. 현재는 팬텀 월렛을 통해 서비스를 제공합니다.
          <Phantom>
            <a href="https://phantom.app/">
              팬텀 월렛 확장 프로그램이 아직 없으신가요?{" "}
            </a>
          </Phantom>
          팬텀 월렛과 함께 솔니버스를 즐겨보아요 !
        </p>
      </BasicSection>
    </Wrapper>
  );
};
export const Phantom = styled.span`
  color: ${(props) => props.theme.ownColor};
  :hover {
    background-color: ${(props) => props.theme.ownColor};
    color: white;
  }
  transition-duration: 300ms;
`;

const Wrapper = styled.div`
  padding-top: 10%;
`;
