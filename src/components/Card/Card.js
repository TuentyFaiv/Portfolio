import React from 'react';
import { Link } from "gatsby";
import Img from "gatsby-image";

const Card = (props) => {
  const { slug, image, title, date, description, author } = props;
  return (
    <Link to={slug}>
      <article className="blog-card">
        <Img
          className="mdc-card__media"
          fluid={image}
        />
        <div className="blog-card-content__container">
          <h3>{title}</h3>
          <small>{date}</small>
          {" | "}
          <small>{author}</small>
          <p
            dangerouslySetInnerHTML={{
              __html: description
            }}
          />
        </div>
      </article>
    </Link>
  );
};

export default Card;
