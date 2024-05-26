import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as S from "../../components/booth/boothdetail/style";
import { useParams, useLocation } from "react-router-dom";
import ReplyDeleteModal from "../../components/common/modal/promotionModal/ReplyDeleteModal";
import PromotionModal from "../../components/common/modal/promotionModal/ReplyModal";
import styled from "styled-components";
import Spinner from "../../components/common/Spinner";

const StyledTextArea = styled.textarea`
  width: 242px;
  height: 24px;
  color: ${(props) =>
    props.hasValue ? "#000" : "var(--use-font-font---disable, #C4C4C4)"};
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px; /* 150% */
  letter-spacing: -0.25px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  background-color: transparent;
  border: none;
  resize: none;
  overflow: hidden;
  &:focus {
    outline: none;
    border-color: transparent;
  }
  padding: 4px 8px;
  box-sizing: border-box;
`;

const BoothDetail = () => {
  const { id } = useParams();
  // date를 api에 포함하기 위함
  const { date } = location.state || {};
  console.log("date: ", date);
  //-----------------------
  const [boothDetail, setBoothDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const placeholderImage = "/booth/booth.png";

  useEffect(() => {
    const fetchBoothDetail = async () => {
      try {
        const response = await axios.get(
          `https://mua-dongguk-server.site/api/v1/booth/${id}?date=${date}`
        );
        console.log("부스 상세: ", response.data);
        setBoothDetail(response.data);
        setLikeCount(response.data.like_cnt);
      } catch (error) {
        console.error("Error fetching booth detail:", error);
        setError(error.message);
        // 현아의 css를 위한 임의 코드-------
        setBoothDetail({
          id: 1,
          name: "String",
          description: "String",
          operator: "String",
          location: "String",
          during: "String",
          like_cnt: "Number",
          is_liked: true,
          images: ["", ""],
        });
        //-----------------------------------
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `https://mua-dongguk-server.site/api/v1/booth/${id}/comments`
        );

        console.log("부스 댓글: ", response.data);
        const formattedComments = response.data.map((comment) => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
        }));

        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchBoothDetail();
    fetchComments();
  }, [id]);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? boothDetail.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === boothDetail.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    console.log("댓글이 삭제되었습니다.");
    setIsDeleteModalOpen(false);
  };

  const handleCommentChange = useCallback((event) => {
    setNewComment(event.target.value);
  }, []);

  const handleSubmitComment = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewComment("");
    fetchComments(); // Fetch latest comments when the modal is closed
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `https://mua-dongguk-server.site/api/v1/booth/${id}/comments`
      );

      console.log(response.data);
      const formattedComments = response.data.map((comment) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
      }));

      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // 좋아요 버튼 부분
  const handleHeartClick = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      axios
        .post(`https://mua-dongguk-server.site/api/v1/booth/${id}/likes`)
        .then((response) => {
          console.log("좋아요가 추가되었습니다.");
          console.log("Response Data:", response.data); // Log response data here
          setLikeCount((prevCount) => prevCount + 1);
        })
        .catch((error) => {
          console.error("좋아요를 추가하는 중 오류 발생:", error);
        });
    } else {
      axios
        .delete(`https://mua-dongguk-server.site/api/v1/booth/${id}/likes`)
        .then((response) => {
          console.log("좋아요가 삭제되었습니다.");
          setLikeCount((prevCount) => prevCount - 1);
        })
        .catch((error) => {
          console.error("좋아요를 삭제하는 중 오류 발생:", error);
        });
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!boothDetail) {
    return <div>No booth available</div>;
  }

  const images =
    boothDetail.images && boothDetail.images.length > 0
      ? boothDetail.images
      : [placeholderImage];

  return (
    <>
      <S.ImageContainer>
        <S.ImageNotice
          src={images[currentIndex]}
          alt={`Booth image ${currentIndex + 1}`}
          className={
            images[currentIndex] === placeholderImage ? "placeholder" : ""
          }
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImage;
          }}
        />
        {images.length > 1 && (
          <>
            <S.LeftButton onClick={handlePrevClick} />
            <S.RightButton onClick={handleNextClick} />
          </>
        )}
      </S.ImageContainer>
      <S.Pagination>
        {images.map((_, index) => (
          <S.Dot key={index} active={index === currentIndex} />
        ))}
      </S.Pagination>
      <S.Title>{boothDetail.name}</S.Title>
      <S.DetailBox>
        <S.Detail>{boothDetail.description}</S.Detail>
      </S.DetailBox>
      <S.InformationBox>
        <S.Information>
          <S.InfoIcon src="/booth/reloca.png" alt="위치" />
          {boothDetail.location}
        </S.Information>
        <S.Information>
          <S.InfoIcon src="/booth/retime.png" alt="time" />
          {boothDetail.during}
        </S.Information>
        <S.Information>
          <S.InfoIcon src="/booth/pin.png" alt="pin" />
          {boothDetail.operator}
        </S.Information>
      </S.InformationBox>
      <S.SeparationBar />
      {/* 댓글 란 */}
      <S.ReplyBox>
        <S.ReplyStart>댓글</S.ReplyStart>
        <S.ReplyCount>{comments.length}</S.ReplyCount>
      </S.ReplyBox>
      {comments.map((comment) => (
        <S.ReplyAllBox key={comment.id}>
          <S.Reply>{comment.content}</S.Reply>
          <S.ReplySub>
            <S.ReplyData>
              {new Date(comment.created_at).toLocaleDateString()}
            </S.ReplyData>
            <S.ReplyDelete onClick={handleDeleteClick}>삭제</S.ReplyDelete>
          </S.ReplySub>
        </S.ReplyAllBox>
      ))}
      {/* 댓글 입력란 */}
      <S.BottomBox>
        <S.Heart>
          <S.HeartButton
            src={isLiked ? "/booth/fullheart.png" : "/booth/heart.svg"}
            alt="좋아요"
            onClick={handleHeartClick}
          />{" "}
          <S.HeartCount>{likeCount}</S.HeartCount>
        </S.Heart>
        <S.WriteReply>
          <StyledTextArea
            hasValue={newComment.trim().length > 0}
            value={newComment}
            onChange={handleCommentChange}
            placeholder="댓글을 입력하세요"
          />
          <S.SendReply
            src={
              newComment.trim().length > 0
                ? "../booth/colorsend.png"
                : "../booth/send.png"
            }
            alt="전송"
            onClick={handleSubmitComment}
          />
        </S.WriteReply>
      </S.BottomBox>
      {isModalOpen && (
        <PromotionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          description={newComment}
          title="비밀번호 설정"
          id={id}
          onCommentSubmit={fetchComments} // Pass the fetchComments function to PromotionModal
        />
      )}
      {isDeleteModalOpen && (
        <ReplyDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default BoothDetail;
