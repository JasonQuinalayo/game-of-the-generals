/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import RankToImgId from '../RANK_TO_IMG_ID';
import general5Img from '../piecesImages/general5.jpg';
import general4Img from '../piecesImages/general4.png';
import general3Img from '../piecesImages/general3.png';
import general2Img from '../piecesImages/general2.png';
import general1Img from '../piecesImages/general1.png';
import colonel3Img from '../piecesImages/colonel3.png';
import colonel2Img from '../piecesImages/colonel2.png';
import captainImg from '../piecesImages/captain.png';
import lieutenant1Img from '../piecesImages/lieutenant1.png';
import lieutenatn2Img from '../piecesImages/lieutenant2.png';
import majorImg from '../piecesImages/major.png';
import sergeantImg from '../piecesImages/sergeant.png';
import privateImg from '../piecesImages/private.png';
import spyImg from '../piecesImages/spy.png';
import flagImg from '../piecesImages/flag.png';

const Logos = ({ setImagesLoaded }) => {
  const handleImageLoad = () => {
    setImagesLoaded((imagesLoaded) => imagesLoaded + 1);
  };
  return (
    <div style={{ display: 'none' }}>
      <img src={general5Img} id={RankToImgId.General5} onLoad={handleImageLoad} />
      <img src={general4Img} id={RankToImgId.General4} onLoad={handleImageLoad} />
      <img src={general3Img} id={RankToImgId.General3} onLoad={handleImageLoad} />
      <img src={general2Img} id={RankToImgId.General2} onLoad={handleImageLoad} />
      <img src={general1Img} id={RankToImgId.General1} onLoad={handleImageLoad} />
      <img src={colonel3Img} id={RankToImgId.Colonel3} onLoad={handleImageLoad} />
      <img src={colonel2Img} id={RankToImgId.Colonel2} onLoad={handleImageLoad} />
      <img src={captainImg} id={RankToImgId.Captain} onLoad={handleImageLoad} />
      <img src={lieutenant1Img} id={RankToImgId.Lieutenant1} onLoad={handleImageLoad} />
      <img src={lieutenatn2Img} id={RankToImgId.Lieutenant2} onLoad={handleImageLoad} />
      <img src={majorImg} id={RankToImgId.Major} onLoad={handleImageLoad} />
      <img src={sergeantImg} id={RankToImgId.Sergeant} onLoad={handleImageLoad} />
      <img src={privateImg} id={RankToImgId.Private} onLoad={handleImageLoad} />
      <img src={spyImg} id={RankToImgId.Spy} onLoad={handleImageLoad} />
      <img src={flagImg} id={RankToImgId.Flag} onLoad={handleImageLoad} />
    </div>
  );
};
export default Logos;
