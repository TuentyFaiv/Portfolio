import React from "react";
import { Link } from "gatsby";
import { useGlobalState } from "../../context/Context";
import { Container, Image, Content } from "./styles";

const Card = (props) => {
  const [{ dark }] = useGlobalState();
  const { slug, image, title, date, description, author, color } = props;
  return (
    <Link to={slug} aria-label={title}>
      <Container shadowColor={color} dark={dark}>
        <Image
          fluid={image}
        />
        <Content>
          <h3>{title}</h3>
          <small>{date}</small>
          {" | "}
          <small>{author}</small>
          <p
            dangerouslySetInnerHTML={{
              __html: description
            }}
          />
        </Content>
      </Container>
    </Link>
  );
};

export default Card;
