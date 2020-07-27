import React, { useState } from 'react';
import swal from 'sweetalert';
import { FaTwitter, FaFacebook } from 'react-icons/fa';
import { MdShare, MdLink } from 'react-icons/md';

import { Wrapper, Modal, Square } from './styles';

const ShareButton = ({ title, description, url, dark }) => {
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
    <Wrapper dark={dark}>
      <button onClick={handleShare}>
        <MdShare size={45} />
        <p>Compartir</p>
      </button>
      {
        modal &&
        <>
          <Modal dark={dark}>
            <a
              href={`https://twitter.com/intent/tweet?url=${url}&text=${title}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter
                title="Compartir por Twitter"
                size={28}
                onClick={() => setModal(!modal)}
              />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${url}&display=popup`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook
                title="Compartir por Facebook"
                size={28}
                onClick={() => setModal(!modal)}
              />
            </a>
            <MdLink
              title="Copiar enlace"
              className="copy"
              size={30}
              onClick={() => { copyLink(); setModal(!modal); }}
            />
          </Modal>
          <Square dark={dark} />
        </>
      }
    </Wrapper>
  );
};

export default ShareButton;
