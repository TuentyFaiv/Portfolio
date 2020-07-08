import styled from 'styled-components';
import Img from "gatsby-image";

export const Container = styled.article`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  border-radius: 0;
  box-shadow: 1px 1px 6px 0 rgba(0, 0, 0, 0.2);
  flex-direction: column;
  transition: box-shadow ease 0.35s;
  transition-property: box-shadow;
  transition-duration: 0.35s;
  transition-timing-function: ease;
  transition-delay: 0s;
  &:hover {  
    box-shadow: 1px 1px 9px 3px rgba(0, 0, 0, .2), 6px 6px 0px 0px ${props => props.shadowColor ? props.shadowColor : '#961E1E'};
    cursor: pointer;
  }
`;

export const Image = styled(Img)`
  min-height: 180px;
  max-height: 256px;
`;

export const Content = styled.div`
  padding: 1rem;
  h3 {
    margin-bottom: 0;
  }
  p {
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media screen and (max-width: 580px) {
    p {
      -webkit-line-clamp: 3;
    }
  }

  @media screen and (max-width: 460px) {
    p {
      -webkit-line-clamp: 3;
    }
  }
`;
