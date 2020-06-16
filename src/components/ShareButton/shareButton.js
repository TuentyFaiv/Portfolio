import React, { useState } from 'react';
import swal from 'sweetalert';
import { Wrapper, Modal, Square } from './styles';

import shareTwitter from '../../images/icons/shareTwitter.svg';
import shareFacebook from '../../images/icons/shareFacebook.svg';
import shareIcon from '../../images/icons/master-share.png';
import shareCopyLink from '../../images/icons/copyLink.svg';

const ShareButton = ({ title, description, url }) => {
  const [modal, setModal] = useState(false);

  const handleShare = () => {
    if (navigator.share !== undefined) {
      navigator.share({
        title,
        text: description,
        url
      })
        .catch(error => swal("No se pudo compartir", "😥", "error"));
    } else {
      setModal(!modal);
    }
  };

  const copyLink = () => {
    url.toString();
    navigator.clipboard.writeText(url).then(() => {
      swal("Url copiada", `${url}`, "success");
    }, () => {
      swal("No se pudo compartir", "😥", "error");
    });
  };

  return (
    <Wrapper>
      <button onClick={handleShare}>
        <img src={shareIcon} alt="Share Icon" />
        <p>Compartir</p>
      </button>
      {
        modal &&
        <>
          <Modal>
            <a
              href={`https://twitter.com/intent/tweet?url=${url}&text=${title}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={shareTwitter}
                alt="Share for Twitter"
                onClick={() => setModal(!modal)}
              />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${url}&display=popup`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={shareFacebook}
                alt="Share for Facebook"
                onClick={() => setModal(!modal)}
              />
            </a>
            <img
              src={shareCopyLink}
              alt="Copy Link"
              onClick={() => { copyLink(); setModal(!modal); }}
            />
          </Modal>
          <Square />
        </>
      }
    </Wrapper>
  );
};

export default ShareButton;
