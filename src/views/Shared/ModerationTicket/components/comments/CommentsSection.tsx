import { useState } from "react";
import { Flex, Headline } from "brainly-style-guide";

import type { CommonDataInTicketType } from "@typings/";
import _API from "@lib/api/Brainly/Legacy";

import Flash from "@utils/flashes";

import Comment from "./Comment";
import AdaptiveButton from "@styleguide/AdaptiveButton";

export default function CommentsSection(props: {
  comments: CommonDataInTicketType[];
}) {
  const [hidden, setHidden] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [comments, setComments] = useState(props.comments);
  const [ignoredComments, setIgnoredComments] = useState<number[]>([]);

  const deleteComment = async (commentId: number, withWarn: boolean) => {
    try {
      await _API.DeleteComment({ id: commentId, warn: withWarn });

      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) comment.deleted = true;
          return comment;
        })
      );
    } catch (err) {
      Flash("error", err);
    }
  };

  const deleteAllComments = async () => {
    if (!confirm(locales.doYouWantToDeleteAllComments)) return;

    setIsDeleting(true);
  
    notDeletedComments.forEach(async (comment, thisCommentIndex) => {
      if (!ignoredComments.includes(comment.id)) await deleteComment(comment.id, false);

      let lastCommentIndex = notDeletedComments.length - 1;
      if (thisCommentIndex === lastCommentIndex) setIsDeleting(false);
    });
  };

  const notDeletedComments = comments.filter(comment => !comment.deleted);

  return (
    <Flex direction="column" justifyContent="space-between" marginTop="s">
      <Flex justifyContent="space-between">
        <Flex className="gap-s" alignItems="center">
          <Headline color="text-indigo-60" extraBold size="small">
            {locales.comments} [{notDeletedComments.length}]
          </Headline>
          <AdaptiveButton 
            type="solid-indigo-inverted"
            size="s"
            onClick={_ => setHidden(prevState => !prevState)} 
            icon={{ type: hidden ? "arrow_down" : "arrow_up" }}
          />
        </Flex>
        {System.viewer.canDeleteCommentsInBulk &&
          <AdaptiveButton disabled={isDeleting || !notDeletedComments.length} type="solid-peach" onClick={deleteAllComments}>
            {locales.deleteAllComments}
          </AdaptiveButton>
        }
      </Flex>
      <Flex className="moderation-ticket-comments-list" disabled={isDeleting} hidden={hidden} marginTop="xs" direction="column">
        {comments.map(comment => 
          <Comment 
            onIgnore={(id, ignored) => {
              if (!ignored) {
                setIgnoredComments(prevState => 
                  prevState.filter(commentId => commentId !== id)
                );
              } else {
                setIgnoredComments(prevState => [...prevState, id]);
              }
            }}
            onDelete={deleteComment} 
            data={comment} 
            key={comment.id} 
          />
        )}
      </Flex>
    </Flex>
  );
}