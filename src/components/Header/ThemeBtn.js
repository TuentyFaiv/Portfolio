import React from "react";
import { MdBrightness2, MdBrightness5 } from "react-icons/md";
import { ThemeBtn as Container } from './styles';

const ThemeBtn = ({ dark, func }) => {
  return (
    <Container onClick={func} dark={dark}>
      <div className={!dark ? 'moveLeft' : 'moveRight'}>
        {!dark ? <MdBrightness5 color="#961E1E" size={25} /> : <MdBrightness2 color="#006342" size={25} />}
      </div>
    </Container>
  );
};

export default ThemeBtn;