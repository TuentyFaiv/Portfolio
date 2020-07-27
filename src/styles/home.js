import styled from 'styled-components';

export const SectionOne = styled.section`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: left;
  & > h3 {
    margin: 0 auto;
    text-align: center;
  }
  & > img {
    max-width: 336px;
    object-fit: cover;
  }
  @media screen and (min-width: 1024px) {
    & > img {
      max-width: 800px;
      height: 450px;
    }
  }

  @media screen and (max-width: 1023px) {
    & > img {
      max-width: 700px;
      height: 400px;
    }
  }

  @media screen and (max-width: 800px) {
    & > img {
      max-width: 600px;
      height: 350px;
    }
  }

  @media screen and (max-width: 768px) {
    min-height: 90vh;
  }

  @media screen and (max-width: 610px) {
    & > img {
      max-width: 500px;
      height: 300px;
    }
  }

  @media screen and (max-width: 510px) {
    & > img {
      width: 450px;
      height: 250px;
    }
  }

  @media screen and (max-width: 460px) {
    & > img {
      width: 375px;
      height: 225px;
    }
  }

  @media screen and (max-width: 375px) {
    & > img {
      width: 320px;
      height: 190px;
    }
  }

  @media screen and (max-width: 320px) {
    & > img {
      min-width: 300px;
      max-width: 250px;
      height: 180px;
    }
  }
`;

export const SectionOneOverlay = styled.div`
  position: relative;
  display: flex;
  max-width: 800px;
  height: 450px;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  img {
    position: absolute;
  }
  h1 {
    position: relative;
    color: white;
    font-family: 'Roboto', sans-serif;
    text-align: center;
  }
  p {
    position: relative;
    text-align: center;
  }

  @media screen and (max-width: 1023px) {
    max-width: 700px;
    height: 400px;
  }

  @media screen and (max-width: 800px) {
    max-width: 600px;
    height: 350px;
  }

  @media screen and (max-width: 610px) {
    max-width: 500px;
    height: 300px;
  }

  @media screen and (max-width: 510px) {
    max-width: 450px;
    height: 250px;
  }

  @media screen and (max-width: 460px) {
    max-width: 375px;
    height: 225px;
    h1 {
      font-size: 30px;
    }
  }

  @media screen and (max-width: 375px) {
    max-width: 320px;
    height: 190px;
    h1 {
      font-size: 20px;
    }
  }

  @media screen and (max-width: 320px) {
    max-width: 300px;
    height: 180px;
  }
`;

export const Overlay = styled.span`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.3);
`;

export const SectionTwo = styled.section`
  width: 100%;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  background: ${({ dark }) => dark ? 'linear-gradient(130deg, var(--theme-dark) 0%, rgb(0, 99, 66) 100%)' : 'linear-gradient(130deg, rgb(150, 30, 30) 0%, rgb(170, 60, 60) 100%)'};
  color: var(--content);
  padding: 1rem;
  justify-content: center;
  h2 {
    margin: 1.75rem;
    a {
      color: cyan;
      text-decoration: underline;
    }
  }

  @media screen and (max-width: 800px) {
    h2 {
      margin: 1.8rem 1.4rem;
      font-size: 24px;
    }
  }

  @media screen and (max-width: 610px) {
    h2 {
      margin: 1.6rem 1.2rem;
      font-size: 22px;
    }
  }

  @media screen and (max-width: 510px) {  
    h2 {
      margin: 1.4rem 1rem;
    }
  }

  @media screen and (max-width: 460px) {
    h2 {
      margin: 1.2rem .25rem;
      font-size: 20px;
    }
  }

  @media screen and (max-width: 375px) {
    h2 {
      margin: 1rem .25rem;
    }
  }
`;

export const SectionThree = styled.section`
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  & > h2:first-of-type {
    font-family: 'Roboto', sans-serif;
    margin: 2rem;
  }
`;

export const Button = styled.button`
  border-radius: 25px;
  background-color: var(--theme);
  color: var(--content);
  will-change: transform, opacity;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 16px;
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.09em;
  text-decoration: none;
  text-transform: uppercase;
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  height: 36px;
  border: none;
  outline: none;
  line-height: inherit;
  user-select: none;
  overflow: hidden;
  vertical-align: middle;
  &:hover {
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    cursor: pointer;
  }
`;
