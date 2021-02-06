import styled from 'styled-components';

export const Content = styled.section`
  width: 100%;
  margin: 0;

  @media screen and (min-width: 510px) {
    margin: 0 15%;
    width: 70%;
  }

  @media screen and (min-width: 801px) {
    margin: 0 22%;
    width: 56%;
  }
`;

export const Info = styled(Content)`
  width: 90%;
  margin: 0 auto;
  text-align: center;

  .mail{
    font-weight: bold;
    a {
      padding: 2px 0;
      color: var(--theme-secondary);
      border-bottom: 1px solid transparent;
      &:hover {
        cursor: pointer;
        border-bottom: 1px solid var(--theme-secondary);
      }
    }
  }
`;

export const SubTitle = styled.h3`
  width: 100%;
  margin: 40px 0 20px;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
`;

export const Socials = styled.ul`
  width: 100%;
  margin: 20px auto;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  flex-wrap: wrap;
  li {
    margin: 15px 0;
    a {
      display: flex;
      align-items: center;
      padding: 5px 0;
      border-bottom: 1px solid transparent;
      svg {
        margin-right: 10px;
      }
      img {
        width: 28px;
        height: 28px;
      }
      h4 {
        font-family: 'Segoe UI', sans-serif;
      }
      &:hover {
        cursor: pointer;
        color: ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
        border-bottom: 1px solid ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
      }
    }
  }

  @media screen and (min-width: 510px) {
    width: 90%;
    li {
      margin: 20px 0;
      a {
        img {
          width: 32px;
          height: 32px;
        }
      }
    }
  }

  @media screen and (min-width: 650px) {
    flex-direction: row;
  }
`;