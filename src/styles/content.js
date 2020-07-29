import styled from 'styled-components';

export const GridPosts = styled.div`
  width: 100%;
  display: grid;
  margin-bottom: 3.5em;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 2em;
  row-gap: 2em;

  @media screen and (min-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 2em;
    row-gap: 2em;
  }

  @media screen and (max-width: 800px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 1.5em;
    row-gap: 1.5em;
  }

  @media screen and (max-width: 580px) {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    column-gap: 1.2em;
    row-gap: 1.2em;
  }
`;

export const NoContent = styled.h3`
  margin: 5em 0;
  font-family: 'Lato', sans-serif;
`;

export const MainSection = styled.section`
  min-height: 80vh;
`;