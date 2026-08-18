"use client";

import { Chip } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { grey } from "@mui/material/colors";
import { memo } from "react";
import Link from "next/link";

const useStyles = makeStyles((theme) => ({
  categoryChip: {
    marginLeft: theme.spacing(2),
    margin: theme.spacing(1, 0),
    "&:hover": {
      cursor: "pointer",
      backgroundColor: grey[100],
    },
  },
}));

const HomeCategoriesDeck = memo(({ categories }) => {
  const classes = useStyles();
  return categories.map((category) => (
    <Chip
      key={category._id}
      component={Link}
      href={`/posts/search/categories/${category.title}`}
      className={classes.categoryChip}
      label={category.title}
      variant="outlined"
    />
  ));
});

export default HomeCategoriesDeck;
