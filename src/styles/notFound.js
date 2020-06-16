import styled from 'styled-components';

export const Image = styled.img`
  display: block;
  width: 300px; 
  margin: 0 auto;
`;


export const Button = styled.button`
  display: block;
  margin: 0 auto;
  padding: 0 16px;
  color: var(--mdc-theme-on-primary, #fff);
  background-color: var(--mdc-theme-primary, #6200ee);
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.09em;
  text-decoration: none;
  text-transform: uppercase;
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
  border-radius: 4px;
  &:hover {
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    cursor: pointer;
  }
`;