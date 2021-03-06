import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import NavigateBeforeicon from "@material-ui/icons/NavigateBefore";
import NavigateNexticon from "@material-ui/icons/NavigateNext";
import FormControl from "@material-ui/core/FormControl";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import { grey } from "@material-ui/core/colors";

import LangOptions from "./LangOptions";
import { LangSelectProps } from "../../../../types";
import { SvgIconProps } from "@material-ui/core";

const useStyles = makeStyles({
  menuItem: {
    minHeight: "1.1rem",
    paddingTop: "0px",
    paddingBottom: "0px",
  },
  select: {
    width: 140,
    background: "white",
    color: grey[600],
    fontWeight: 200,
    fontSize: 12,
    borderStyle: "none",
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 0,
    paddingLeft: 16,
    paddingTop: 10,
    paddingBottom: 10,
    boxShadow: "0px 5px 8px -3px rgba(0,0,0,0.14)",
    "&:focus": {
      borderRadius: 12,
      background: "white",
      borderColor: grey[100],
    },
  },
  icon: {
    color: grey[500],
    right: 8,
    position: "absolute",
    userSelect: "none",
    pointerEvents: "none",
  },
  paper: {
    borderRadius: 12,
    marginTop: 4,
    maxHeight: "80%",
    maxWidth: "40%",
    top: "7px",
  },
  list: {
    overflowY: "scroll",
    overflowX: "hidden",
    paddingTop: 0,
    paddingBottom: 0,
    background: "white",
    "& li": {
      fontSize: 12,
      fontWeight: 200,
      color: grey[800],
      paddingTop: 2,
      paddingBottom: 2,
    },
    "& li:hover": {
      background: grey[100],
    },
    "& li.Mui-selected": {
      color: "white",
      background: grey[400],
    },
    "& li.Mui-selected:hover": {
      background: grey[500],
    },
  },
});

function LangSelect({ language, changeHandler }: LangSelectProps) {
  const classes = useStyles();

  const verticalAnchor: number | "top" | "center" | "bottom" = "bottom";
  const horizontalAnchor: number | "left" | "center" | "right" = "left";
  const verticalTransform: number | "top" | "center" | "bottom" = "top";
  const horizontalTransform: number | "left" | "center" | "right" = "left";

  // moves the menu below the select input
  const menuProps = {
    classes: {
      paper: classes.paper,
      list: classes.list,
    },
    anchorOrigin: {
      vertical: verticalAnchor,
      horizontal: horizontalAnchor,
    },
    transformOrigin: {
      vertical: verticalTransform,
      horizontal: horizontalTransform,
    },
    getContentAnchorEl: null,
  };

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    changeHandler(event.target.value as string);
  };

  const iconComponent = (props: SvgIconProps) => {
    return <ExpandMoreIcon className={props.className + " " + classes.icon} />;
  };

  return (
    <FormControl>
      <Select
        disableUnderline
        classes={{ root: classes.select }}
        MenuProps={menuProps}
        IconComponent={iconComponent}
        value={language}
        onChange={(event) => {
          handleSelectChange(event);
        }}
        inputProps={{
          "aria-label": "language",
        }}
      >
        {LangOptions.map((option) => {
          return (
            <MenuItem dense={true} value={option.value} key={option.value}>
              <Typography>{option.label}</Typography>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

function LangSelectBar({ language, changeHandler }: LangSelectProps) {
  const getLangIndex = (value: string) => {
    const currentLang = LangOptions.find((element) => element.value === value);
    if (currentLang) {
      const index = LangOptions.indexOf(currentLang);
      return index;
    } else {
      throw new Error("currentLang not found");
    }
  };

  const previousLang = () => {
    const newIndex =
      (getLangIndex(language) - 1 + LangOptions.length) % LangOptions.length;
    changeHandler(LangOptions[newIndex].value);
  };

  const nextLang = () => {
    const newIndex = (getLangIndex(language) + 1) % LangOptions.length;
    changeHandler(LangOptions[newIndex].value);
  };

  return (
    <Grid container spacing={1} justify="center" alignItems="center">
      <Grid item>
        <IconButton
          size="small"
          color="secondary"
          onClick={() => {
            previousLang();
          }}
        >
          <NavigateBeforeicon />
        </IconButton>
      </Grid>
      <Grid item>
        <LangSelect language={language} changeHandler={changeHandler} />
      </Grid>
      <Grid item>
        <IconButton
          size="small"
          color="secondary"
          onClick={() => {
            nextLang();
          }}
        >
          <NavigateNexticon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default LangSelectBar;
