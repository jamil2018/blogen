import { Chip, makeStyles } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { memo } from "react";
import { Link } from "react-router-dom";

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
      to={`/posts/search/categories/${category.title}`}
      className={classes.categoryChip}
      label={category.title}
      variant="outlined"
    />
  ));
});

export default HomeCategoriesDeck;
