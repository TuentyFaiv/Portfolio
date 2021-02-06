import styled from 'styled-components';
import { Button as Btn } from './home';

export const Widget = styled.div`
  min-width: 280px;
  min-height: 800px;
  height: 800px;
  margin: 0 0 40px;
  overflow-y: none;
`;

export const Button = styled(Btn)`
  display: flex;
  width: 310px;
  margin: 5px auto;
`;
