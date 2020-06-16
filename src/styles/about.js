import styled from 'styled-components';

export const Content = styled.div`
  .title-center {
    width: 100%;
    margin: 40px 0 20px;
    text-align: center;
    font-family: 'Segoe UI', sans-serif;
  }

  .infoContact {
    &-center {
      width: 90%;
      margin: 0 auto;
      text-align: center;
    }
    &-mail{
      font-weight: bold;
      a {
        padding: 2px 0;
        color: var(--mdc-theme-secondary);
        border-bottom: 1px solid transparent;
        &:hover {
          cursor: pointer;
          border-bottom: 1px solid var(--mdc-theme-secondary);
        }
      }
    }
  }

  .list_socials {
    width: 90%;
    margin: 20px auto;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-wrap: wrap;
    li {
      margin: 20px 0;
      a {
        display: flex;
        align-items: center;
        padding: 5px 0;
        border-bottom: 1px solid transparent;
        img {
          width: 32px;
          height: 32px;
          object-fit: cover;
          margin-right: 10px;
        }
        h4 {
          font-family: 'Segoe UI', sans-serif;
        }
        &:hover {
          cursor: pointer;
          color: var(--mdc-theme-secondary);
          border-bottom: 1px solid var(--mdc-theme-secondary);
        }
      }
    } 
  }

  @media screen and (min-width: 801px) {
    margin: 0 22%;
    width: 56%;
  }

  @media screen and (max-width: 800px) {
    margin: 0 15%;
    width: 70%;
  }

  @media screen and (max-width: 510px) {
    margin: 0;
    width: 100%;

    .list_socials {
      width: 100%;
      li {
        margin: 10px 0;
        a {
          img {
            width: 28px;
            height: 28px;
          }
        }
      }
    }
  }
`;
