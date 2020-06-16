import React from "react";
import { Link } from "gatsby";
import { Container, Image, Content } from "./styles";

const Card = (props) => {
  const { slug, image, title, date, description, author } = props;
  return (
    <Link to={slug}>
      <Container>
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
