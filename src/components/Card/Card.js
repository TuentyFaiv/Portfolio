import React from 'react';
import { Link } from "gatsby";
import Img from "gatsby-image";

import CardMaterial from "@material/react-card";

const Card = (props) => {
  const { slug, image, title, date, description } = props;
  return (
    <Link to={slug}>
      <CardMaterial
        className="mdc-card--clickable blog-card"
      >
        <Img
          className="mdc-card__media"
          fluid={image}
        />
        <div className="blog-card-content__container">
          <h3>{title}</h3>
          <small>{date}</small>
          <p
            dangerouslySetInnerHTML={{
              __html: description
            }}
          />
        </div>
      </CardMaterial>
    </Link>
  );
};

export default Card;
