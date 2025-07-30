import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { MdAdminPanelSettings, MdPerson } from "react-icons/md";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { BorderBeam } from "../ui/border-beam";

export default function AlignItemsList({
  members,
  onMakeAdmin,
  setShowAdmin,
  setIsAdmin,
  setUserId,
}) {
  const [{ userInfo }, dispatch] = useStateProvider();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.match(
      /^\/(avatars|heroavatars|icons)|^https:\/\/lh3\.googleusercontent\.com/
    )
      ? imagePath
      : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const isUserInGroup = members.some((m) => m.user.id === userInfo?.id);
  const isUserAdmin = members.some(
    (m) => m.user.id === userInfo?.id && m.role === "ADMIN"
  );

  return (
    <>
      <List
        sx={{
          width: "100%",
          bgcolor: "transparent",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: "white",
        }}
      >
        {members
          .slice() // Create a shallow copy to avoid mutating the original array
          .sort((a, b) => (a.role === "ADMIN" ? -1 : 1)) // Sort admins first
          .map((member, index) => (
            <React.Fragment key={index}>
              <ListItem
                alignItems="flex-start"
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{ objectFit: "fill" }}
                      alt={member?.user?.name}
                      src={getImageUrl(member?.user?.profilePicture)}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color: "white",
                          fontFamily: "ui-sans-serif, system-ui, sans-serif",
                        }}
                      >
                        {userInfo?.id === member?.user?.id
                          ? member?.user?.name + " ( You )"
                          : member?.user?.name}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: "#9CA3AF",
                            fontFamily: "ui-sans-serif, system-ui, sans-serif",
                            display: "inline",
                          }}
                        >
                          {member?.user?.email}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: "#9CA3AF",
                            fontFamily: "ui-sans-serif, system-ui, sans-serif",
                            display: "inline",
                          }}
                        >
                          {` -- ${
                            member?.user?.about === ""
                              ? "No status"
                              : truncateText(member?.user?.about, 50)
                          }`}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {/* Role Icon */}
                  {member?.role === "ADMIN" ? (
                    <MdAdminPanelSettings
                      title="Admin"
                      size={24}
                      color="gold"
                    />
                  ) : (
                    <MdPerson title="Member" size={24} color="#057e39" />
                  )}

                  {/* If user is in group and is an admin, show buttons */}
                  {isUserInGroup && isUserAdmin && (
                    <>
                      {member?.role === "ADMIN" ? (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            minWidth: "auto",
                            padding: "2px 6px",
                            fontSize: "0.7rem",
                            fontFamily: "ui-sans-serif, system-ui, sans-serif",
                            color: "white",
                            borderColor: "#d81718",
                            backgroundColor: "#c1282d",
                            "&:hover": {
                              color: "white",
                              borderColor: "#c1282d",
                              backgroundColor: "#ff2122",
                            },
                          }}
                          //   onClick={() => onMakeAdmin(member?.user?.id)}
                          onClick={() => {
                            setUserId(member?.user?.id);
                            setIsAdmin(false);
                            dispatch({
                              type: reducerCases.BIG_IMAGE,
                              bigImage: 20,
                            });
                            setShowAdmin(true);
                          }}
                        >
                          Remove Admin
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            minWidth: "auto",
                            padding: "2px 6px",
                            fontSize: "0.7rem",
                            fontFamily: "ui-sans-serif, system-ui, sans-serif",
                            color: "white",
                            borderColor: "#057e39",
                            backgroundColor: "#057e39",
                            "&:hover": {
                              color: "white",
                              borderColor: "#00d348",
                              backgroundColor: "#00d348",
                            },
                          }}
                          //   onClick={() => onMakeAdmin(member?.user?.id)}
                          onClick={() => {
                            setUserId(member?.user?.id);
                            setIsAdmin(true);
                            dispatch({
                              type: reducerCases.BIG_IMAGE,
                              bigImage: 20,
                            });
                            setShowAdmin(true);
                          }}
                        >
                          Make Admin
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </ListItem>
              <Divider
                sx={{ bgcolor: "white" }}
                variant="inset"
                component="li"
              />
            </React.Fragment>
          ))}
      </List>
    </>
  );
}
