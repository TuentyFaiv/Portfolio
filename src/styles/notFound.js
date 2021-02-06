import styled from 'styled-components';
import { Button as Btn } from './home';

export const Image = styled.img`
  display: block;
  width: 300px; 
  margin: 0 auto;
`;

export const Text = styled.p`
  text-align: center;
`;

export const Button = styled(Btn)`
  display: flex;
  width: 310px;
  margin: 5px auto;
`;
