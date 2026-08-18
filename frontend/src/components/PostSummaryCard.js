"use client";

import { Avatar, Card, CardContent, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Link from "next/link";
import {
  calculateReadingTime,
  convertToText,
  getAuthorNameInitials,
} from "../utils/dataFormat";
import { getPostFormattedDate } from "../utils/dateUtils";

const useStyles = makeStyles((theme) => ({
  container: {
    height: theme.spacing(20),
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  authorInfoContainer: {
    marginLeft: theme.spacing(0.5),
  },
  postTitle: {
    textDecoration: "none",
    fontWeight: theme.typography.fontWeightBold,
    display: "block",
    color: theme.palette.text.primary,
    [theme.breakpoints.down('md')]: {
      fontSize: theme.typography.subtitle1.fontSize,
    },
    marginTop: theme.spacing(1.5),
  },
  authorName: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
}));

const PostSummaryCard = ({
  postId,
  authorId,
  authorImageURL,
  authorName,
  postTitle,
  publishDate,
  description,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.container} variant="outlined" elevation={0}>
      <CardContent className={classes.cardContent}>
        <Grid container direction="column" spacing={2}>
          <Grid
            container
            alignItems="center"
            className={classes.authorInfoContainer}
          >
            {authorImageURL ? (
              <Avatar
                className={classes.avatar}
                src={authorImageURL}
                alt={authorName}
              />
            ) : (
              <Avatar className={classes.avatar}>
                {getAuthorNameInitials(authorName)}
              </Avatar>
            )}
            <Typography
              className={classes.authorName}
              variant="caption"
              component={Link}
              href={`/authors/${authorId}`}
            >
              {authorName}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              className={classes.postTitle}
              variant="body1"
              gutterBottom
              component={Link}
              href={`/posts/${postId}`}
            >
              {postTitle}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="caption" style={{ justifySelf: "flex-end" }}>
              {getPostFormattedDate(publishDate)} ·{" "}
              {calculateReadingTime(convertToText(description))} min read
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PostSummaryCard;
