import { Box, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: "bold",
    marginRight: theme.spacing(1.5),
    display: "inline-block",
    minWidth: "4vw",
  },
  value: {
    display: "inline-block",
  },
}));

const AdminProfileDataRow = ({ title, value }) => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Typography variant="body1" className={classes.title} align="right">
        {title}:
      </Typography>

      <Typography variant="body1" className={classes.value} align="right">
        {value}
      </Typography>
    </Box>
  );
};

export default AdminProfileDataRow;
